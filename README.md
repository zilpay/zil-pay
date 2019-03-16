# ZilPay Browser Extension

ZilPay is a browser wallet for Zilliqa. Developers can integrate ZilPay into their website to create Decentralised Apps.


## Installation

#### Install dependencies
```sh
$ npm install
$ npm run all
```



###ZilPay

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



## Links
+ [Support](https://t.me/zilpay)
