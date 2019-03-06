import Child from './handlers/child';
import EventChannel from './eventChannel';
import Script from './script'


const Tab = Child.bind(null, 'tab');
const Popup = Child.bind(null, 'popup');

export default script = new Script(
  new Tab(),
  new EventChannel('contentScript')
);
