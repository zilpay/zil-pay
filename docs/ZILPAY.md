# Using ZilPay in dapps.


init Zilliqa object
```javaScript
var zilliqa = new Zilliqa();
var utils = zilliqa.utils;
```

get defaultAccount
```javaScript
var {base16, base58, bech32} = zilPay.defaultAccount;
```


follow the change of account
```javaScript
addEventListener('addressListing', function (e) {
  console.log('address change');
}, false);
```
or
```javaScript
zilPay.observableAccount().subscribe(account => console.log(account));
```

```javaScript
zilPay.connect(); // to get a permission!
```


```javaScript
if (zilPay.isEnable) {
  // is unlocked
} else {
  // is blocked
}
```
