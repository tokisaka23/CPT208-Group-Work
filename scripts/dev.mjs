import { spawn } from 'child_process';

const isWindows = process.platform === 'win32';
const npmCli = process.env.npm_execpath || null;
const children = [];
let isShuttingDown = false;

function runScript(scriptName, label) {
  const command = npmCli ? process.execPath : (isWindows ? 'npm.cmd' : 'npm');
  const args = npmCli ? [npmCli, 'run', scriptName] : ['run', scriptName];
  const child = spawn(command, args, {
    stdio: 'inherit',
    env: process.env,
    shell: !npmCli,
  });

  child.on('exit', (code, signal) => {
    if (!isShuttingDown && (code !== 0 || signal)) {
      console.error(`[dev] ${label} exited unexpectedly (code=${code}, signal=${signal ?? 'none'})`);
      shutdown(code ?? 1);
    }
  });

  children.push(child);
}

function killChildTree(child) {
  if (!child || child.killed) {
    return;
  }

  if (isWindows) {
    spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    return;
  }

  child.kill('SIGTERM');
}

function shutdown(exitCode = 0) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  for (const child of children) {
    killChildTree(child);
  }

  setTimeout(() => {
    process.exit(exitCode);
  }, 200);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

runScript('dev:backend', 'backend');
runScript('dev:frontend', 'frontend');
