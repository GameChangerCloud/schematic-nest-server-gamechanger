import { Tree } from '@angular-devkit/schematics';

export function createIndex(
    _tree: Tree,
    projectName: string
) {
    let fileTemplate = 
`import { graphql } from 'graphql';
import { AppModule } from 'app.module';
import { NestFactory } from '@nestjs/core';
import { APIGatewayEvent, Context } from 'aws-lambda';
import { GraphQLSchemaHost } from '@nestjs/graphql';

console.log('ENVIRONMENT VARIABLES\\n' + JSON.stringify(process.env, null, 2));
console.log('Current directory: ' + __dirname);

exports.handler = async function (
  event: APIGatewayEvent,
  lambdaContext: Context,
) {
  console.info('EVENT\\n' + JSON.stringify(event, null, 2));

  console.log('Handler called');
  const nestApp = await NestFactory.create(AppModule);
  await nestApp.init();

  const { schema } = await nestApp.get(GraphQLSchemaHost);
  const eventObject = JSON.parse(JSON.stringify(event, null, 4));

  graphql({
    schema: schema,
    source: eventObject.query,
  }).then(
    (result) => {
      return {
        statusCode: 200,
        body: JSON.stringify(result),
        isBase64Encoded: false,
      };
    },
    (err) => {
      return {
        statusCode: 500,
        body: JSON.stringify(err),
        isBase64Encoded: false,
      };
    },
  );
};\n`;

// Create Service file
  _tree.create(
    `${projectName}/src/index.ts`,
    fileTemplate
  );
}