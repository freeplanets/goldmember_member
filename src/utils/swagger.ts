import { INestApplication } from '@nestjs/common';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerCustomOptions,
} from '@nestjs/swagger';

//웹 페이지를 새로고침을 해도 Token 값 유지
const swaggerCustomOptions: SwaggerCustomOptions = {
  swaggerOptions: {
    persistAuthorization: true,
  },
};

/**
 * @author
 * @description Swagger 세팅
 */
export const setupSwagger = (app: INestApplication): void => {
  const options = new DocumentBuilder()
    .setTitle('林口高爾夫球場會員 API')
    .setDescription('林口高爾夫球場預約系統 API 文件')
    .setVersion('1.0.0')
    .addServer(
      'https://virtserver.swaggerhub.com/cyriacr/linkouGolfMemberAPI/1.0.0',
    )
    .addServer('https://api.uuss.net/linkougolf/frontend')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document, swaggerCustomOptions);
};
