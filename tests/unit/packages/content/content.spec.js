/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
require('tests/extension-sinnon')

import { TypeChecker } from 'lib/type'

import { BrowserContent } from 'packages/content/content'
import { ContentBackgroundStream } from 'packages/content/local-stream'
import { ContentTabStream } from 'packages/content/tab-stream'

describe('packages:content:BrowserContent', () => {
  it('Should can import', () => {
    expect(BrowserContent).toBeTruthy()
  })

  it('Should can init class', () => {
    const content = new BrowserContent()

    expect(content).toBeTruthy()
  })

  it('Should be ContentTabStream property', () => {
    const content = new BrowserContent()

    expect(content.tabStream).toBeTruthy()
    expect(content.tabStream instanceof ContentTabStream).toBeTruthy()
  })

  it('Should be ContentBackgroundStream property', () => {
    const content = new BrowserContent()

    expect(content.backgroundStream).toBeTruthy()
    expect(content.backgroundStream instanceof ContentBackgroundStream).toBeTruthy()
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
