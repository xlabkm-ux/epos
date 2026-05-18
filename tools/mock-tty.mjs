import { createRequire } from 'module';
const require = createRequire(import.meta.url);

process.stdout.isTTY = true;
process.stdin.isTTY = true;
process.stdin.setRawMode = () => {};

const originalWrite = process.stdout.write;
process.stdout.write = function(chunk, encoding, cb) {
  const str = chunk.toString();
  // console.error("STDOUT:", str); // debug
  if (str.includes('?')) {
    setTimeout(() => {
      process.stdin.emit('data', Buffer.from('\n'));
    }, 100);
  }
  return originalWrite.apply(process.stdout, arguments);
};

// set cwd to infrastructure-postgres
process.chdir('C:/AG/epios/packages/infrastructure-postgres');

// simulate process.argv
process.argv = ['node', 'drizzle-kit', 'generate'];

// load drizzle-kit bin
import { pathToFileURL } from 'url';
await import(pathToFileURL('C:/AG/epios/node_modules/.pnpm/drizzle-kit@0.31.10/node_modules/drizzle-kit/bin.cjs').href);
