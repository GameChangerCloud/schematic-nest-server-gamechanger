import { Tree } from '@angular-devkit/schematics';

export function createMain(
    _tree: Tree,
    projectName: string
) {
    let fileTemplate = 
`import { NestFactory } from '@nestjs/core';
import { Constants } from 'config/credentials';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(Constants.PORT);
}
bootstrap();\n`;

  _tree.create(
    `${projectName}/src/main.ts`,
    fileTemplate
  );
}