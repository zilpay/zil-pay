# ZilPay 브라우저 확장

[![Chrome](https://img.shields.io/chrome-web-store/v/klnaejjgbibmhlephnhpmaofohgkpgkd)](https://chrome.google.com/webstore/detail/zilpay/klnaejjgbibmhlephnhpmaofohgkpgkd?utm_source=chrome-ntp-icon)
[![FireFox](https://img.shields.io/amo/v/zilpay)](https://addons.mozilla.org/en-GB/firefox/addon/zilpay/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/Zilliqa/scilla/blob/master/LICENSE)
[![Gitter chat](http://img.shields.io/badge/chat-on%20gitter-077a8f.svg)](https://gitter.im/Zilliqa/General)

*다른 언어로 읽어보십시오: [English](README.md), [简体中文](README_ZH-CN.md), [Español](README_ES.md), [Nederlands](intro_NL.md), [Русский](README_RU.md), [日本語](README_JP.md), [Deutsch](README_DE.md).*

ZilPay는 Zilliqa 블록 체인 용 브라우저 지갑입니다. 개발자는 ZilPay를 웹 사이트에 통합하여 분산 앱을 만들 수 있습니다.

<p align="center">
  <a href="https://zilpay.xyz"><img src="https://github.com/lich666dead/zil-pay/blob/master/imgs/preview.png"></a>
</p>

## 연결
+ [Discord](https://discordapp.com/channels/370992535725932544/636917110089580544)
+ [Chrome store](https://chrome.google.com/webstore/detail/zilpay/klnaejjgbibmhlephnhpmaofohgkpgkd?utm_source=chrome-ntp-icon)
+ [FireFox store](https://addons.mozilla.org/en-GB/firefox/addon/zilpay/)
+ [Opera](https://chrome.google.com/webstore/detail/zilpay/klnaejjgbibmhlephnhpmaofohgkpgkd?utm_source=chrome-ntp-icon)

## 시작하기
소스 코드에서 로컬 버전을 배포 할 수 있습니다.

dApp 개발자의 경우 :
+ [ZilPay 전체 문서](https://zilpay.xyz/Documentation/)
+ [ZilPay는 dApp을 구축해보십시오](https://medium.com/coinmonks/test-and-develop-dapps-on-zilliqa-with-zilpay-52b165f118bf?source=friends_link&sk=2a60070ddac60677ec36b1234c60222a)
+ [Zilliqa dApps 예제](https://github.com/lich666dead/zilliqa-dApps)

### 설치

```bash
# Install dependencies
$ npm install

# Serve all files extension.
$ npm run dev

# Serve vue app files to dist.
$ npm run serve:ui

# Serve extension (background.js) and any extensiong files to dist.
$ npm run serve:extension

# Serve web on 8080 port.
$ npm run serve:web
```

* 생산의 경우 :
```bash
# Build all app and extension files and optimizing it.
$ npm run build

# Build only UI files and optimizing it.
$ npm run build:ui

# Build only extension files and optimizing it.
$ npm run build:extension
```

### 테스트 실행
```bash
# run unit tests
$ npm test:unit

# Watch testing for dev.
$ npm run test:watch

# Check lint ts,vue files.
$ npm run lint
```

## 내장

* [webpack](https://github.com/webpack/webpack)
* [babel](https://github.com/babel/babel)
* [vuejs](https://github.com/vuejs)

## 저자

* **Rinat Khasanshin** - *초기 작업* - [lich666black](https://github.com/lich666dead)

## 특허

이 프로젝트는 MIT 라이센스에 따라 라이센스가 부여됩니다. [LICENSE.md](https://github.com/zilpay/zil-pay/blob/master/LICENSE) 자세한 내용은 파일을 참조하십시오.

기부 해 주셔서 감사합니다.
------

- ZIL: zil1wl38cwww2u3g8wzgutxlxtxwwc0rf7jf27zace
- ETH: 0x246C5881E3F109B2aF170F5C773EF969d3da581B
- BTC: 12MRR8LyLVLHVqXcjz46c9o3KBS76fAY9r
- ZEC: t1dZMw8FVWnGKC9cyXKaiKWmmAFmQoeNc5Y
- LTC: LM3JwjTbboMkHdFEYnn4ycJB61r3fqvXPr
- DASH: Xv2tpCMHPAztd4B5UMnaqwkqnSfiUs1P8B
