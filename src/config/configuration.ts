
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';

import * as dotenv from 'dotenv';

dotenv.config();

const data = () => {
    const file = fs.readFileSync(path.join(__dirname, '../..', process.env.CONFIGURATION_FILE || 'configuration.yaml'), 'utf8');
    const data = yaml.safeLoad(file);
    return data;
}

export const Configuration = data(); 

export default data;