# Using ZilPay in dapps.


init Zilliqa object
```javaScript
var zilliqa = new Zilliqa();
var utils = zilliqa.utils;
```

get defaultAccount
```javaScript
var {address} = zilPay.defaultAccount;
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
if (zilPay.isEnable) {
  // is unlocked
} else {
  // is blocked
}
```