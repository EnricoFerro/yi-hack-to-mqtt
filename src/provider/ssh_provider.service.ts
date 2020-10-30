
import { Client } from 'ssh2';

import { Injectable, Logger } from '@nestjs/common';

import { Configuration } from '../config/configuration';
import { from } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';


@Injectable()
export class SshProviderService implements IProvider {
    private readonly logger = new Logger(SshProviderService.name);

    switch_off_cmd = 'sed -i "s/SWITCH_ON=yes/SWITCH_ON=no/g" /home/yi-hack/etc/camera.conf; /home/yi-hack/bin/ipc_cmd -t off';
    switch_on_cmd = 'sed -i "s/SWITCH_ON=no/SWITCH_ON=yes/g" /home/yi-hack/etc/camera.conf; /home/yi-hack/bin/ipc_cmd -t on';
    baby_crying_off_cmd = 'sed -i "s/BABY_CRYING_DETECT=yes/BABY_CRYING_DETECT=no/g" /home/yi-hack/etc/camera.conf; /home/yi-hack/bin/ipc_cmd -b off';
    baby_crying_on_cmd = 'sed -i "s/BABY_CRYING_DETECT=no/BABY_CRYING_DETECT=yes/g" /home/yi-hack/etc/camera.conf; /home/yi-hack/bin/ipc_cmd -b on';
    led_off_cmd = 'sed -i "s/LED=yes/LED=no/g" /home/yi-hack/etc/camera.conf; /home/yi-hack/bin/ipc_cmd -l off';
    led_on_cmd = 'sed -i "s/LED=no/LED=yes/g" /home/yi-hack/etc/camera.conf; /home/yi-hack/bin/ipc_cmd -l on';
    ir_off_cmd = 'sed -i "s/IR=yes/IR=no/g" /home/yi-hack/etc/camera.conf; /home/yi-hack/bin/ipc_cmd -i off';
    ir_on_cmd = 'sed -i "s/IR=no/IR=yes/g" /home/yi-hack/etc/camera.conf; /home/yi-hack/bin/ipc_cmd -i on';
    rotate_off_cmd = 'sed -i "s/ROTATE=yes/ROTATE=no/g" /home/yi-hack/etc/camera.conf; /home/yi-hack/bin/ipc_cmd -r off';
    rotate_on_cmd = 'sed -i "s/ROTATE=no/ROTATE=yes/g" /home/yi-hack/etc/camera.conf; /home/yi-hack/bin/ipc_cmd -r on';
    human_on_cmd = 'sed -i "s/AI_HUMAN_DETECTION=no/AI_HUMAN_DETECTION=yes/g" /home/yi-hack/etc/camera.conf; /home/yi-hack/bin/ipc_cmd -a on';
    human_off_cmd = 'sed -i "s/AI_HUMAN_DETECTION=yes/AI_HUMAN_DETECTION=no/g" /home/yi-hack/etc/camera.conf; /home/yi-hack/bin/ipc_cmd -a off';
    save_on_cmd = 'sed -i "s/SAVE_VIDEO_ON_MOTION=no/SAVE_VIDEO_ON_MOTION=yes/g" /home/yi-hack/etc/camera.conf; /home/yi-hack/bin/ ipc_cmd -v detect';
    save_off_cmd = 'sed -i "s/SAVE_VIDEO_ON_MOTION=yes/SAVE_VIDEO_ON_MOTION=no/g" /home/yi-hack/etc/camera.conf; /home/yi-hack/bin/ ipc_cmd -v always';
    motion_cmd = 'sed -i "s/SENSITIVITY=.*/SENSITIVITY=%MOTION_COMMAND%/g" /home/yi-hack/etc/camera.conf; /home/yi-hack/bin/ ipc_cmd -s %MOTION_COMMAND%';

