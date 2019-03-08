import { extension } from 'extensionizer';
import { Loger } from '../../lib/logger';
import Config from '../../config/api'


const log = new Loger(Config.PAY_NAME);

export class Inject {

  constructor(name) {
    this._name = name;
    this._injectscript();
  }

  _injectscript () {
    let injectionSite = (document.head || document.documentElement);
    let container = document.createElement('script');
    const src = this._getUrlExtension();

    container.setAttribute('async', false);
    container.src = src;
    container.onload = function() {
      this.parentNode.removeChild(this);
    };
    this._injectToHtml(container, injectionSite);
  }

  _getUrlExtension() {
    try {
      return extension.getURL(`/${this._name}`);
    } catch(err) {
      log.error('URL extension Error', err);
      return null;
    }
  }

  _injectToHtml(container, injectionSite) {
    try {
      injectionSite.insertBefore(container, injectionSite.children[0]);
    } catch(err) {
      log.error('Script injection failed', err);
    }
  }
}