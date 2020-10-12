# YI Hack AllWinner to Home Assistant

## Description

A small wrapper in nodejs to transform the [YI Hack All Winner](https://github.com/roleoroleo/yi-hack-Allwinner) webgui to a MQTT Provider integrated with Home Assistant

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

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Configuration

Create a `configuration.yaml` with these parameter:

```
homeassistant: 
  announce: true
  prefix: homeassistant
global:
  manufacturer: 'YI Tecnologies'
  model: 'YI Home Camera 1080p'
mqtt:
  base_topic: yicam
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
  'yi-cam-03':
    mqtt_prefix: 'yicam/yi-cam-03'
    friendly_name: 'Yi Camera 03'
    ip: '192.168.0.102'
```

## License

  Nest is [MIT licensed](LICENSE).
