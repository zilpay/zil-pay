import { readdirSync } from 'fs';
import { join, basename, extname } from 'path';
import { execSync } from 'child_process';

const protoDir = 'crypto/proto/';
const outputDir = 'crypto/proto/';

const protoFiles = readdirSync(protoDir).filter(file => extname(file) === '.proto');

protoFiles.forEach(protoFile => {
  const protoPath = join(protoDir, protoFile);
  const name = basename(protoFile, '.proto');
  const tsOutput = join(outputDir, `${name}.ts`);

  try {
    execSync(`npx pbjs --ts ${tsOutput} ${protoPath}`, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Failed to process ${protoFile}:`, error.message);
    process.exit(1);
  }
});
