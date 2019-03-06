import MessageDuplex from '../lib/messageDuplex'
import EventChannel from '../lib/eventChannel.js';
import Script from './script.js'


const content = new Script(
  new MessageDuplex.Tab(),
  new EventChannel('contentScript')
);

content.init();

export default content;
