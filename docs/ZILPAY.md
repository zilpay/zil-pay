# Using ZilPay in dapps.


init Zilliqa object
```javaScript
var blockchain = zilPay.blockchain;
var crypto = zilPay.crypto;
var utils = zilPay.utils;
```

get defaultAccount
```javaScript
var {base16, base58, bech32} = zilPay.wallet.defaultAccount;
```

subscribe on all account change.
```javaScript
zilPay.wallet.observableAccount().subscribe(console.log);
```
subscribe on all network change.
```javaScript
zilPay.wallet.observableNetwork().subscribe(console.log);
```

if default Account is null, you need ask permission via:
```javaScript
zilPay.wallet.connect().then(status => true || false);
```

state variables
```javaScript
zilPay.wallet.net // show selected network.
zilPay.wallet.isConnect // show permission to your dApp.
zilPay.wallet.isEnable // show unlock or lock wallet.
```