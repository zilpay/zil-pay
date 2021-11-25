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
import { Runtime } from 'lib/runtime';
import { Fields } from 'config/fields';

let app = {};

getState()
	.then(() => {
		app = new App({
			target: document.body
		});
		const events = Runtime.storage.local['onChanged'];

		if (!events) {
			return null;
		}

		if (events.hasListeners()) {
			events.removeListener();
		}

		events.addListener(async(event: object) => {
			for (const key in event) {
				if (key.includes(Fields.TRANSACTIONS)) {
					await getState();
				}
			}
		});
	});

export default app;
