
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

  private globalInfo:any = {};
  private resourceInfo:any = {};
  private config:any = {};
  private link:any = {};

  constructor(
    private configService: ConfigService,
    private announceService: AnnounceService,
    private httpProviderService: HttpProviderService,
    private sshProviderService: SshProviderService
  ) {
  }

  private getProvider(camera) {
    const source = Configuration.global && Configuration.global.provider && Configuration.global.provider.source || Configuration.cameras && Configuration.cameras[camera] && Configuration.cameras[camera].provider && Configuration.cameras[camera].provider.source || 'http';

    return source === 'ssh' ? this.sshProviderService : this.httpProviderService;
  }

  log(topic: string, payload: any, level = 'log') {
    this.logger[level](`${topic} ${JSON.stringify(payload)}`);
  }

  publishMqtt(topic, payload) {
    const client = mqtt.connect(Configuration.mqtt.server, Configuration.mqtt.options);
    client.publish(topic, payload, { retain: true })
  }


  isLinkChanged(camera, data) {
    if (this.link[camera] == null || 
      this.link[camera].low_res_stream !== data.low_res_stream ||
      this.link[camera].high_res_strea !== data.high_res_strea ||
      this.link[camera].audio_stream !== data.audio_stream ||
      this.link[camera].low_res_snapshot !== data.low_res_snapshot ||
      this.link[camera].high_res_snapshot !== data.high_res_snapshot ) {
      this.link[camera] = data;
      return true;
    } else {
      return false;
    }
  }

  publishLink(camera: string) {
    const provider = this.getProvider(camera);
    provider.getLink(camera).then((data) => {
      if (this.isLinkChanged(camera, data)) this.publishMqtt(`${Configuration.mqtt.base_topic}/${camera}/links`, JSON.stringify(data))
    }).catch(err => {
      this.logger.error(`Camera ${camera}: ${err.message}`);
    });
  }

  isGlobalChanged(camera, data) {
    if (this.globalInfo[camera] == null || 
      this.globalInfo[camera].hostname !== data.hostname ||
      this.globalInfo[camera].fw_version !== data.fw_version ||
      this.globalInfo[camera].home_version !== data.home_version ||
      this.globalInfo[camera].model_suffix !== data.model_suffix ||
      this.globalInfo[camera].serial_number !== data.serial_number ||
      this.globalInfo[camera].local_time !== data.local_time ||
      this.globalInfo[camera].local_ip !== data.local_ip ||
      this.globalInfo[camera].netmask !== data.netmask ||
      this.globalInfo[camera].gateway !== data.gateway ||
      this.globalInfo[camera].mac_addr !== data.mac_addr ||
      this.globalInfo[camera].wlan_essid !== data.wlan_essid ) {
      return true;
    } else {
      return false;
    }
  }

  getGlobal(camera, data) {
    if (!this.globalInfo[camera]) this.globalInfo[camera] = {}
    this.globalInfo[camera].hostname = data.hostname;
    this.globalInfo[camera].fw_version = data.fw_version;
    this.globalInfo[camera].home_version = data.home_version;
    this.globalInfo[camera].model_suffix = data.model_suffix;
    this.globalInfo[camera].serial_number = data.serial_number;
    this.globalInfo[camera].local_time = data.local_time;
    this.globalInfo[camera].local_ip = data.local_ip;
    this.globalInfo[camera].netmask = data.netmask;
    this.globalInfo[camera].gateway = data.gateway;
    this.globalInfo[camera].mac_addr = data.mac_addr;
    this.globalInfo[camera].wlan_essid = data.wlan_essid;
    return this.globalInfo[camera];
  }

  isResourceChanged(camera, data) {
    if (this.resourceInfo[camera] == null ||
    this.resourceInfo[camera].local_time !== data.local_time ||
    this.resourceInfo[camera].uptime !== data.uptime ||
    this.resourceInfo[camera].load_avg !== data.load_avg ||
    this.resourceInfo[camera].total_memory !== data.total_memory ||
    this.resourceInfo[camera].free_memory !== data.free_memory ||
    this.resourceInfo[camera].free_sd !== data.free_sd ||
    this.resourceInfo[camera].wlan_strength !== data.wlan_strength ) {
      return true;
    } else {
      return false;
    }
  }

  getResources(camera, data) {
    if (!this.resourceInfo[camera]) this.resourceInfo[camera] = {}

    this.resourceInfo[camera].local_time = data.local_time;
    this.resourceInfo[camera].uptime = data.uptime;
    this.resourceInfo[camera].load_avg = data.load_avg;
    this.resourceInfo[camera].total_memory = data.total_memory;
    this.resourceInfo[camera].free_memory = data.free_memory;
    this.resourceInfo[camera].free_sd = data.free_sd;
    this.resourceInfo[camera].wlan_strength = data.wlan_strength;
    return this.resourceInfo[camera]
  }


  publishStatus(camera: string) {
    const provider = this.getProvider(camera);
    provider.getStatus(camera).then((data) => {
      delete data.local_time;
      this.publishMqtt(`${Configuration.mqtt.base_topic}/${camera}/info`, JSON.stringify(data));
      if (this.isGlobalChanged(camera, data)) this.publishMqtt(`${Configuration.mqtt.base_topic}/${camera}/info/global`, JSON.stringify(this.getGlobal(camera, data)));
      if (this.isResourceChanged(camera, data)) this.publishMqtt(`${Configuration.mqtt.base_topic}/${camera}/info/resources`, JSON.stringify(this.getResources(camera, data)));
    }).catch(err => {
      this.logger.error(`Camera ${camera}: ${err.message}`);
    });
  }

  isConfigChanged(camera, data) {
    if (this.config[camera] == null || 
      this.config[camera].SWITCH_ON !== data.SWITCH_ON ||
      this.config[camera].SAVE_VIDEO_ON_MOTION !== data.SAVE_VIDEO_ON_MOTION ||
      this.config[camera].SENSITIVITY !== data.SENSITIVITY ||
      this.config[camera].BABY_CRYING_DETECT !== data.BABY_CRYING_DETECT ||
      this.config[camera].LED !== data.LED ||
      this.config[camera].ROTATE !== data.ROTATE ||
      this.config[camera].IR !== data.IR ||
      this.config[camera].AI_HUMAN_DETECTION !== data.AI_HUMAN_DETECTION ) {
      this.config[camera] = data;
      return true;
    } else {
      return false;
    }
  }

  publishConfig(camera: string) {
    const provider = this.getProvider(camera);
    provider.getConfig(camera).then((data) => {
      if (this.isConfigChanged(camera,data)) this.publishMqtt(`${Configuration.mqtt.base_topic}/${camera}/config`, JSON.stringify(data))
    }).catch(err => {
      this.logger.error(`Camera ${camera}: ${err.message}`);
    });
  }

  publishConfigItem(camera: string, item: string) {
    const provider = this.getProvider(camera);
    provider.getConfig(camera).then((data) => {
      if (data[item]) {
        this.publishMqtt(`${Configuration.mqtt.base_topic}/${camera}/config/${item}`, data[item])
      }
    }).catch(err => {
      this.logger.error(`Camera ${camera}: ${err.message}`);
    });
  }

  setConfigItem(camera: string, item: string, value: string) {
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
