import { INestApplication } from '@nestjs/common';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerCustomOptions,
} from '@nestjs/swagger';

//即使刷新網頁，token 值仍然保留
const swaggerCustomOptions: SwaggerCustomOptions = {
  swaggerOptions: {
    persistAuthorization: true,
  },
};

/**
 * @author
 * @description Swagger 設定
 */
export const setupSwagger = (app: INestApplication): void => {
  const options = new DocumentBuilder()
    .setTitle('林口高爾夫球場會員 API')
    .setDescription('林口高爾夫球場預約系統 API 文件')
    .setVersion('1.0.0')
    // .addServer(
    //   'https://virtserver.swaggerhub.com/cyriacr/linkouGolfMemberAPI/1.0.0',
    // )
    .addServer('https://api.uuss.net/linkougolf/frontend')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document, swaggerCustomOptions);
};
