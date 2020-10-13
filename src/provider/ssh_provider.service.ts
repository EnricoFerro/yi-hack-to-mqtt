
import { Client } from 'ssh2';

import { Injectable } from '@nestjs/common';

import { Configuration } from '../config/configuration';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable()
export class SshProviderService implements IProvider {

    switch_off_cmd = 'sed -i "s/SWITCH_ON=yes/SWITCH_ON=no/g" /home/yi-hack-v4/etc/camera.conf; /home/yi-hack-v4/bin/ipc_cmd -t off';
    switch_on_cmd = 'sed -i "s/SWITCH_ON=no/SWITCH_ON=yes/g" /home/yi-hack-v4/etc/camera.conf; /home/yi-hack-v4/bin/ipc_cmd -t on';
    baby_crying_off_cmd = 'sed -i "s/BABY_CRYING_DETECT=yes/BABY_CRYING_DETECT=no/g" /home/yi-hack-v4/etc/camera.conf; /home/yi-hack-v4/bin/ipc_cmd -b off';
    baby_crying_on_cmd = 'sed -i "s/BABY_CRYING_DETECT=no/BABY_CRYING_DETECT=yes/g" /home/yi-hack-v4/etc/camera.conf; /home/yi-hack-v4/bin/ipc_cmd -b on';
    led_off_cmd = 'sed -i "s/LED=yes/LED=no/g" /home/yi-hack-v4/etc/camera.conf; /home/yi-hack-v4/bin/ipc_cmd -l off';
    led_on_cmd = 'sed -i "s/LED=no/LED=yes/g" /home/yi-hack-v4/etc/camera.conf; /home/yi-hack-v4/bin/ipc_cmd -l on';
    ir_off_cmd = 'sed -i "s/IR=yes/IR=no/g" /home/yi-hack-v4/etc/camera.conf; /home/yi-hack-v4/bin/ipc_cmd -i off';
    ir_on_cmd = 'sed -i "s/IR=no/IR=yes/g" /home/yi-hack-v4/etc/camera.conf; /home/yi-hack-v4/bin/ipc_cmd -i on';
    rotate_off_cmd = 'sed -i "s/ROTATE=yes/ROTATE=no/g" /home/yi-hack-v4/etc/camera.conf; /home/yi-hack-v4/bin/ipc_cmd -r off';
    rotate_on_cmd = 'sed -i "s/ROTATE=no/ROTATE=yes/g" /home/yi-hack-v4/etc/camera.conf; /home/yi-hack-v4/bin/ipc_cmd -r on';

    private launchCommand(camera,command, env?): Promise<any> {
        return new Promise((resolve,reject) => {
            const camera_ip = Configuration.cameras[camera].ip
            const retValue = [];
            const errValue = [];
            const conn = new Client();
            conn.on('ready', function() {
                // console.log('Client :: ready');
                conn.exec(command, { env }, function(err, stream) {
                    if (err) throw err;
                    stream.on('close', function(code, signal) {
                        // console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
                        if (code !== 0) {
                            const bufErr = Buffer.concat(errValue);
                            reject(errValue.toString());
                        } else {
                            const buf = Buffer.concat(retValue);
                            resolve(buf.toString());
                        }
                        conn.end();
                    }).on('data', function(data) {
                        retValue.push(data);
                        // console.log('STDOUT: ' + data);
                    }).stderr.on('data', function(data) {
                        errValue.push(data);
                        // console.log('STDERR: ' + data);
                    });
                });
            }).connect({
                host: camera_ip,
                port: 22,
                username: 'root',
                password: 'password'
            });
        })
    }

    getLink(camera: any): Promise<any> {
        return from(this.launchCommand(camera,'/home/yi-hack/www/cgi-bin/links.sh'))
            .pipe(map(val => JSON.parse(val.replace('Content-type: application/json','')))).toPromise();
    }
    getStatus(camera: any): Promise<any> {
        return from(this.launchCommand(camera,'/home/yi-hack/www/cgi-bin/status.json'))
            .pipe(map(val => JSON.parse(val.replace('Content-type: application/json','')))).toPromise();
    }
    getConfig(camera: any): Promise<any> {
        return from(this.launchCommand(camera,'cat /home/yi-hack/etc/camera.conf'))
            .pipe(map(val => {
                const arrVal = val.split('\n');
                const retVal = {};
                for (const iterator of arrVal) {
                    if ( iterator !== '') {
                        const keyval = iterator.split('=');
                        retVal[keyval[0]] = keyval[1];
                    }
                }
                return retVal;
            })).toPromise();
    }
    setConfigItem(camera: any, item_id: any, item_value: any): Promise<any> {
        throw new Error('Method not implemented.');
        let cmd = '';
        switch (item_value) {
            case 'yes':
                switch (item_id) {
                    case 'SWITCH_ON':
                        cmd = this.switch_on_cmd;
                        break;
                    case 'BABY_CRYING_DETECT':
                        cmd = this.baby_crying_on_cmd;
                        break;
                    default:
                        break;
                }
                break;
        
            case 'no':
                break;
        }
    }

}