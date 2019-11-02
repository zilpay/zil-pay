/* eslint-disable no-undef */
import { UnstoppableDomains } from './ud';

const DOMAIN = 'brad.zil';

describe('Test UnstoppableDomains control', () => {
  const unstoppableDomains = new UnstoppableDomains();

  test('init UnstoppableDomains control', () => {
    expect(unstoppableDomains);
  });

  test('Try get domain owner', async () => {
    const data = await unstoppableDomains.getAddressByDomain(DOMAIN);
    
    expect(data.domain).toBe(DOMAIN);
    expect(data.owner).toBe('0x2d418942dce1afa02d0733a2000c71b371a6ac07');
    expect(data.domainHash).toBe('0x5fc604da00f502da70bfbc618088c0ce468ec9d18d05540935ae4118e8f50787');
  });

});
