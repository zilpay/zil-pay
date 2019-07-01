import Handler from './handler'
import ZilPay from './zil-pay'

const handler = new Handler();
window.zilPay = new ZilPay(handler.subjectStream, handler.stream);
handler.stateUpdate();
