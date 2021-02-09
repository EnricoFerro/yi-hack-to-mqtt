
import * as mqtt from 'mqtt';

import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common/services/logger.service';
import { ConfigService } from '@nestjs/config';

import { Configuration } from './config/configuration';
import { HttpProviderService } from './provider/http_provider.service';
import { AnnounceService } from './announce.service';
import { SshProviderService } from './provider/ssh_provider.service';

@Injectable()
export class YICamService {

  private readonly logger = new Logger(YICamService.name);
  constructor(
    private configService: ConfigService,
    private announceService: AnnounceService,
    private httpProviderService: HttpProviderService,
    private sshProviderService: SshProviderService
  ) {
  }

  private getProvider(camera) {
    const source =  Configuration.global && Configuration.global.provider && Configuration.global.provider.source || Configuration.cameras && Configuration.cameras[camera] && Configuration.cameras[camera].provider && Configuration.cameras[camera].provider.source || 'http';

    return source === 'ssh' ? this.sshProviderService : this.httpProviderService;
  }

  log(topic: string, payload: any, level = 'log') {
    this.logger[level](`${topic} ${JSON.stringify(payload)}`);
  }

  publishMqtt(topic,payload) {
    const client = mqtt.connect(Configuration.mqtt.server, Configuration.mqtt.options);
    client.publish(topic, payload, { retain: true })
  }

  publishLink(camera: string) {
    const provider = this.getProvider(camera);
    provider.getLink(camera).then((data) => {
      this.publishMqtt(`${Configuration.mqtt.base_topic}/${camera}/links`, JSON.stringify(data))
    }).catch(err => {
      this.logger.error(`Camera ${camera}: ${err.message}`);
    });
  }

  publishStatus(camera: string) {
    const provider = this.getProvider(camera);
    provider.getStatus(camera).then((data) => {
      this.publishMqtt(`${Configuration.mqtt.base_topic}/${camera}/info`, JSON.stringify(data))
    }).catch(err => {
      this.logger.error(`Camera ${camera}: ${err.message}`);
    });
  }

  publishConfig(camera: string){
    const provider = this.getProvider(camera);
    provider.getConfig(camera).then((data) => {
      this.publishMqtt(`${Configuration.mqtt.base_topic}/${camera}/config`, JSON.stringify(data))
    }).catch(err => {
      this.logger.error(`Camera ${camera}: ${err.message}`);
    });
  }

  publishConfigItem(camera: string, item: string){
    const provider = this.getProvider(camera);
    provider.getConfig(camera).then((data) => {
      if ( data[item]) {
        this.publishMqtt(`${Configuration.mqtt.base_topic}/${camera}/config/${item}`, data[item])
      }
    }).catch(err => {
      this.logger.error(`Camera ${camera}: ${err.message}`);
    });
  }

  setConfigItem(camera: string, item: string, value: string){
    const provider = this.getProvider(camera);
    provider.setConfigItem(camera, item, value).then(() => {
        this.publishConfig(camera);
    }).catch(err => {
      this.logger.error(`Camera ${camera}: ${err.message}`);
    });
  }


  announceCamera(camera: string) {
    this.announceService.publishAnnounce(camera);
  }

  announceAllCamera() {
    Object.keys(Configuration.cameras).forEach(camera => {
      this.announceCamera(camera);
    });
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
