import { Controller } from '@nestjs/common';
import { ConfigService } from '@nestjs/config/dist';
import { Ctx, MessagePattern, MqttContext, Payload } from '@nestjs/microservices';
// import { Cron } from '@nestjs/schedule';
import { YICamService } from './yi-cam.service';
import { Configuration } from './config/configuration';


@Controller()
export class YICamController {

  constructor(
    private configService: ConfigService,
    private readonly appService: YICamService) {
  }


  @MessagePattern(`${Configuration.mqtt.base_topic }/+/motion_files`)
  getMotionFiles(@Payload() data, @Ctx() context: MqttContext) {
    this.appService.log(context.getTopic(), data, 'debug');
  }


  @MessagePattern(Configuration.mqtt.base_topic + '/+/info/get')
  getStatus(@Payload() data, @Ctx() context: MqttContext) {
    this.appService.log(context.getTopic(), data);
    const regexp = new RegExp(`${Configuration.mqtt.base_topic}/(.*)/info/get`);
    const camera = context.getTopic().match(regexp)[1];
    this.appService.publishStatus(camera);
  }

  @MessagePattern(Configuration.mqtt.base_topic + '/+/links/get')
  getLinks(@Payload() data, @Ctx() context: MqttContext) {
    this.appService.log(context.getTopic(), data);
    const regexp = new RegExp(`${Configuration.mqtt.base_topic}/(.*)/links/get`);
    const camera = context.getTopic().match(regexp)[1];
    this.appService.publishLink(camera);
  }

  @MessagePattern(Configuration.mqtt.base_topic + '/+/config/get')
  getConfig(@Payload() data, @Ctx() context: MqttContext) {
    this.appService.log(context.getTopic(), data);
    const regexp = new RegExp(`${Configuration.mqtt.base_topic}/(.*)/config/get`);
    const camera = context.getTopic().match(regexp)[1];
    this.appService.publishConfig(camera);
  }

  @MessagePattern(Configuration.mqtt.base_topic + '/+/config/+/get')
  getConfigItem(@Payload() data, @Ctx() context: MqttContext) {
    this.appService.log(context.getTopic(), data);
    const regexp = new RegExp(`${Configuration.mqtt.base_topic}/(.*)/config/(.*)/get`);
    const camera = context.getTopic().match(regexp)[1];
    const item = context.getTopic().match(regexp)[2];
    this.appService.publishConfigItem(camera, item);
  }

  @MessagePattern(Configuration.mqtt.base_topic + '/+/config/+/set')
  setConfigItem(@Payload() data, @Ctx() context: MqttContext) {
    this.appService.log(context.getTopic(), data);
    const regexp = new RegExp(`${Configuration.mqtt.base_topic}/(.*)/config/(.*)/set`);
    const camera = context.getTopic().match(regexp)[1];
    const item = context.getTopic().match(regexp)[2];
    this.appService.setConfigItem(camera, item, data);
  }

  @MessagePattern(Configuration.mqtt.base_topic + '/+/announce')
  publishAnnounce(@Payload() data, @Ctx() context: MqttContext) {
    this.appService.log(context.getTopic(), data);
    const regexp = new RegExp(`${Configuration.mqtt.base_topic}/(.*)/announce`);
    const camera = context.getTopic().match(regexp)[1];
    this.appService.announceCamera(camera);
  }


  @MessagePattern(Configuration.mqtt.base_topic + '/announce')
  publishAnnounceAll(@Payload() data, @Ctx() context: MqttContext) {
    this.appService.log(context.getTopic(), data);
    this.appService.announceAllCamera();
  }

  @MessagePattern(Configuration.mqtt.base_topic + '/info/get')
  publishAllStatus(@Payload() data, @Ctx() context: MqttContext) {
    this.appService.log(context.getTopic(), data);
    this.appService.publishAllStatus();
  }

  @MessagePattern(Configuration.mqtt.base_topic + '/links/get')
  publishAllLinks(@Payload() data, @Ctx() context: MqttContext) {
    this.appService.log(context.getTopic(), data);
    this.appService.publishAllLinks();
  }
  
  @MessagePattern(Configuration.mqtt.base_topic + '/config/get')
  publishAllConfig(@Payload() data, @Ctx() context: MqttContext) {
    this.appService.log(context.getTopic(), data);
    this.appService.publishAllConfig();
  }


  @MessagePattern(Configuration.mqtt.base_topic + '/#')
  getYiCam(@Payload() data, @Ctx() context: MqttContext) {
    const regexp = new RegExp(`${Configuration.mqtt.base_topic}/(.*?)/(.*?)$`);
    // const camera = context.getTopic().match(regexp)[1];
    const suffix_topic = context.getTopic().match(regexp)[2];
    if (suffix_topic === "motion_detection_image") {
      this.appService.log(context.getTopic(), "<image_data>", 'debug');
    } else {
      this.appService.log(context.getTopic(), data, 'debug');
    }
  }


  @MessagePattern(Configuration.homeassistant.prefix + '/#')
  getHomeAssistant(@Payload() data, @Ctx() context: MqttContext) {
    const regexp = new RegExp(`${Configuration.homeassistant.prefix}/(.*?)/(.*?)/`);
    // const component_id = context.getTopic().match(regexp)[1];
    const camera = context.getTopic().match(regexp)[2];
    if ( Configuration.cameras[camera]) {
      this.appService.log(context.getTopic(), data, 'debug');
    }

  }


  /*
  @Cron('45 * * * * *')
  handleCron() {
    this.appService.publishAnnouce('yi-cam-01');
  }
  */
}
