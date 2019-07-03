import Handler from './handler'
import ZilPay from './zil-pay'


// Create handler stream. 
const handler = new Handler();
// Init ZilPay object with some methods and properties.
const zilPay = new ZilPay(handler.subjectStream, handler.stream);

// Update state(network, accounts).
handler.stateUpdate();

// Nobody can change this object.
Object.freeze(zilPay);
// Init zilPay in some tab.
window.zilPay = zilPay;