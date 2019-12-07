/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import sinonChrome from 'sinon-chrome'
import extension from 'extensionizer'
import { uuid } from 'uuidv4'
import { TypeChecker } from 'lib/type'

sinonChrome.runtime.id = uuid()

global.chrome = sinonChrome

extension.runtime = global.chrome.runtime

const { BrowserContent } = require('packages/content/content')
const { NonSecureStream } = require('packages/content/local-stream')
const { SecureStream } = require('packages/content/encrypted-stream')

describe('packages:content:BrowserContent', () => {
  it('Should can import', () => {
    expect(BrowserContent).toBeTruthy()
  })

  it('Should can init class', () => {
    const content = new BrowserContent()

    expect(content).toBeTruthy()
  })

  it('Should be secureStream property', () => {
    const content = new BrowserContent()

    expect(content.secureStream).toBeTruthy()
    expect(content.secureStream instanceof SecureStream).toBeTruthy()
  })

  it('Should be nonSecureStream property', () => {
    const content = new BrowserContent()

    expect(content.nonSecureStream).toBeTruthy()
    expect(content.nonSecureStream instanceof NonSecureStream).toBeTruthy()
  })

  it('Should be _dispenseMessage property', () => {
    const content = new BrowserContent()

    expect(content._dispenseMessage).toBeTruthy()
    expect(new TypeChecker(content._dispenseMessage).isFunction).toBeTruthy()
  })

  it('Should be _broadcastToSecure property', () => {
    const content = new BrowserContent()

    expect(content._broadcastToSecure).toBeTruthy()
    expect(new TypeChecker(content._broadcastToSecure).isFunction).toBeTruthy()
  })
})

