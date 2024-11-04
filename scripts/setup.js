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

async function detectR() {
  try {
    const rPath = execSync('which R', { encoding: 'utf8' }).trim();
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

async function checkPoetry() {
  try {
    execSync('poetry --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

async function installPoetry() {
  console.log('📦 Installing Poetry...');
  try {
    execSync('curl -sSL https://install.python-poetry.org | python3 -', { stdio: 'inherit' });
    // Add Poetry to PATH for the current session
    const homeDir = process.env.HOME || process.env.USERPROFILE;
    process.env.PATH = `${homeDir}/.local/bin:${process.env.PATH}`;
    return true;
  } catch (error) {
    console.error('\n❌ Failed to install Poetry:', error.message);
    return false;
  }
}

async function main() {
  console.log('\n🚀 Setting up R-Pilot...\n');

  // Check Python installation
  try {
    execSync('python3 --version', { stdio: 'ignore' });
  } catch (error) {
    console.error('\n❌ Python 3 is required but not found. Please install Python 3 and try again.\n');
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

  // Check and install Poetry if needed
  if (!await checkPoetry()) {
    console.log('Poetry not found. Installing...');
    if (!await installPoetry()) {
      console.error('\n❌ Failed to install Poetry. Please install manually:');
      console.error('curl -sSL https://install.python-poetry.org | python3 -\n');
      process.exit(1);
    }
  }

  // Install Python dependencies
  console.log('📦 Installing Python dependencies...');
  try {
    // Configure Poetry to create virtual environment in project directory
    execSync('cd apps/api/services && poetry config virtualenvs.in-project true', { stdio: 'inherit' });
    // Install dependencies
    execSync('cd apps/api/services && poetry install', { stdio: 'inherit' });
  } catch (error) {
    console.error('\n❌ Failed to install Python dependencies:', error.message);
    process.exit(1);
  }

  console.log('\n✨ Setup complete! To start development:\n');
  console.log('1. Start the development servers:');
  console.log('   bun run dev\n');
  console.log('2. Look for the authentication URL in the terminal\n');

  rl.close();
}

main().catch(error => {
  console.error('\n❌ Setup failed:', error);
  process.exit(1);
});
