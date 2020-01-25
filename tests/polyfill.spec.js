if (global.window.document) {
  global.window.document.createRange = () => ({
    setStart: () => {},
    setEnd: () => {},
    commonAncestorContainer: {
      nodeName: 'BODY',
      ownerDocument: global.window.document
    }
  })
}