    private launchCommand(camera, command, env?): Promise<any> {
        const username = Configuration.global && Configuration.global.provider && Configuration.global.provider.user || Configuration.cameras && Configuration.cameras[camera] && Configuration.cameras[camera].provider && Configuration.cameras[camera].provider.user || 'root';
        const password = Configuration.global && Configuration.global.provider && Configuration.global.provider.password || Configuration.cameras && Configuration.cameras[camera] && Configuration.cameras[camera].provider && Configuration.cameras[camera].provider.password;

        return new Promise((resolve, reject) => {
            const camera_ip = Configuration.cameras[camera].ip
            const retValue = [];
            const errValue = [];
            const conn = new Client();
            conn.on('ready', function () {
                // console.log('Client :: ready');
                conn.exec(command, { env }, function (err, stream) {
                    if (err) throw err;
                    stream.on('close', function (code, signal) {
                        // console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
                        if (code !== 0) {
                            const bufErr = Buffer.concat(errValue);
                            reject(bufErr.toString());
                        } else {
                            const buf = Buffer.concat(retValue);
                            resolve(buf.toString());
                        }
                        conn.end();
                    }).on('data', function (data) {
                        retValue.push(data);
                        // console.log('STDOUT: ' + data);
                    }).stderr.on('data', function (data) {
                        errValue.push(data);
                        // console.log('STDERR: ' + data);
                    });
                });
            }).on('error', function(error) {
                reject(error);
            }).connect({
                host: camera_ip,
                port: 22,
                username: username,
                password: password
            });
        })
    }

    getLink(camera: any): Promise<any> {
        this.logger.debug(`Lanch ssh /home/yi-hack/www/cgi-bin/links.sh for camera ${camera}`);
        return from(this.launchCommand(camera, '/home/yi-hack/www/cgi-bin/links.sh'))
            .pipe(map(val => JSON.parse(val.replace('Content-type: application/json', '')))).toPromise();
    }
    getStatus(camera: any): Promise<any> {
        this.logger.debug(`Lanch ssh /home/yi-hack/www/cgi-bin/status.json ${camera}`);
        return from(this.launchCommand(camera, '/home/yi-hack/www/cgi-bin/status.json'))
            .pipe(map(val => JSON.parse(val.replace('Content-type: application/json', '')))).toPromise();
    }
    getConfig(camera: any): Promise<any> {
        this.logger.debug(`Lanch ssh cat /home/yi-hack/etc/camera.conf ${camera}`);
        return from(this.launchCommand(camera, 'cat /home/yi-hack/etc/camera.conf'))
            .pipe(map(val => {
                const arrVal = val.split('\n');
                const retVal = {};
                for (const iterator of arrVal) {
                    if (iterator !== '') {
                        const keyval = iterator.split('=');
                        retVal[keyval[0]] = keyval[1];
                    }
                }
                return retVal;
            })).toPromise();
    }
    setConfigItem(camera: any, item_id: any, item_value: any): Promise<any> {
        let cmd = '';
        switch (item_value) {
            case 'yes':
                switch (item_id) {
                    case 'SWITCH_ON':
                        cmd = this.switch_on_cmd;
                        break;
                    case 'AI_HUMAN_DETECTION':
                        cmd = this.human_on_cmd;
                        break;
                    case 'SAVE_VIDEO_ON_MOTION':
                        cmd = this.save_on_cmd;
                        break;
                    case 'BABY_CRYING_DETECT':
                        cmd = this.baby_crying_on_cmd;
                        break;
                    case 'LED':
                        cmd = this.led_on_cmd;
                        break;
                    case 'IR':
                        cmd = this.ir_on_cmd;
                    case 'ROTATE':
                        cmd = this.rotate_on_cmd;
                        break;
                    default:
                        break;
                }
                break;

            case 'no':
                switch (item_id) {
                    case 'SWITCH_ON':
                        cmd = this.switch_off_cmd;
                        break;
                    case 'AI_HUMAN_DETECTION':
                        cmd = this.human_on_cmd;
                        break;
                    case 'SAVE_VIDEO_ON_MOTION':
                        cmd = this.save_on_cmd;
                        break;
                    case 'BABY_CRYING_DETECT':
                        cmd = this.baby_crying_off_cmd;
                        break;
                    case 'LED':
                        cmd = this.led_off_cmd;
                        break;
                    case 'IR':
                        cmd = this.ir_off_cmd;
                    case 'ROTATE':
                        cmd = this.rotate_off_cmd;
                        break;
                    default:
                        break;
                }
                break;
        }
        if (( item_id === 'SENSITIVITY') && (
            ( item_value === 'high') ||
            ( item_value === 'medium') ||
            ( item_value === 'high')
        )) {
            cmd = this.motion_cmd.replace('%MOTION_COMMAND%',item_value);
        }
        if (cmd !== '') {
            this.logger.debug(`Lanch ssh ${cmd}`);
            return from(this.launchCommand(camera, cmd))
                .pipe(
                    mergeMap(() => this.getConfig(camera))
                ).toPromise();
        } else {
            return this.getConfig(camera);
        }
    }
}