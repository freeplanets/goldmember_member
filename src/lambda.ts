import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import { Server } from "http";
import { AppModule } from "./app.module";
import { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from "@nestjs/swagger";
import { eventContext } from "aws-serverless-express/middleware";
import { createServer, proxy, Response } from "aws-serverless-express";
import { Context, Handler } from "aws-lambda";
import { SecuritySchemeObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";
import { ValidationPipe, ValidationPipeOptions } from "@nestjs/common";
import { ValidationException } from "./utils/validate/validation-exception";
import { GlobalDataTransPipe } from "./utils/pipes/global-date-trans-pipe";

const authOption:SecuritySchemeObject = {
    description: 'JWT token authorization',
    //type: 'apiKey',
    type: 'http',
    // in: 'header',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    // name: 'WWW-AUTH',
}


//即使刷新網頁，Token 值仍保持不變
const swaggerCustomOptions: SwaggerCustomOptions = {
    yamlDocumentUrl: 'docs-yaml',
    swaggerOptions: {
        persistAuthorization: true,
    },
};
async function bootstrapServer():Promise<Server> {
    const expressApp = require('express')();
    const adapter = new ExpressAdapter(expressApp);
    //console.log("check0");
    const app = await NestFactory.create(AppModule, adapter);
    //console.log("check1");
    const crosOp: CorsOptions = {
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: false,
    }
    app.enableCors(crosOp);
    let options:any;
    if(process.env.IS_OFFLINE) {
        options = new DocumentBuilder()
        .setTitle('GoldMember')
        .setDescription('Member Api')
        .setVersion('0.01')
        .addServer('/dev')
        .addBearerAuth(authOption)
        .build()
    } else {
        options = new DocumentBuilder()
        .setTitle('GoldMember')
        .setDescription('Member Api')
        .setVersion('0.01')
        .addServer('/linkougolf/frontend')
        .addBearerAuth(authOption)
        .build()
    }
    const document = SwaggerModule.createDocument(app, options)
    SwaggerModule.setup('api', app, document, swaggerCustomOptions);
    app.use(eventContext());
    const vopt:ValidationPipeOptions = {
        //whitelist: true,
        exceptionFactory: ValidationException,
    }
    app.useGlobalPipes(new GlobalDataTransPipe(), new ValidationPipe(vopt));
    await app.init();
    //console.log(`bootstrapServer init done...`);
    return createServer(expressApp);
}
var cachedServer:Server;

export const handler: Handler = async (event: any, context: Context): Promise<Response> => {
    if (!cachedServer) {
        console.log("handler running cachedServer");
        cachedServer = await bootstrapServer();
    }
    // console.log(event);
    console.log('path:',event.requestContext.path,',','resourcePath:', event.requestContext.resourcePath, 'pathParameters:', event.pathParameters);
    const path = event.requestContext.path.replace('/linkougolf/frontend', '');
    console.log("pathA:", path);
    event.path = path;
    event.requestContext.path = path;
    //event.pathParameters =  { proxy: path };
    return proxy(cachedServer, event, context, 'PROMISE').promise;
}