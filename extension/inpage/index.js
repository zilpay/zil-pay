import Handler from './handler'
import ZilPay from './zil-pay'

// Create handler stream. 
const handler = new Handler();
// Init zilPay in some tab.
window.zilPay = new ZilPay(handler.subjectStream, handler.stream);
// Update state(network, accounts).
handler.stateUpdate();
