import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import bodyParserXml from 'body-parser-xml';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // parse application/xml FIRST
  bodyParserXml(bodyParser);
  app.use((bodyParser as any).xml({
    limit: '1MB',
    xmlParseOptions: {
      explicitArray: false,
    },
  }));

  // Middleware to unwrap root property from XML bodies and coerce numeric fields
  app.use((req, res, next) => {
    if (req.is('application/xml') && req.body && typeof req.body === 'object') {
      // Recursively unwrap any single root property until we get to the innermost object
      let body = req.body;
      while (
        body &&
        typeof body === 'object' &&
        Object.keys(body).length === 1 &&
        typeof body[Object.keys(body)[0]] === 'object' &&
        body[Object.keys(body)[0]] !== null
      ) {
        body = body[Object.keys(body)[0]];
      }
      req.body = body;
      // Coerce numeric fields to numbers for known DTOs
      const numericFields = [
        'profileId', 'contentId', 'lastPositionSeconds', 'watchedSeconds', 'durationSeconds'
      ];
      for (const field of numericFields) {
        if (field in req.body && typeof req.body[field] === 'string' && req.body[field].trim() !== '') {
          const num = Number(req.body[field]);
          if (!isNaN(num)) req.body[field] = num;
        }
      }
      // Coerce boolean field
      if ('autoContinuedNext' in req.body && typeof req.body['autoContinuedNext'] === 'string') {
        const val = req.body['autoContinuedNext'].toLowerCase();
        req.body['autoContinuedNext'] = (val === 'true' || val === '1');
      }
    }
    // Debug log: print the parsed request body before validation
    if (req.is('application/xml')) {
      console.log('DEBUG main.ts XML req.body:', req.body);
    }
    next();
  });

  // ✅ ENABLE DTO VALIDATION
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // enable CORS
  app.enableCors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });


  // swagger setup
  const config = new DocumentBuilder()
    .setTitle('StreamFlix API')
    .setDescription('API for the StreamFlix platform')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      in: 'header',
    }, 'access-token')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
  console.log('API running on http://localhost:3000');
  console.log('Swagger running on http://localhost:3000/api');
}

bootstrap();
