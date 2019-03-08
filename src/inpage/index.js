

import { InPage } from './browser/main'
import config from '../config/zil'

const keys = Object.keys(config);
const { PROVIDER } = config[keys[0]];

export default new InPage(PROVIDER);