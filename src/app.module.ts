import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ScheduleModule } from '@nestjs/schedule';
import { AnnounceService } from './announce.service';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import configuration, { Configuration } from './config/configuration';
import { HttpProviderService } from './provider/http_provider.service';
import { SshProviderService } from './provider/ssh_provider.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ClientsModule.register([
      {
        name: 'MATH_SERVICE',
        transport: Transport.MQTT,
        options: {
          url:  Configuration.mqtt.server,
        }
      },
    ]),
    ConfigModule.forRoot({
      load: [configuration],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AnnounceService,
    HttpProviderService,
    SshProviderService
  ],
})
export class AppModule {}
