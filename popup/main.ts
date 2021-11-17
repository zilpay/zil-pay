/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import App from './App.svelte';
import { getState } from './backend/wallet';

getState()
	.then(() => {
		new App({
			target: document.body
		});
	});

// const app = new App();

export default {};
