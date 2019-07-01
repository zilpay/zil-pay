export function getFavicon() {
  let favicon = undefined;
  let nodeList = document.getElementsByTagName('link');
  
  for (let i = 0; i < nodeList.length; i++) {
    if((nodeList[i].getAttribute('rel') == 'icon') || (nodeList[i].getAttribute('rel') == 'shortcut icon')) {
      favicon = nodeList[i].getAttribute('href');
    }
  }

  if (!favicon.includes(window.document.domain)) {
    if (favicon[0] !== '/') {
      favicon = window.location.origin + '/' + favicon;
    } else {
      favicon = window.location.origin + favicon;
    }
  }
  return favicon;        
}