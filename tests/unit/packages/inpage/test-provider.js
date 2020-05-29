import HTTPProvider from 'packages/inpage/provider'

const { Promise } = global

export class HTTPProviderTest extends HTTPProvider {

  send(method, ...params) {
    return Promise.resolve({
      method,
      params,
      id: 1,
      jsonrpc: '2.0'
    })
  }

}
