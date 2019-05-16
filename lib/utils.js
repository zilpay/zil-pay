export default class {
  static jsNumberForAddress (address) {
    const addr = address.slice(2, 10);
    const seed = parseInt(addr, 16);
  
    return seed;
  }

  static strippedHost () {
    /**
     * Parse hostname
     * @returns String: domain.
     */
    let host = window.location.hostname;
    if (host.indexOf('www.') === 0) {
      host = host.replace('www.', '');
    }
    return host;
  }
  
}

export function validateURL(str) {
  let pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(str);
}