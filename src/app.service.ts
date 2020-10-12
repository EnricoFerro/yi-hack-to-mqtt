
import * as mqtt from 'mqtt';
import axios from 'axios';

import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common/services/logger.service';
import { ConfigService } from '@nestjs/config';

import { Configuration } from './config/configuration';
import { HttpProviderService } from './http_provider.service';
import { AnnounceService } from './announce.service';

@Injectable()
export class AppService {

  private readonly logger = new Logger(AppService.name);
  constructor(
    private configService: ConfigService,
    private announceService: AnnounceService,
    private httpProviderService: HttpProviderService
  ) {}

  log(topic: string, payload: any) {
    this.logger.log(`${topic} ${JSON.stringify(payload)}`);
  }

  publishMqtt(topic,payload) {
    const client = mqtt.connect(Configuration.mqtt.server);
    client.publish(topic, payload, { retain: true })
  }

  publishLink(camera: string) {
    this.httpProviderService.getLink(camera).then((data) => {
      this.publishMqtt(`${Configuration.mqtt.base_topic}/${camera}/links`, JSON.stringify(data))
    }).catch(err => {
      this.logger.error(err);
    });
  }

  publishStatus(camera: string) {
    this.httpProviderService.getStatus(camera).then((data) => {
      this.publishMqtt(`${Configuration.mqtt.base_topic}/${camera}/info`, JSON.stringify(data))
    }).catch(err => {
      this.logger.error(err);
    });
  }

  publishConfig(camera: string){
    this.httpProviderService.getConfig(camera).then((data) => {
      this.publishMqtt(`${Configuration.mqtt.base_topic}/${camera}/config`, JSON.stringify(data))
    }).catch(err => {
      this.logger.error(err);
    });
  }

  publishConfigItem(camera: string, item: string){
    this.httpProviderService.getConfig(camera).then((data) => {
      if ( data[item]) {
        this.publishMqtt(`${Configuration.mqtt.base_topic}/${camera}/config/${item}`, data[item])
      }
    }).catch(err => {
      this.logger.error(err);
    });
  }

  setConfigItem(camera: string, item: string, value: string){
    this.httpProviderService.setConfigItem(camera, item, value).then((data) => {
        this.publishConfig(camera);
    }).catch(err => {
      this.logger.error(err);
    });
  }


  announceCamera(camera: string) {
    this.announceService.publishAnnounce(camera);
  }

  publishAllStatus() {
    Object.keys(Configuration.cameras).forEach(camera => {
      this.publishStatus(camera);
    });
  }

  publishAllLinks() {
    Object.keys(Configuration.cameras).forEach(camera => {
      this.publishLink(camera);
    });
  }


  publishAllConfig() {
    Object.keys(Configuration.cameras).forEach(camera => {
      this.publishConfig(camera);
    });
  }
}
