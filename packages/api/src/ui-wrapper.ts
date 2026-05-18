import { spawn } from 'child_process';

console.log('Starting UI via pnpm...');
const child = spawn('pnpm', ['--filter', 'demo-shell', 'dev'], { 
  shell: true, 
  stdio: 'inherit',
  cwd: process.cwd()
});

child.on('exit', (code) => {
  console.log(`UI process exited with code ${code}`);
  process.exit(code || 0);
});
