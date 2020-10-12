import * as mqtt from 'mqtt';

import { Injectable } from "@nestjs/common";
import { Configuration } from './config/configuration';

class DeviceModel {
    identifiers: string[];
    manufacturer: string;
    model: string;
    name: string;
    sw_version: string;
}

class AnnounceModel {
    availability_topic: string;
    payload_available: string;
    device: DeviceModel;
    device_class?: string;
    icon: string;

    /**
     * <yicam>/<yi-cam-nn>/info
     */
    qos?: number;
    command_topic?: string;
    json_attributes_topic: string;
    name: string;
    state_topic?: string;
    unique_id: string;
    unit_of_measurement?: string;
    value_template: string;
    payload_on?: string;
    payload_off?: string;
    off_delay?: number;
}

@Injectable()
export class AnnounceService {
    publishMqtt(topic,payload) {
        const client = mqtt.connect(Configuration.mqtt.server);
        client.publish(topic, payload, { retain: true })
    }

    initAnnunce(camera, icon, json_attributes_topic, state_topic, name, unique_id, value_template, unit_of_measurement, device_class?, qos?, payload_on?, payload_off?, off_delay?) {
        const announce : AnnounceModel = {
            availability_topic: `${ Configuration.mqtt.base_topic }/${ camera }/status`,
            payload_available: 'online',
            device: {
                identifiers: [ 
                    `${ Configuration.mqtt.base_topic }_${ camera }`
                ],
                manufacturer: Configuration.global.manufacturer,
                model: Configuration.global.model,
                name: Configuration.cameras[camera].friendly_name,
                sw_version: '0.0.1'
            },
            qos: qos,
            device_class: device_class,
            icon: icon,
            json_attributes_topic: json_attributes_topic,
            state_topic:  state_topic,
            name: name,
            unique_id: unique_id,
            value_template: value_template,
            unit_of_measurement: unit_of_measurement,
            payload_on: payload_on,
            payload_off: payload_off,
            off_delay: off_delay
        }
        return announce;
    }

    announceSensorGeneric(camera,icon, suffix, suffix_name, unit_of_measurement?, transform = '') {
        const announce = this.initAnnunce(
            camera,
            icon,
            `yicam/${ camera }/info`,
            `yicam/${ camera }/info`,
            `${ Configuration.cameras[camera].friendly_name } ${ suffix_name }`,
            `${ Configuration.mqtt.base_topic }-${ camera }-${ suffix }`,
            `{{ value_json.${ suffix }${ transform ? transform: ''} }}`,
            unit_of_measurement
            );
        this.publishMqtt(
            `${ Configuration.homeassistant.prefix}/sensor/${ camera }/${suffix}/config`,
            JSON.stringify(announce)
        );
    }

    announceBinaryGeneric(camera,icon, suffix, payload_on, payload_off, suffix_name, unit_of_measurement?, device_class?,  qos?, off_delay?) {
        const announce = this.initAnnunce(
            camera,
            icon,
            undefined,
            `yicam/${ camera }/${suffix}`,
            `${ Configuration.cameras[camera].friendly_name } ${ suffix_name }`,
            `${ Configuration.mqtt.base_topic }-${ camera }-${ suffix }`,
            undefined,
            unit_of_measurement,
            device_class,
            qos,
            payload_on,
            payload_off,
            off_delay
            );
        this.publishMqtt(
            `${ Configuration.homeassistant.prefix}/binary_sensor/${ camera }/${suffix}/config`,
            JSON.stringify(announce)
        );
    }


    announceCustomValue(camera,icon, suffix, value_json, suffix_name, unit_of_measurement?, device_class?) {
        const announce = this.initAnnunce(
            camera,
            icon,
            `yicam/${ camera }/info`,
            `yicam/${ camera }/info`,
            `${ Configuration.cameras[camera].friendly_name } ${ suffix_name }`,
            `${ Configuration.mqtt.base_topic }-${ camera }-${ suffix }`,
            `{{ ${ value_json } }}`,
            unit_of_measurement,
            device_class
            );
        this.publishMqtt(
            `${ Configuration.homeassistant.prefix}/sensor/${ camera }/${suffix}/config`,
            JSON.stringify(announce)
        );
    }

    initAnnunceSwitch(camera, icon, json_attributes_topic, state_topic, command_topic, name, unique_id, value_json, payload_on, payload_off) {
        const announce : AnnounceModel = {
            availability_topic: `${ Configuration.mqtt.base_topic }/${ camera }/status`,
            payload_available: 'online',
            device: {
                identifiers: [ 
                    `${ Configuration.mqtt.base_topic }_${ camera }`
                ],
                manufacturer: Configuration.global.manufacturer,
                model: Configuration.global.model,
                name: Configuration.cameras[camera].friendly_name,
                sw_version: '0.0.1'
            },
            icon: icon,
            json_attributes_topic: json_attributes_topic,
            state_topic:  state_topic,
            command_topic: command_topic,
            name: name,
            unique_id: unique_id,
            value_template: `{{ ${value_json} }}`,
            payload_on: payload_on,
            payload_off: payload_off
        }
        return announce;
    }

    announceSwitch(camera, icon, value_json, suffix, suffix_name, payload_on, payload_off) {
        const announce = this.initAnnunceSwitch(
            camera,
            icon,
            `yicam/${ camera }/config`,  //json_attributes_topic
            `yicam/${ camera }/config`,  //state_topic
            `yicam/${ camera }/config/${ suffix }/set`, //command_topic
            `${ Configuration.cameras[camera].friendly_name } ${ suffix_name }`, //Name
            `${ Configuration.mqtt.base_topic }-${ camera }-${ suffix }`, // Unique ID
            value_json,
            payload_on,
            payload_off
            );
        this.publishMqtt(
            `${ Configuration.homeassistant.prefix}/switch/${ camera }/${suffix}/config`,
            JSON.stringify(announce)
        );
    }
    
    
    /**
     * Status.json path
     */
    annunceHostname(camera) {
        this.announceSensorGeneric(camera, 'mdi:network', 'hostname', 'Hostname');
    }

