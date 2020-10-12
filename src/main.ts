import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

import { AppModule } from './app.module';
import { Configuration } from './config/configuration';


async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.MQTT,
      options: {
        url:  Configuration.mqtt.server,
      }
    },
  );
  app.listen(() => console.log('Microservice is listening'));
}
bootstrap();
