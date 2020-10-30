# YI Hack to MQTT

## Description

A small wrapper in NestJs to transform the [YI Hack All Winner](https://github.com/roleoroleo/yi-hack-Allwinner) webgui or ssh to a MQTT Provider.
At this moment is tested only with [YI Hack All Winner](https://github.com/roleoroleo/yi-hack-Allwinner) Camera
It also have an integrated with Home Assistant to MQTT Discovery.

This is wrapper is inspired by [Zigbee2MQTT Home Assistant Integration](https://www.zigbee2mqtt.io/integration/home_assistant.html) and [Shelly Discovery](https://github.com/bieniu/ha-shellies-discovery)

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```


## Configuration

Create a `configuration.yaml` with these parameter:

```yaml
homeassistant: 
  announce: true
    # Optional: Home Assistant discovery topic (default: homeassistant )
  prefix: homeassistant
global:
  # Optional: Manifacturer of the device
  manufacturer: 'YI'
  # Optional: Model of the device
  model: 'YI Hack'
  provider: 
    # Optional: Provider of the connection (default: http )
    # possible options: 'http', 'ssh'
    source: http
    # Optional: User for the connection (default: root )
    user: root
    # Optional: Password for the connection ( default empty)
    password: password
mqtt:
  # Required: MQTT base topic for MQTT messages
  base_topic: yicam
    # Required: MQTT server URL 
  server: 'mqtt://192.168.0.100'
cameras:
  'yi-cam-01':
    mqtt_prefix: 'yicam/yi-cam-01'
    friendly_name: 'Yi Camera 01'
    ip: '192.168.0.101'
  'yi-cam-02':
    mqtt_prefix: 'yicam/yi-cam-02'
    friendly_name: 'Yi Camera 02'
    ip: '192.168.0.102'
    # Required: Disable availability_topic for HomeAssistant ( default true)
    availability_topic: false
  'yi-cam-03':
    mqtt_prefix: 'yicam/yi-cam-03'
    friendly_name: 'Yi Camera 03'
    ip: '192.168.0.102'
```

## MQTT Topic and structure

### \<yicam>/info/get

Allow to retriew all status for all the camera configurated.

Example:
```
mosquitto_pub -h broker –t yicam/info/get
```

### \<yicam>/\<yi-camera>/info/get

Allow to retriew all status for the camera \<yi-camera> configurated.

Example:
```
mosquitto_pub -h broker –t yicam/yi-cam-01/info/get
```

### \<yicam>/links/get

Allow to retriew all links for all the camera configurated.

Example:
```
mosquitto_pub -h broker –t yicam/links/get
```

### \<yicam>/\<yi-camera>/links/get 

Allow to retriew all links for all the camera configurated.

Example:
```
mosquitto_pub -h broker –t yicam/yi-cam-01/links/get
```

### \<yicam>/\<yi-camera>/config/get 
Allow to retriew all configs for all the camera configurated.

Example:
```
mosquitto_pub -h broker –t yicam/yi-cam-01/config/get –m yes
```

### \<yicam>/\<yi-camera>/config/\<config>/set 

Allow to configure a command with payload `yes` or `no`:
The `<config>` allowed are:
* `SWITCH_ON`
* `SAVE_VIDEO_ON_MOTION` 
* `AI_HUMAN_DETECTION`
* `LED`
* `ROTATE`
* `IR`

Or `SENSITIVITY` with payload `high`,`medium`,`low`


Example:
```
mosquitto_pub -h broker –t yicam/yi-cam-01/config/LED/set –m yes
```
### \<yicam>/announce

Launch the announce mqtt discovery for Home Assistant

## Home Assistant Configuration
```
# automations.yaml file
- id: yicam_announce
  alias: 'YiCam Announce'
  trigger:
    - platform: homeassistant
      event: start
    - platform: time_pattern
      hours: "/1"
  action:
    service: mqtt.publish
    data:
      topic: yicam/announce
- id: yicam_info_get
  alias: 'YiCam Get Information'
  trigger:
    - platform: homeassistant
      event: start
    - platform: time_pattern
      minutes: '/2'
  action:
    - service: mqtt.publish
      data:
        topic: yicam/info/get
    - service: mqtt.publish
      data:
        topic: yicam/config/get
    - service: mqtt.publish
      data:
        topic: yicam/links/get
```

## Docker Run

In RasperryPi ( in raspbian ):
```
docker mkdir /home/pi/yi-hack-2-mqtt
```

Create and modify your configuration file:
```
nano configuration.yaml
```

```
docker run -it --name yi-hack-2-mqtt -d --restart unless-stopped -v /home/pi/configuration.yaml:/data/configuration.yaml enricoferro/yi-hack-2-mqtt:latest
```

## License

* [MIT licensed](LICENSE).
