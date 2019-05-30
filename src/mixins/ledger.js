import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'


const CLA = 0xe0;
const INS = {
  'getVersion': 0x01,
  'getPublickKey': 0x02,
  'getAddress': 0x02
};

class Z {
  constructor(transport, scrambleKey = "w0w") {
      this.transport = transport;
      transport.decorateAppAPIMethods(
          this,
          [
              'getVersion',
              'getPublicKey',
          ],
          scrambleKey
      );
  }
  getVersion() {
      const P1 = 0x00;
      const P2 = 0x00;
      return this.transport
          .send(CLA, INS.getVersion, P1, P2)
          .then(response => {
              let version = "v";
              for (let i = 0; i < 3; ++i) {
                  version += parseInt('0x' + response[i]);
                  if (i !== 2) {
                      version += "."
                  }
              }
              return {version};
          });
  }
  getPublicKey(index) {
      const P1 = 0x00;
      const P2 = 0x01;
      let payload = new Buffer(4);
      payload.writeInt32LE(index);
      return this.transport
          .send(CLA, INS.getAddress, P1, P2, payload)
          .then(response => {
              const publicKey = response.toString('hex');
              return {publicKey};
          });
  }
}


TransportNodeHid


export default {
  data() {
    return {
      appVersion: this.appVersion
    };
  },
  methods: {


      getAppVersion() {
          return TransportNodeHid.open("")
              .then(transport => {
                  transport.setDebugMode(true);
                  const zil = new Z(transport);
                  return zil.getVersion().then(r => {
                      this.appVersion = r.version;
                      transport.close().catch(e => {}).then(() => r);
                  });
              })
              .catch(e => {
                  this.appVersion = e.message
                  // try again until success!
                  return new Promise(s => setTimeout(s, 1000)).then(() =>
                      this.getAppVersion()
                  );
              });
      }
  },
  created: function () {
      this.appVersion = "Loading version...";
      this.getAppVersion()
  }
}