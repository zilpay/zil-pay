# Extensión del navegador ZilPay

[![Chrome](https://img.shields.io/chrome-web-store/v/klnaejjgbibmhlephnhpmaofohgkpgkd)](https://chrome.google.com/webstore/detail/zilpay/klnaejjgbibmhlephnhpmaofohgkpgkd?utm_source=chrome-ntp-icon)
[![FireFox](https://img.shields.io/amo/v/zilpay)](https://addons.mozilla.org/en-GB/firefox/addon/zilpay/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/Zilliqa/scilla/blob/master/LICENSE)
[![Gitter chat](http://img.shields.io/badge/chat-on%20gitter-077a8f.svg)](https://gitter.im/Zilliqa/General)

*Lee esto en otros idiomas: [English](README.md), [简体中文](README_ZH-CN.md), [Nederlands](intro_NL.md), [Русский](README_RU.md), [日本語](README_JP.md), [Deutsch](README_DE.md), [Korean](README_KR.md).*

ZilPay es una billetera de navegador para Zilliqa blockchain. Los desarrolladores pueden integrar ZilPay en su sitio web para crear aplicaciones descentralizadas.

<p align="center">
  <a href="https://zilpay.xyz"><img src="https://github.com/lich666dead/zil-pay/blob/master/imgs/preview.png"></a>
</p>

## Enlaces
+ [Discord](https://discordapp.com/channels/370992535725932544/636917110089580544)
+ [Chrome store](https://chrome.google.com/webstore/detail/zilpay/klnaejjgbibmhlephnhpmaofohgkpgkd?utm_source=chrome-ntp-icon)
+ [FireFox store](https://addons.mozilla.org/en-GB/firefox/addon/zilpay/)
+ [Opera](https://chrome.google.com/webstore/detail/zilpay/klnaejjgbibmhlephnhpmaofohgkpgkd?utm_source=chrome-ntp-icon)

## Empezando
Puede implementar la versión local, desde el código fuente.

Para desarrolladores de dApp:
+ [Documentación completa de ZilPay](https://zilpay.xyz/Documentation/)
+ [ZilPay intenta construir tu dApp](https://medium.com/coinmonks/test-and-develop-dapps-on-zilliqa-with-zilpay-52b165f118bf?source=friends_link&sk=2a60070ddac60677ec36b1234c60222a)
+ [Ejemplo de Zilliqa dApps](https://github.com/lich666dead/zilliqa-dApps)

### Instalando

```bash
$ npm install         # instalar dependencias
```

### edificio

* Para desarrollar
```bash
$ npm run content     # construir content.js
$ npm run inpage      # construir inpage.js
$ npm run background  # construir background.js
$ npm run scripts     # construir content.js & inpage.js & background.js
$ npm run all:firefox # Todos los scripts se compilan para la plataforma Firefox.
$ npm run all:chrome  # Todos los scripts se compilan para la plataforma Chrome.
```

* Para la producción:
```bash
$ npm run build:prod:firefox
$ npm run build:prod:chrome
```

### Ejecutando las pruebas
```bash
$ npm run test # run testing
```

## Construido con

* [webpack](https://github.com/webpack/webpack)
* [babel](https://github.com/babel/babel)
* [vuejs](https://github.com/vuejs)

## Autores

* **Rinat Khasanshin** - *Los trabajos iniciales* - [lich666black](https://github.com/lich666dead)

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - vea el [LICENSE.md](https://github.com/zilpay/zil-pay/blob/master/LICENSE) archivo para más detalles.

Gracias por el tuyo donar.
------

- ZIL: zil1wl38cwww2u3g8wzgutxlxtxwwc0rf7jf27zace
- ETH: 0x246C5881E3F109B2aF170F5C773EF969d3da581B
- BTC: 12MRR8LyLVLHVqXcjz46c9o3KBS76fAY9r
- ZEC: t1dZMw8FVWnGKC9cyXKaiKWmmAFmQoeNc5Y
- LTC: LM3JwjTbboMkHdFEYnn4ycJB61r3fqvXPr
- DASH: Xv2tpCMHPAztd4B5UMnaqwkqnSfiUs1P8B
