import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ScheduleModule } from '@nestjs/schedule';
import { AnnounceService } from './announce.service';

import { YICamController } from './yi-cam.controller';
import { YICamService } from './yi-cam.service';

import configuration, { Configuration } from './config/configuration';
import { HttpProviderService } from './provider/http_provider.service';
import { SshProviderService } from './provider/ssh_provider.service';

const getOptions = function (configuration, Configuration) {
  let options = Configuration.mqtt.options
  if ( options ) {
    options.url =  Configuration.mqtt.server;
    return options;
  } else {
    options = { url : Configuration.mqtt.server }
    return options;
  }
}

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ClientsModule.register([
      {
        name: 'MATH_SERVICE',
        transport: Transport.MQTT,
        options: getOptions(configuration, Configuration)
      },
    ]),
    ConfigModule.forRoot({
      load: [configuration],
    }),
  ],
  controllers: [YICamController],
  providers: [
    YICamService,
    AnnounceService,
    HttpProviderService,
    SshProviderService
  ],
})
export class YiCamModule {}
