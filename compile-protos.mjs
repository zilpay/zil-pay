import { readdirSync, writeFileSync } from 'fs';
import { join, basename, extname } from 'path';
import protobuf from 'protobufjs';

const protoDir = 'crypto/proto/';
const outputDir = 'crypto/proto/';

const protoFiles = readdirSync(protoDir).filter(file => extname(file) === '.proto');

async function processProtoFiles() {
  for (const protoFile of protoFiles) {
    const protoPath = join(protoDir, protoFile);
    const name = basename(protoFile, '.proto');
    const jsonOutput = join(outputDir, `${name}.json`);

    try {
      // Загружаем .proto файл с помощью protobufjs
      const root = await protobuf.load(protoPath);
      
      // Получаем JSON-представление протофайла
      const jsonDescriptor = root.toJSON();
      
      // Записываем JSON в файл
      writeFileSync(jsonOutput, JSON.stringify(jsonDescriptor, null, 2), 'utf8');
      console.log(`Processed ${protoFile} -> ${jsonOutput}`);
    } catch (error) {
      console.error(`Error processing ${protoFile}:`, error);
    }
  }
}

processProtoFiles();