    annunceIp(camera) {
        this.announceSensorGeneric(camera, 'mdi:ip', 'local_ip', 'Local IP');
    }
    
    annunceNetmask(camera) {
        this.announceSensorGeneric(camera, 'mdi:ip', 'netmask', 'Netmask');
    }
    
    annunceGateway(camera) {
        this.announceSensorGeneric(camera, 'mdi:ip', 'gateway', 'Gateway');
    }

    annunceMacAddress(camera) {
        this.announceSensorGeneric(camera, 'mdi:network', 'mac_addr', 'Mac Address');
    }

    annunceWlanESSID(camera) {
        this.announceSensorGeneric(camera, 'mdi:wifi', 'wlan_essid', 'WiFi ESSID');
    }


    annunceFirmwareVersion(camera) {
        this.announceSensorGeneric(camera, 'mdi:network', 'fw_version', 'Firmware Version');
    }

    annunceHomeVersion(camera) {
        this.announceSensorGeneric(camera, 'mdi:memory', 'home_version', 'Home Version');
    }

    annunceModelSuffix(camera) {
        this.announceSensorGeneric(camera, 'mdi:network', 'model_suffix', 'Model Suffix');
    }

    annunceSerialNumber(camera) {
        this.announceSensorGeneric(camera, 'mdi:webcam', 'serial_number', 'Serial Number');
    }

    annunceTotalMemory(camera) {
        this.announceSensorGeneric(camera, 'mdi:memory', 'total_memory', 'Total Memory', 'KB');
    }

    annunceFreeMemory(camera) {
        this.announceSensorGeneric(camera, 'mdi:memory', 'free_memory', 'Free Memory', 'KB');
    }

    annunceFreeSD(camera) {
        this.announceSensorGeneric(camera, 'mdi:micro-sd', 'free_sd', 'Free SD', '%', '|regex_replace(find="%", replace="", ignorecase=False)');
    }

    annunceLoadAvg(camera) {
        this.announceSensorGeneric(camera, 'mdi:network', 'load_avg', 'Load AVG');
    }

    announceUptime(camera) {
        this.announceCustomValue(camera, 'mdi:timer-outline', 'uptime', '(as_timestamp(now())-(value_json.uptime|int))|timestamp_local', 'Uptime', undefined, 'timestamp');
    }

    announceWlanStrengh(camera) {
        this.announceCustomValue(camera, 'mdi:wifi', 'wlan_strength', '((value_json.wlan_strength|int) * 100 / 70 )|int', 'Wlan Strengh', '%', 'signal_strength');
    }

    /**
     * MQTT
     */
    announceMovement(camera) {
        this.announceBinaryGeneric(camera, undefined, 'motion_detection', 'motion_start', 'motion_stop', 'Movement', undefined,  'motion', 1);
    }
    announceHumanDetection(camera) {
        this.announceBinaryGeneric(camera, undefined, 'ai_human_detection', 'human_start', 'human_stop', 'Human Detection', undefined,  'motion', 1);
    }
    announceSoundDetection(camera) {
        this.announceBinaryGeneric(camera, undefined, 'baby_crying', 'crying', undefined, 'Sound Detection', undefined,  'sound', 1,  60);
    }

    /**
     * Config
     */
    announceSwitchOn(camera) {
        this.announceSwitch(camera, 'mdi:video', 'value_json.SWITCH_ON', 'SWITCH_ON' , 'Switch Status', 'yes', 'no');
    }
    announceBabyCrying(camera) {
        this.announceSwitch(camera, 'mdi:emoticon-cry-outline', 'value_json.BABY_CRYING_DETECT', 'BABY_CRYING_DETECT' , 'Baby Crying', 'yes', 'no');
    }
    announceLed(camera) {
        this.announceSwitch(camera, 'mdi:led-on', 'value_json.LED', 'LED' , 'Status Led', 'yes', 'no');
    }
    announceIRLed(camera) {
        this.announceSwitch(camera, 'mdi:remote', 'value_json.IR', 'IR' , 'IR Led', 'yes', 'no');
    }
    announceRotate(camera) {
        this.announceSwitch(camera, 'mdi:monitor', 'value_json.ROTATE', 'ROTATE' , 'Rotate', 'yes', 'no');
    }

    publishAnnounce(camera) {
        /**
         * Status.json path
         */
        this.annunceHostname(camera);
        this.annunceIp(camera);
        this.annunceNetmask(camera);
        this.annunceGateway(camera);
        this.annunceMacAddress(camera);
        this.annunceWlanESSID(camera);
        this.annunceHomeVersion(camera);
        this.annunceFirmwareVersion(camera);
        this.annunceModelSuffix(camera);
        this.annunceSerialNumber(camera);
        this.annunceTotalMemory(camera);
        this.annunceFreeMemory(camera);
        this.annunceFreeSD(camera);
        this.annunceLoadAvg(camera);
        this.announceUptime(camera);
        this.announceWlanStrengh(camera);

        /**
         * MQTT 
         */
        this.announceMovement(camera);
        this.announceHumanDetection(camera);
        this.announceSoundDetection(camera);

        /**
         * Config 
         */
        this.announceSwitchOn(camera);
        this.announceBabyCrying(camera);
        this.announceLed(camera);
        this.announceIRLed(camera);
        this.announceRotate(camera);
    }
}