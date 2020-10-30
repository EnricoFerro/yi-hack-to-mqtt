import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

import { YiCamModule } from './yi-cam.module';
import { Configuration } from './config/configuration';
import { LogLevel } from '@nestjs/common';


function getLogLevel(): LogLevel[] {
  switch (process.env.LOG_LEVEL) {
    case 'ALL':
      return ['log', 'debug', 'error', 'verbose', 'warn'];
    case 'DEBUG':
      return ['log', 'debug', 'error', 'warn'];
    case 'INFO':
      return ['log', 'error', 'warn'];
    case 'WARN':
      return ['error', 'warn'];
    case 'ERROR':
      return ['error'];
    case 'OFF':
      return [];
    case 'TRACE':
      return ['error', 'log', 'warn'];
    default:
      return ['error', 'log', 'warn'];
  }
}

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    YiCamModule,
    {
      transport: Transport.MQTT,
      options: {
        url: Configuration.mqtt.server,
      },
      logger: getLogLevel()
    },
  );
  app.listen(() => console.log('Microservice is listening'));
}
bootstrap();
