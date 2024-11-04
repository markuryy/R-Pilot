#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));
const isWindows = process.platform === 'win32';

async function detectR() {
  try {
    const cmd = isWindows ? 'where R' : 'which R';
    const rPath = execSync(cmd, { encoding: 'utf8' }).trim();
    if (rPath) {
      console.log(`✓ Found R at: ${rPath}`);
      const useDetected = await question('Use this R installation? [Y/n]: ');
      if (useDetected.toLowerCase() !== 'n') {
        return rPath;
      }
    }
  } catch (error) {
    console.log('⚠️  R not found in PATH');
  }

  console.log('\nPlease install R or provide path to existing installation:');
  console.log('1. Install R from https://www.r-project.org/');
  console.log('2. Or specify custom path if R is installed elsewhere\n');

  const customPath = await question('R path (press enter to exit): ');
  if (!customPath) {
    console.error('❌ R is required. Please install R and run setup again.');
    process.exit(1);
  }
  return customPath;
}

function getPythonPath(cmd) {
  try {
    if (isWindows) {
      return execSync(`${cmd} -c "import sys; print(sys.executable)"`, { encoding: 'utf8' }).trim();
    } else {
      return execSync(`which ${cmd}`, { encoding: 'utf8' }).trim();
    }
  } catch (error) {
    return null;
  }
}

function checkPythonVersion(cmd) {
  try {
    const version = execSync(`${cmd} -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')"`, { encoding: 'utf8' }).trim();
    const [major, minor] = version.split('.').map(Number);
    
    // Check if version is between 3.9 and 3.12
    if (major === 3 && minor >= 9 && minor <= 12) {
      return { version, path: getPythonPath(cmd) };
    }
    console.error(`\n❌ Python version ${version} is not supported.`);
    console.error('Please install Python version 3.9-3.12');
    if (isWindows) {
      console.error('Download from: https://www.python.org/downloads/');
    }
    return null;
  } catch (error) {
    return null;
  }
}

function checkPython() {
  // Try different Python commands that might exist
  const pythonCommands = isWindows ? ['python', 'py -3', 'python3'] : ['python3', 'python', 'py'];
  
  for (const cmd of pythonCommands) {
    try {
      execSync(`${cmd} --version`, { stdio: 'ignore' });
      const result = checkPythonVersion(cmd);
      if (result) {
        console.log(`✓ Found Python ${result.version} at: ${result.path}`);
        // Store the working Python path for later use
        process.env.PYTHON_PATH = result.path;
        process.env.PYTHON_CMD = cmd;
        return true;
      }
    } catch (error) {
      continue;
    }
  }
  
  console.error('\n❌ Compatible Python version not found.');
  console.error('Please install Python version 3.9-3.12');
  if (isWindows) {
    console.error('Download from: https://www.python.org/downloads/\n');
  }
  return false;
}

async function setupPoetry() {
  console.log('📦 Setting up Poetry...');

  // Get poetry installation path
  const poetryPath = isWindows
    ? path.join(process.env.APPDATA || path.join(process.env.USERPROFILE, 'AppData', 'Roaming'), 'Python', 'Scripts', 'poetry.exe')
    : path.join(process.env.HOME || process.env.USERPROFILE, '.local', 'bin', 'poetry');

  // Check if poetry is already installed
  try {
    execSync('poetry --version', { stdio: 'ignore' });
    console.log('✓ Poetry is already installed');
    return true;
  } catch (error) {
    console.log('Installing Poetry...');
  }

  try {
    // Install Poetry using the official installer
    if (isWindows) {
      // Download and run the Windows installer
      execSync('(Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | py -', 
        { shell: 'powershell.exe', stdio: 'inherit' });
      
      // Add Poetry to the user's PATH in Windows registry
      const poetryDir = path.dirname(poetryPath);
      execSync(`setx PATH "%PATH%;${poetryDir}"`, { stdio: 'inherit' });
      
      // Also add to current session
      process.env.PATH = `${poetryDir};${process.env.PATH}`;
    } else {
      // Install Poetry on Unix systems
      execSync('curl -sSL https://install.python-poetry.org | python3 -', { stdio: 'inherit' });
      
      // Add Poetry to PATH in shell config
      const homeDir = process.env.HOME;
      const shellConfigFile = path.join(homeDir, process.env.SHELL.includes('zsh') ? '.zshrc' : '.bashrc');
      const exportPath = `\n# Poetry\nexport PATH="$HOME/.local/bin:$PATH"\n`;
      
      if (fs.existsSync(shellConfigFile)) {
        const currentContent = fs.readFileSync(shellConfigFile, 'utf8');
        if (!currentContent.includes('$HOME/.local/bin')) {
          fs.appendFileSync(shellConfigFile, exportPath);
        }
      } else {
        fs.writeFileSync(shellConfigFile, exportPath);
      }
      
      // Add to current session
      process.env.PATH = `${path.dirname(poetryPath)}:${process.env.PATH}`;
    }

    // Verify installation
    try {
      execSync('poetry --version', { stdio: 'inherit' });
      console.log('✓ Poetry installed successfully');
      
      // Configure poetry to create virtual environments in the project directory
      execSync('poetry config virtualenvs.in-project true', { stdio: 'inherit' });
      
      return true;
    } catch (error) {
      console.error('\n❌ Poetry installation succeeded but command not found.');
      console.error('Please restart your terminal and run setup again.\n');
      return false;
    }
  } catch (error) {
    console.error('\n❌ Failed to install Poetry:', error.message);
    return false;
  }
}

