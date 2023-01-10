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
import { AppDataSource } from 'datasource';

console.log('ENVIRONMENT VARIABLES\\n' + JSON.stringify(process.env, null, 2));
console.log('Current directory: ' + __dirname);

exports.handler = async function (
  event: APIGatewayEvent,
  lambdaContext: Context,
  callback: Callback,
) {
  console.info('EVENT\\n' + JSON.stringify(event, null, 2));

  console.log('Handler called');
  const nestApp = await NestFactory.create(AppModule);
  await nestApp.init();

  const { schema } = await nestApp.get(GraphQLSchemaHost);
  

  if(event['initTable']) {
    console.log('InitTable');
    const initResult = await initAndSyncDataSource();
    return initResult;
  }

  else if(event['existTable']) {
    try {
      const eventObject = JSON.parse(JSON.stringify(event, null, 4));
    console.log(\`Ckeck if \${eventObject.existTable.toUpperCase()} table exists\`);
    let tableExists = await AppDataSource.query(\`SELECT EXISTS (
      SELECT FROM 
        information_schema.tables
      WHERE 
        table_schema = 'public' AND 
        table_name  = '\${eventObject.existTable.toLowerCase()}'
      )\`);
      if (tableExists)
        return {
          statusCode: 200,
          body: JSON.stringify(\`Table \${eventObject.existTable.toUpperCase()} exists in database\`),
        };
      else return {
        statusCode: 200,
        body: JSON.stringify(\`Table \${eventObject.existTable.toUpperCase()} not found in database\`),
      }
    } catch (e) {
      return {
        statusCode: 500,
        body: JSON.stringify(e),
      }
    }
  }

  else if(event['query']) {
    console.log('Computing query');
    const eventObject = JSON.parse(JSON.stringify(event, null, 4));
    try {
      const initStatus = await initAndSyncDataSource();
      if (initStatus.statusCode !== 500) {
        const result = await graphql({
          schema: schema,
          source: eventObject.query,
        });
        return {
          statusCode: 200,
          body: JSON.stringify(result),
          isBase64Encoded: false,
        };
      }
    }
    catch (e) {
      return {
        statusCode: 500,
        body: JSON.stringify(e),
      }
    }
  }

  else if(event['cleanTables']) {
    console.log('Clean all tables')
    try {
      const entities = AppDataSource.entityMetadatas;
      for (const entity of entities) {
        const repository = AppDataSource.getRepository(entity.name);
        // await repository.query(\`TRUNCATE \${entity.tableName} RESTART IDENTITY CASCADE;\`);
      }
      return {
        statusCode: 200, 
        body: JSON.stringify('Clean done'),
      }
    }
    catch (e) {
      return {
        statusCode: 500,
        body: JSON.stringify(e),
      }
    }
  }

  else if(event['dropTables']) {
    console.log('Drop all tables')
    try {
      await AppDataSource.dropDatabase();
      return {
        statusCode: 200, 
        body: JSON.stringify('Drop done'),
      }
    }
    catch (e) {
      return {
        statusCode: 500,
        body: JSON.stringify(e),
      }
    }
  }

  else {
    console.log('Hello world')
    callback('ERROR', {statusCode: 200, body: JSON.stringify('Unknow command')})
  }
};

async function initAndSyncDataSource(): Promise<{ statusCode: number, body: string}> {
  try {
    if (!AppDataSource.isInitialized) await AppDataSource.initialize();
    let tablesExist = await AppDataSource.query(\`SELECT EXISTS (
      SELECT FROM 
        information_schema.tables
      WHERE 
        table_schema = 'public' OR 
        table_name  = 'typeorm_metadata'
      )\`);
    if (!tablesExist[0].exists) {
      await AppDataSource.synchronize();
      await AppDataSource.query(\`CREATE TABLE typeorm_metadata (
        "type" varchar(255) NOT NULL,
        "database" varchar(255) DEFAULT NULL,
        "schema" varchar(255) DEFAULT NULL,
        "table" varchar(255) DEFAULT NULL,
        "name" varchar(255) DEFAULT NULL,
        "value" text
        )\`);

        return {
          statusCode: 200, 
          body: JSON.stringify('Init and Sync done'),
        };
    } else {
      return {
        statusCode: 200, 
        body: JSON.stringify('Tables already exist'),
      };
    }
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify(e),
    };
  }
}\n`;

// Create Service file
  _tree.create(
    `${projectName}/src/index.ts`,
    fileTemplate
  );
}