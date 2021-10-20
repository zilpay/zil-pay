import type { ZIlPayBackground } from 'core/background/wallet/bg-zilpay';
import { BrowserStorage, buildObject } from 'lib/storage';
import assert from 'assert';
import { AccountTypes } from 'config/account-type';
import { Contracts } from 'config/contracts';
import type { MinParams } from 'types/transaction';

export async function testFromOld(core: ZIlPayBackground) {
  // const oldStore = {
  //   "blocknumber": "1506736",
  //   "config": {
  //     "mainnet": {
  //       "MSG_VERSION": 1,
  //       "PROVIDER": "https://api.zilliqa.com",
  //       "WS": "wss://api-ws.zilliqa.com"
  //     },
  //     "private": {
  //       "MSG_VERSION": 1,
  //       "PROVIDER": "http://127.0.0.1:5555",
  //       "WS": "ws://127.0.0.1:5555"
  //     },
  //     "testnet": {
  //       "MSG_VERSION": 1,
  //       "PROVIDER": "https://dev-api.zilliqa.com",
  //       "WS": "wss://dev-ws.zilliqa.com"
  //     }
  //   },
  //   "confirm": [],
  //   "connect": {},
  //   "contacts": [
  //     {
  //       "address": "zil1ncv4u5jku5p9kgpr70h7448pscfe7whyv5cw4p",
  //       "error": null,
  //       "name": "Ivan"
  //     }
  //   ],
  //   "importedvault": "U2FsdGVkX19DtN7459yL5EWqAkEVR64mcWuL8j7p2pE=",
  //   "selectedcoin": "ZIL",
  //   "selectednet": "mainnet",
  //   "ssnlist": [
  //     {
  //       "address": "",
  //       "api": "https://api.zilliqa.com",
  //       "id": 1,
  //       "name": "Main",
  //       "ok": true,
  //       "time": 420
  //     },
  //     {
  //       "address": "0x122219cceab410901e96c3a0e55e46231480341b",
  //       "api": "https://stakingseed-api.seed.zilliqa.com",
  //       "id": 1,
  //       "name": "Zilliqa",
  //       "time": 420
  //     },
  //     {
  //       "address": "0x2afe9e18edd39d927d0ffff8990612fc4afa2295",
  //       "api": "https://zil-staking.ezil.me/api",
  //       "id": 1,
  //       "name": "Ezil.me",
  //       "time": 894
  //     },
  //     {
  //       "address": "0x3ee34d308f962d17774a591f32cd1214e8bc470d",
  //       "api": "https://seed-zil.shardpool.io",
  //       "id": 1,
  //       "name": "Shardpool.io",
  //       "time": 891
  //     },
  //     {
  //       "address": "0x635eff625a147c7ca0397445eee436129ee6ca0b",
  //       "api": "https://ssn-zilliqa.moonlet.network/api",
  //       "id": 1,
  //       "name": "Moonlet.io",
  //       "time": 418
  //     },
  //     {
  //       "address": "0x657077b8dc9a60300fc805d559c0a5ef9bdd94a5",
  //       "api": "https://zilapi.everstake.one/status/TrdFrsHsHsYdOpfgNdTsIdxtJldtMfLd",
  //       "id": 1,
  //       "name": "Everstake.one",
  //       "time": 874
  //     },
  //     {
  //       "address": "0x82b82c65213e0b2b206492d3d8a2a679e7fe52e0",
  //       "api": "https://ssn-api-mainnet.viewblock.io",
  //       "id": 1,
  //       "name": "ViewBlock",
  //       "time": 848
  //     },
  //     {
  //       "address": "0x90d3dbd71c54c38341a6f5682c607e8a17023c28",
  //       "api": "https://zilliqa.atomicwallet.io/api",
  //       "id": 1,
  //       "name": "AtomicWallet",
  //       "time": 885
  //     },
  //     {
  //       "address": "0x9fb9e7ef9d0dd545c2f4a29a5bb97cc8ac15d2eb",
  //       "api": "https://ssn-zilliqa.cex.io/api",
  //       "id": 1,
  //       "name": "CEX.IO",
  //       "time": 417
  //     },
  //     {
  //       "address": "0xb83fc2c72c44b6b869c64384375c979dc3f7cf05",
  //       "api": "https://ssn.zillacracy.com/api",
  //       "id": 1,
  //       "name": "Zillacracy",
  //       "time": 416
  //     },
  //     {
  //       "address": "0xbf4e5001339dec3cda012f471f4f2d9e8bed2f5b",
  //       "api": "https://ssn.zillet.io",
  //       "id": 1,
  //       "name": "Zillet",
  //       "time": 880
  //     },
  //     {
  //       "address": "0xc3ed69338765424f4771dd636a5d3bfa0a776a35",
  //       "api": "https://zilliqa-api.staked.cloud",
  //       "id": 1,
  //       "name": "Staked",
  //       "time": 416
  //     },
  //     {
  //       "address": "0xd8de27a85c0dbc43bdd9a525e016670732db899f",
  //       "api": "https://staking-zil.kucoin.com/api",
  //       "id": 1,
  //       "name": "KuCoin",
  //       "time": 839
  //     }
  //   ],
  //   "static": "{\"currency\":\"USD\",\"addressFormat\":\"Bech32\",\"defaultGas\":{\"gasPrice\":\"2000\",\"gasLimit\":50},\"lockTime\":3,\"dappsList\":[{\"domain\":\"dragonzil.xyz\",\"icon\":\"https://dragonzil.xyz/favicon.ico\",\"title\":\"DragonZIL\"},{\"domain\":\"zilswap.io\",\"icon\":\"https://zilswap.io/assets/favicon/apple-touch-icon.png\",\"title\":\"Zilswap\"},{\"domain\":\"localhost\",\"icon\":\"http://localhost:3000/favicon/favicon.ico\",\"title\":\"ZilPay\"},{\"domain\":\"multisig.zilliqa.com\",\"icon\":\"https://multisig.zilliqa.com/favicon.ico\",\"title\":\"Zilliqa Multisig Wallet\"}]}",
  //   "theme": "dark",
  //   "tokens": {
  //   },
  //   "transactions": {
  //     "0x4ef291cEbD95ab4231eB52b02Cdf0E231Eab565a": {
  //       "mainnet": [
  //         {
  //           "Info": "Confirmed",
  //           "TranID": "0b62224fd45f25f00cf84e332dfd8538b51cf84c4a9d2151d0658c10aa8d97d8",
  //           "amount": "8906000000000",
  //           "block": "1488683",
  //           "confirmed": true,
  //           "decimals": null,
  //           "gasLimit": "50",
  //           "gasPrice": "2000000000",
  //           "nonce": 33,
  //           "symbol": null,
  //           "timestamp": 1633605950215,
  //           "toAddr": "0x119929d8c388DE3650Ea1B3DC7b9Fe0ceEFE862F",
  //           "type": 0
  //         }
  //       ]
  //     }
  //   },
  //   "vault": "U2FsdGVkX1+A5R0axjQrZCy8P+TvhLx5XQV6hMAupS0qC7a3sxWhwwyc0pQn9U7X0ln3DHIa8ZsPGPGFH7fhKmvTmEFGLLLpEetM8+dTytwsTvMub4pKIOHsivCd92z5gCIy5Lpk8vK9vUGG01+wzg==",
  //   "wallet": {
  //     "identities": [
  //       {
  //         "address": "0x7E74D6D8bACAb6B0812e059cF3cE7238d54Cab25",
  //         "balance": "0",
  //         "index": 0
  //       }
  //     ],
  //     "selectedAddress": 0
  //   }
  // };
  // const keys = Object.keys(oldStore);
  // const seed = 'lyrics dismiss laptop bitter song ghost sudden become cannon autumn arm imitate';
  // const pubKey = '0339df20369e3e69eea9bfaeac40f3be83a28969e0fe179e17453d898e8c2247ac';
  // const privKey = '713982bd736eae69380a15602a6bd37b29a863f81c8871d6c53ea7815857ab01';
  // const base16 = '0x7E74D6D8bACAb6B0812e059cF3cE7238d54Cab25';
  // const bech32 = 'zil10e6ddk96e2mtpqfwqkw08nnj8r25e2e9aue2xk';
  // const privateKey = '3375F915F3F9AE35E6B301B7670F53AD1A5BE15D8221EC7FD5E503F21D3450C8';

  // await BrowserStorage.clear();

  // for (let index = 0; index < keys.length; index++) {
  //   const key = keys[index];
  //   await BrowserStorage.set(
  //     buildObject(key, oldStore[key])
  //   );
  // }

  // await core.sync();

  // /// unlock
  // await core.popup.unlock('qazqaz', (params) => {
  //   assert(params.resolve['isReady'], 'Guard should be ready.');
  //   assert(params.resolve['isEnable'], 'Guard should be enabled.');
  // });
  // /// unlock

  // /// testing migrate
  // core.popup.initPopup(({ resolve }) => {
  //   assert.equal(pubKey, resolve['wallet'].identities[0].pubKey, 'incorrect pubKey');
  //   assert.equal(base16, resolve['wallet'].identities[0].base16, 'incorrect base16 address');
  //   assert.equal(bech32, resolve['wallet'].identities[0].bech32, 'incorrect bech32 address');
  //   assert.equal(0, resolve['wallet'].selectedAddress, 'incorrect index of acount');
  //   assert.equal('Account 0', resolve['wallet'].identities[0].name, 'incorrect start name');
  //   assert(Boolean(resolve['wallet'].identities[0].zrc2['0x0000000000000000000000000000000000000000']), 'incorrect start balance');

  //   assert(resolve['isReady'], 'Guard should be ready.');
  //   assert(resolve['isEnable'], 'Guard should be enabled.');

  //   assert(resolve['netwrok'] === 'mainnet', 'Netwrok should be mainnet');

  //   assert.equal(2, resolve['zrc2'].length, 'Should be 2 start tokens');
  // });
  // /// testing migrate

  // /// export seed
  // await core.wallet.exportSeedPhrase(({ resolve }) => {
  //   assert.equal(resolve, seed, 'Seed is not equal');
  // });
  // /// export seed

  // /// export privateKey
  // await core.wallet.exportPrivateKey(({ resolve }) => {
  //   assert.equal(resolve['base16'], base16, 'should be right keypair address');
  //   assert.equal(resolve['privKey'], privKey, 'should be right keypair privateKey');
  //   assert.equal(resolve['pubKey'], pubKey, 'should be right keypair pubKey');
  // });
  // /// export privateKey

  // await core.wallet.createAccountBySeed('test', ({ resolve, reject }) => {
  //   if (reject) {
  //     console.error(reject);
  //   }
  //   assert.equal(resolve['base16'], '0x92548120aDFB23EBCC3D341c1c5316db5b5ea171', 'Incorrect base16 address');
  //   assert.equal(resolve['bech32'], 'zil1jf2gzg9dlv37hnpaxswpc5ckmdd4agt3x7kqy2', 'Incorrect bech32 address');
  //   assert.equal(resolve['index'], 1, 'incorrect index');
  //   assert.equal(resolve['name'], 'test', 'Incorrect name');
  //   assert.equal(resolve['pubKey'], '0259f80fc287bb314c0a7b2c1512125487fbd08c93563268fe1c31c1a04edc810a', 'Incorrect publicKey');
  //   assert.equal(resolve['type'], AccountTypes.Seed, 'Incorrect account type');
  // });

  // core.popup.initPopup(({ resolve }) => {
  //   assert.equal(resolve['wallet'].selectedAddress, 1, 'Incorrect index of account');
  //   assert.equal(resolve['wallet'].identities.length, 2, 'Incorrect length of accounts');
  // });

  // await core.wallet.selectAccount(0, ({ resolve }) => {
  //   assert.equal(resolve['index'], 0, 'incorrect index');
  // });

  // core.popup.randomizeWords(256, ({ resolve }) => {
  //   assert(String(resolve).split(' ').length === 24, 'Shoud be 24 words');
  // });

  // core.popup.randomizeWords(128, ({ resolve }) => {
  //   assert(String(resolve).split(' ').length === 12, 'Shoud be 12 words');
  // });

  // /// import privateKey
  // const payload = {
  //   name: 'private account',
  //   privKey: privateKey
  // };
  // await core.wallet.importPrivateKey(payload, ({ resolve, reject }) => {
  //   if (reject) {
  //     console.error(reject);
  //   }
  //   assert.equal(resolve['index'], 0, 'incorrect index');
  //   assert.equal(resolve['name'], payload.name, 'Incorrect name');
  //   assert.equal(resolve['type'], AccountTypes.PrivateKey, 'Incorrect account type');
  //   assert.equal(resolve['base16'], '0x8254b2C9aCdf181d5d6796d63320fBb20D4Edd12', 'should be right keypair address');
  //   assert.equal(resolve['bech32'], 'zil1sf2t9jdvmuvp6ht8jmtrxg8mkgx5ahgj6h833r', 'should be right keypair address');
  //   assert.equal(resolve['pubKey'], '02bd2d38bd776319e685134041615fe3b8e8c674b65353624d2da8e2a6823e1a5b', 'should be right keypair pubKey');
  // });
  // /// import privateKey

  // // export private account
  // await core.wallet.exportPrivateKey(({ resolve, reject }) => {
  //   if (reject) {
  //     console.error(reject);
  //   }

  //   assert.equal(resolve['base16'], '0x8254b2C9aCdf181d5d6796d63320fBb20D4Edd12', 'incorrect base16 address');
  //   assert.equal(resolve['privKey'], privateKey, 'incorrect privateKey');
  //   assert.equal(resolve['pubKey'], '02bd2d38bd776319e685134041615fe3b8e8c674b65353624d2da8e2a6823e1a5b', 'incorrect Pubkey');
  // });
  // // export private account

  // // await core.netwrok.updateSSN(({ resolve }) => {
  // //   assert(resolve['list'].length > 0, 'list cannot be epmty');
  // //   assert(resolve['selected'] === 0, 'start selected should be 0');
  // // });

  // await core.netwrok.select('testnet', ({ resolve }) => {
  //   assert.equal('testnet', resolve, 'new net should be testnet');
  // });

  // await core.wallet.balanceUpdate(({ resolve }) => {
  //   const account = resolve['identities'][resolve['selectedAddress']];
  //   assert(Number(account.zrc2[Contracts.ZERO_ADDRESS]) > 0, 'balance didn not updated;');
  // });

  // const newApp = {
  //   domain: 'zilpay.xyz',
  //   icon: 'https://zilpay.io/favicon/apple-icon-192x192.png',
  //   title: 'zilpay'
  // };
  // await core.apps.addApp(newApp, ({ resolve }) => {
  //   assert.deepEqual(resolve[0], newApp, 'App doesn not mach');
  // });

  // await core.apps.addConfirm(newApp, ({ resolve }) => {
  //   assert.deepEqual(resolve, newApp, 'App doesn not mach');
  // });

  // const newContact = {
  //   name: 'test',
  //   address: 'zil1wl38cwww2u3g8wzgutxlxtxwwc0rf7jf27zace'
  // };
  // await core.contacts.addContact(newContact, ({ resolve, reject }) => {
  //   if (reject) {
  //     console.error(reject);
  //   }

  //   assert.deepEqual(resolve[0], newContact, 'Contact is not mach');
  // });

  // await core.contacts.removeContact(0, ({ resolve }) => {
  //   assert.deepEqual([], resolve, 'should be empty')
  // });

  // const newTx: MinParams = {
  //   amount: '0',
  //   code: '',
  //   data: '',
  //   gasLimit: '50',
  //   gasPrice: '2000',
  //   toAddr: '0x46Ede3060432ef81594F575E4eB2e6B535b062ef'
  // };
  // await core.transaction.addConfirm(newTx, ({ resolve }) => {
  //   assert.deepEqual(newTx, resolve, 'resolve is not equal');
  // });
  // await core.transaction.signSendTx(0, newTx, ({ resolve, reject }) => {
  //   if (reject) {
  //     console.error(reject);
  //   }
  //   console.log(resolve);
  //   assert(resolve[0]['hash'], 'Txns wans sent.');
  // });
  // await core.transaction.rmConfirm(0, ({ resolve }) => {
  //   assert.deepEqual([], resolve, 'resolve is not equal');
  // });

  // await core.transaction.addConfirm(newTx, () => null);
  // await core.transaction.addConfirm(newTx, () => null);
  // await core.transaction.addConfirm(newTx, () => null);
  // await core.transaction.addConfirm(newTx, () => null);
  // await core.transaction.addConfirm(newTx, () => null);

  // await core.transaction.rejectAll(({ resolve }) => {
  //   assert.deepEqual([], resolve, 'resolve is not equal');
  // });

  await core.sync();

  /// unlock
  await core.popup.unlock('qazqaz', (params) => {
    assert(params.resolve['isReady'], 'Guard should be ready.');
    assert(params.resolve['isEnable'], 'Guard should be enabled.');
  });
  /// unlock

  core.popup.initPopup(({ resolve }) => {
    console.log(resolve);
  });


  console.log('end-testing');
}
