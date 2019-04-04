import { AccountControl } from './create'
import uuidv4 from 'uuid/v4'
// import ZilliqaConfig from '../../../config/zil'
import fields from '../../../config/fields'

const browserStorage = new BrowserStorage();
const decryptSeed = 'banana blind business arrest escape blame stadium display border flower daughter story';
const password = uuidv4();

describe('Test Account control', () => {
  var accountControl;

  test('init auth control', () => {
    accountControl = new AccountControl();
  });

});
