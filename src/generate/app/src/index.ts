import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

export const lambdaHandler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
    console.log("ENVIRONMENT VARIABLES\n" + JSON.stringify(process.env, null, 2))
    console.info("EVENT\n" + JSON.stringify(event, null, 2))
    
    console.log("Handler called");
    const nestApp = await NestFactory.create(AppModule);
    await nestApp.init();
    
    console.warn("Event not processed.")

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'hello world',
        }),
    };
}