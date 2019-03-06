import Child from './handlers/child.js';
import EventChannel from './eventChannel.js';
import Script from './script.js'


const Tab = Child.bind(null, 'tab');
const Popup = Child.bind(null, 'popup');

const content = new Script(
  new Tab(),
  new EventChannel('contentScript')
);

content.init();

export default content;
