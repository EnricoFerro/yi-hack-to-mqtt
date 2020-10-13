import axios from 'axios';
import { from } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

import { Injectable } from '@nestjs/common';

import { Configuration } from '../config/configuration';

@Injectable()
export class HttpProviderService implements IProvider {

    private getUrlContent(url, timeout = 1000) {
        return from(axios.get(url, {
          timeout: timeout
        })).pipe(map(response => response.data)).toPromise(); 
    } 

    getLink(camera): Promise<any> {
        const camera_ip = Configuration.cameras[camera].ip;
        return this.getUrlContent(`http://${camera_ip}/cgi-bin/links.sh`);
    }

    getStatus(camera): Promise<any> {
        const camera_ip = Configuration.cameras[camera].ip
        return this.getUrlContent(`http://${camera_ip}/cgi-bin/status.json`);
    }

    getConfig(camera): Promise<any> {
        const camera_ip = Configuration.cameras[camera].ip
        return from(this.getUrlContent(`http://${camera_ip}/cgi-bin/get_configs.sh?conf=camera`))
            .pipe(map(data => {
                delete data.NULL;
                return data; 
            }))
            .toPromise();
    }
    
    private setConfigCall(camera, data): Promise<any> {
        let operation = '';
        Object.keys(data).forEach(item => {
            if ( operation === '' ) {
                operation=`${item.toLowerCase()}=${data[item]}`
            } else {
                operation=`${ operation }&${item.toLowerCase()}=${data[item]}`
            }
        });
        const camera_ip = Configuration.cameras[camera].ip
        return from(this.getUrlContent(`http://${camera_ip}/cgi-bin/camera_settings.sh?${ operation }`, 10000))
            .pipe(map(val => {
                return data; 
            }))
            .toPromise();
    }
    
    setConfigItem(camera,item_id,item_value): Promise<any> {
        if (((( item_id === 'SWITCH_ON') 
            || ( item_id === 'SAVE_VIDEO_ON_MOTION') 
            || ( item_id === 'AI_HUMAN_DETECTION') 
            || ( item_id === 'LED') 
            || ( item_id === 'ROTATE')
            || ( item_id === 'IR')
            ) && (  
                ( item_value === 'no') 
                ||( item_value === 'yes')

            )) || (
                ( item_id === 'SENSITIVITY') && (
                    ( item_value === 'high') ||
                    ( item_value === 'medium') ||
                    ( item_value === 'high')
                )
            )) {
                return from(this.getConfig(camera))
                    .pipe(mergeMap(data => {
                        data[item_id]=item_value
                        return from(this.setConfigCall(camera, data))
                    })).toPromise();
            }
        else {
            return this.getConfig(camera);
        }
    }

}