export default class {
  static jsNumberForAddress (address) {
    const addr = address.slice(2, 10);
    const seed = parseInt(addr, 16);
  
    return seed;
  }

  static strippedHost () {
    let host = window.location.hostname
    if (host.indexOf('www.') === 0) host = host.replace('www.', '')
    return host
  }

  static isFunction (obj) {
    return typeof obj === 'function'
  }

  static injectPromise (func, ...args) {
    return new Promise((resolve, reject) => {
      func(...args, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      })
    })
  }
  
}