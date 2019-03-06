import extensionizer from 'extensionizer'


import Logger from '../lib/logger'

const logger = new Logger('ZilPay');


export default class {

  duplex = null;
  eventChannel = null;

  constructor(duplexTab, eventChannel) {
    logger.log('zil init');

    this.duplex = duplexTab;
    this.eventChannel = eventChannel;

    this.registerListeners();
    this.inject();
  }

  registerListeners() {
    this.eventChannel.on('tunnel', async data => {
      try {
        this.eventChannel.send(
            'tabReply',
            await this.duplex.send('tabRequest', data)
        );
      } catch(ex) {
        logger.error(ex);
      }
    });

    this.duplex.on('tunnel', ({ action, data }) => {
      this.eventChannel.send(action, data);
    });
  }

  inject() {
    let injectionSite = (document.head || document.documentElement);
    let container = document.createElement('script');

    container.src = extensionizer.extension.getURL('dist/pageHook.js');
    container.onload = function() {
        this.parentNode.removeChild(this);
    };

    injectionSite.insertBefore(
        container,
        injectionSite.children[0]
    );

    logger.log('ZilPay injected');
  }

}
