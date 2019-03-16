import Jazzicon from 'jazzicon'
import Utils from '../../lib/utils'
import { MTypesInternal, MTypesAuth } from '../../lib/messages/messageTypes'
import { Message } from '../../lib/messages/messageCall'


export function jazzicon({ state }, id) {
  if (state.wallet.identities.length < 1) {
    return null;
  }

  let ctx = window.document.querySelector('#' + id);
  let account = state.wallet.identities[state.wallet.selectedAddress];
  let el = Jazzicon(45, Utils.jsNumberForAddress(account.address));

  if (ctx.children.length > 0) {
    ctx.children[0].remove();
  }

  ctx.appendChild(el);
}

export async function walletCreate({ commit }, { seed, password }) {
  const type = MTypesAuth.SET_SEED_AND_PWD;
  const payload = { seed, password };
  const wallet = await new Message({ type, payload }).send();

  commit('setWallet', wallet);
}

export async function unLock({ commit }, password) {
  const type = MTypesAuth.SET_PASSWORD;
  const payload = { password };
  const status = await new Message({ type, payload }).send();

  commit('isEnable', status);

  return status;
}

export function logOut({ commit }) {
  Message.signal(MTypesAuth.LOG_OUT).send();
  commit('isEnable', false);
}

export async function balanceUpdate({ state }) {
  const wallet = await Message.signal(MTypesInternal.UPDATE_BALANCE).send();
  state.wallet = wallet;
  return wallet;
}

export async function createAccount({ state }) {
  state.wallet = await Message.signal(MTypesInternal.CREATE_ACCOUNT).send();
  return state.wallet;
}

export async function updateNode({ state }, selectedNet) {
  const type = MTypesInternal.SET_NET;
  const payload = { selectedNet };

  await new Message({ type, payload }).send();

  state.selectedNet = selectedNet;
}