async function main() {
  console.log('\n🚀 Setting up R-Pilot...\n');

  // Check Python installation
  if (!checkPython()) {
    process.exit(1);
  }

  // Install bun dependencies
  console.log('📦 Installing bun dependencies...');
  try {
    execSync('bun install', { stdio: 'inherit' });
  } catch (error) {
    console.error('\n❌ Failed to install bun dependencies. Please install bun and try again:');
    console.error('curl -fsSL https://bun.sh/install | bash\n');
    process.exit(1);
  }

  // Create .env if it doesn't exist
  if (!fs.existsSync('.env')) {
    console.log('We need a few things to get started:\n');
    
    const openaiKey = await question('1. Enter your OpenAI API key (get one at https://platform.openai.com/api-keys): ');
    console.log(''); // Empty line for readability

    // Get R path
    const rPath = await detectR();
    console.log(''); // Empty line for readability

    // Create workspace directory
    const workingDir = path.join(process.cwd(), 'workspace');
    if (!fs.existsSync(workingDir)) {
      fs.mkdirSync(workingDir, { recursive: true });
    }

    const envContent = `# Required
OPENAI_API_KEY=${openaiKey}

# Python Environment
INTERPRETER_TYPE=r
INTERPRETER_TIMEOUT=120
ENABLE_CORS=TRUE
ALLOWED_HOSTS=localhost:3000
R_PATH=${rPath}

# Frontend Environment
NEXT_PUBLIC_SERVICES_URL=http://localhost:8000

# Working Directory
WORKING_DIRECTORY=${workingDir}`;

    // Write to root .env
    fs.writeFileSync('.env', envContent);
    
    // Also write to services directory for Python
    fs.writeFileSync(path.join('apps', 'api', 'services', '.env'), envContent);
    
    console.log('✅ Created .env files with your configuration\n');
  } else {
    // If .env exists but R_PATH is missing, update it
    try {
      const envContent = fs.readFileSync('.env', 'utf8');
      if (!envContent.includes('R_PATH=')) {
        const rPath = await detectR();
        const updatedContent = envContent + `\nR_PATH=${rPath}`;
        
        // Update both env files
        fs.writeFileSync('.env', updatedContent);
        fs.writeFileSync(path.join('apps', 'api', 'services', '.env'), updatedContent);
        
        console.log('✅ Updated .env files with R path\n');
      }
    } catch (error) {
      console.error('Failed to update .env files:', error);
      process.exit(1);
    }
  }

  // Setup NextJS environment
  const webEnvExample = path.join('apps', 'web', '.env.local.example');
  const webEnv = path.join('apps', 'web', '.env.local');
  if (fs.existsSync(webEnvExample) && !fs.existsSync(webEnv)) {
    fs.copyFileSync(webEnvExample, webEnv);
    console.log('✅ Created NextJS environment configuration\n');
  }

  // Setup Poetry and install dependencies
  if (!await setupPoetry()) {
    console.error('\n❌ Failed to setup Poetry. Please restart your terminal and run setup again.\n');
    process.exit(1);
  }

  // Install Python dependencies
  console.log('📦 Installing Python dependencies...');
  try {
    const servicesDir = path.join(process.cwd(), 'apps', 'api', 'services');
    execSync('poetry install', {
      stdio: 'inherit',
      cwd: servicesDir,
      env: { ...process.env }
    });
  } catch (error) {
    console.error('\n❌ Failed to install Python dependencies:', error.message);
    process.exit(1);
  }

  console.log('\n✨ Setup complete! To start development:\n');
  console.log('1. Start the development servers:');
  console.log('   bun run dev\n');
  console.log('2. Look for the authentication URL in the terminal\n');
  console.log('NOTE: If poetry command is not found, please restart your terminal to apply PATH changes.\n');

  rl.close();
}

main().catch(error => {
  console.error('\n❌ Setup failed:', error);
  process.exit(1);
});
