import { HTTPProvider } from '@zilliqa-js/core';
import Logger from '../../../lib/logger';
import axios from 'axios';

const logger = new Logger('ProxiedProvider');

export default class extends HTTPProvider {
  constructor() {
    super('http://127.0.0.1');

    logger.log('Provider initialised');

    this.ready = false;
    this.queue = [];
  }

  async configure(url) {
    logger.info('Received new node:', url);

    this.host = url;
    this.instance = axios.create({
      baseURL: url,
      timeout: 30000
    });

    this.ready = true;

    while(this.queue.length) {
      const { args, resolve, reject } = this.queue.shift();

      try {
        resolve = await this.request(...args);
      } catch (err) {
        logger.error(err);
      }

      logger.log(`Completed the queued request to ${ args[ 0 ] }`);
    }
  }

    request(endpoint, payload = {}, method = 'get') {
      if(!this.ready) {
        logger.info(`Request to ${ endpoint } has been queued`);

        return new Promise((resolve, reject) => {
          this.queue.push({
            args: [endpoint, payload, method],
            resolve,
            reject
          });
        });
      }

      return super.request(endpoint, payload, method).then(res => {
        let response = res.transaction || res;

        Object.defineProperty(response, '__payload__', {
          writable: false,
          enumerable: false,
          configurable: false,
          value: payload
        });

        return res;
      });
    }
}
