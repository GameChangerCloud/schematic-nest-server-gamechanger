import { Tree } from '@angular-devkit/schematics';

export function createIndex(
    _tree: Tree,
    projectName: string
) {
    let fileTemplate = 
`import { graphql } from 'graphql';
import { AppModule } from 'app.module';
import { NestFactory } from '@nestjs/core';
import { APIGatewayEvent, Callback, Context } from 'aws-lambda';
import { GraphQLSchemaHost } from '@nestjs/graphql';
import { AppDataSource } from 'adapters/typeorm/datasource';

console.log('ENVIRONMENT VARIABLES\\n' + JSON.stringify(process.env, null, 2));
console.log('Current directory: ' + __dirname);

exports.handler = async function (
  event: APIGatewayEvent,
  lambdaContext: Context,
  callback: Callback,
) {
  console.info('EVENT\\n' + JSON.stringify(event, null, 2));

  console.log('Handler called');
  if (!AppDataSource.isInitialized) await AppDataSource.initialize();
  const nestApp = await NestFactory.create(AppModule);
  await nestApp.init();

  if (event['initTable']) {
    console.log('InitTable');
    const initResult = await syncDataSource();
    return initResult;
  } else if (event['existTable']) {
    try {
      const eventObject = JSON.parse(JSON.stringify(event, null, 4));
      console.log(
        \`Ckeck if \${eventObject.existTable.toUpperCase()} table exists\`,
      );
      const tableExists = await AppDataSource.query(\`SELECT EXISTS (
      SELECT FROM 
        information_schema.tables
      WHERE 
        table_schema = 'public' AND 
        table_name  = '\${eventObject.existTable.toLowerCase()}'
      )\`);
      if (tableExists)
        return {
          statusCode: 200,
          body: \`Table \${eventObject.existTable.toUpperCase()} exists in database\`,
        };
      else
        return {
          statusCode: 200,
          body: \`Table \${eventObject.existTable.toUpperCase()} not found in database\`,
        };
    } catch (e) {
      return {
        statusCode: 500,
        body: e,
      };
    }
  } else if (event['query']) {
    console.log('Computing query');
    const eventObject = JSON.parse(JSON.stringify(event, null, 4));
    const { schema } = nestApp.get(GraphQLSchemaHost);
    try {
      const initStatus = await syncDataSource();
      if (initStatus.statusCode !== 500) {
        const result = await graphql({
          schema: schema,
          source: eventObject.query,
        });
        const resultObject = JSON.parse(JSON.stringify(result, null, 4));
        if(resultObject.errors !== undefined && resultObject.errors.length > 0) throw (resultObject.errors[0].message);
        return {
          statusCode: 200,
          body: result,
          isBase64Encoded: false,
        };
      }
    } catch (e) {
      return {
        statusCode: 500,
        body: e,
      };
    }
  } else if (event['cleanTables']) {
    console.log('Clean all tables');
    try {
      const entities = AppDataSource.entityMetadatas;
      for (const entity of entities) {
        const repository = AppDataSource.getRepository(entity.name);
        await repository.query(
          \`TRUNCATE \${entity.tableName} RESTART IDENTITY CASCADE;\`,
        );
      }
      await AppDataSource.query(
        \`TRUNCATE typeorm_metadata RESTART IDENTITY CASCADE;\`,
      );
      return {
        statusCode: 200,
        body: 'Clean done',
      };
    } catch (e) {
      return {
        statusCode: 500,
        body: e,
      };
    }
  } else if (event['dropTables']) {
    console.log('Drop all tables');
    try {
      await AppDataSource.dropDatabase();
      return {
        statusCode: 200,
        body: 'Drop done',
      };
    } catch (e) {
      return {
        statusCode: 500,
        body: JSON.stringify(e),
      };
    }
  } else {
    console.log('Hello world');
    callback('ERROR', {
      statusCode: 200,
      body: 'Unknow command',
    });
  }
};

async function syncDataSource(): Promise<{ statusCode: number; body: string }> {
  try {
    const tablesExist = await AppDataSource.query(\`SELECT EXISTS (
      SELECT FROM 
        information_schema.tables
      WHERE 
        table_schema = 'public'
      )\`);
    if (!tablesExist[0].exists) {
      await AppDataSource.synchronize();

      return {
        statusCode: 200,
        body: 'Init and Sync done',
      };
    } else {
      return {
        statusCode: 200,
        body: 'Tables already exist',
      };
    }
  } catch (e) {
    return {
      statusCode: 500,
      body: e,
    };
  }
}\n`;

// Create Service file
  _tree.create(
    `${projectName}/src/index.ts`,
    fileTemplate
  );
}