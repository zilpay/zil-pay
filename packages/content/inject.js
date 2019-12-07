/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { extension } from 'extensionizer'

import { TypeChecker } from 'lib/type'

export class Inject {

  constructor(name) {
    if (!new TypeChecker(name).isString) {
      throw new Error('Argument name must be string.')
    }

    this._name = name
    this._injectscript()
  }

  _injectscript () {
    // Create new script tag in the document head.
    const container = (document.head || document.documentElement)
    const scriptTag = document.createElement('script')
    const src = this._getUrlExtension()

    scriptTag.setAttribute('async', false)
    scriptTag.src = src
    container.insertBefore(scriptTag, container.children[0])
    container.removeChild(scriptTag)
  }

  _getUrlExtension() {
    try {
      return extension.getURL(`/${this._name}`)
    } catch(err) {
      // log.error('URL extension Error', err)
      return null
    }
  }

  _injectToHtml(container, injectionSite) {
    try {
      injectionSite.insertBefore(container, injectionSite.children[0])
    } catch(err) {
      // log.error('Script injection failed', err)
    }
  }
}
