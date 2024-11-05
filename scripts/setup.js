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

function checkPython() {
  // Try different Python commands that might exist
  const pythonCommands = isWindows ? ['python', 'py -3', 'python3'] : ['python3', 'python', 'py'];
  
  for (const cmd of pythonCommands) {
    try {
      const version = execSync(`${cmd} -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')"`, { encoding: 'utf8' }).trim();
      const [major, minor] = version.split('.').map(Number);
      
      // Check if version is between 3.9 and 3.12
      if (major === 3 && minor >= 9 && minor <= 12) {
        console.log(`✓ Found Python ${version}`);
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

  // Setup Python environment
  console.log('📦 Setting up Python environment...');
  const servicesDir = path.join(process.cwd(), 'apps', 'api', 'services');
  try {
    // Create and activate venv
    execSync(`cd ${servicesDir} && ${process.env.PYTHON_CMD} -m venv venv`, {
      stdio: 'inherit',
      shell: true
    });

    // Install dependencies
    const activateCmd = isWindows ? 
      `.\\venv\\Scripts\\activate.bat &&` : 
      'source venv/bin/activate &&';
    
    execSync(`cd ${servicesDir} && ${activateCmd} pip install poetry && poetry install`, {
      stdio: 'inherit',
      shell: true
    });
  } catch (error) {
    console.error('\n❌ Failed to setup Python environment:', error.message);
    process.exit(1);
  }

  // Create .env if it doesn't exist
  if (!fs.existsSync(path.join('apps', 'api', 'services', '.env'))) {
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

    const envContent = `OPENAI_API_KEY=${openaiKey}
INTERPRETER_TYPE=r
R_PATH=${rPath}
WORKING_DIRECTORY=${workingDir}
ALLOWED_HOSTS=localhost:3000
FRONTEND_URL=localhost:3000
ENABLE_CORS=TRUE`;

    // Write to services .env
    fs.writeFileSync(path.join('apps', 'api', 'services', '.env'), envContent);
    console.log('✅ Created services .env with your configuration\n');
  }

  // Setup NextJS environment
  const webEnvExample = path.join('apps', 'web', '.env.local.example');
  const webEnv = path.join('apps', 'web', '.env.local');
  if (fs.existsSync(webEnvExample) && !fs.existsSync(webEnv)) {
    fs.copyFileSync(webEnvExample, webEnv);
    console.log('✅ Created NextJS environment configuration\n');
  }

  console.log('\n✨ Setup complete! Next steps:\n');
  console.log('1. Start the development servers:');
  console.log('   bun run dev\n');
  console.log('2. Look for the authentication URL in the terminal\n');

  rl.close();
}

main().catch(error => {
  console.error('\n❌ Setup failed:', error);
  process.exit(1);
});
