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

  if (wallet.resolve) {
    commit('setWallet', wallet.resolve);
  } else {
    throw new Error(wallet.reject);
  }
}

export async function unLock({ commit }, password) {
  const type = MTypesAuth.SET_PASSWORD;
  const payload = { password };
  const status = await new Message({ type, payload }).send();

  if (status.resolve) {
    commit('isEnable', status.resolve);
    return status.resolve;
  } else {
    return status.reject;
  }
}

export function logOut({ commit }) {
  Message.signal(MTypesAuth.LOG_OUT).send();
  commit('isEnable', false);
}

export async function balanceUpdate({ state }) {
  const result = await Message.signal(
    MTypesInternal.UPDATE_BALANCE
  ).send();

  if (result.resolve) {
    state.wallet = result.resolve;
    return result.resolve;
  } else {
    throw new Error(result.reject);
  }
}

export async function createAccount({ state }) {
  const result = await Message.signal(MTypesInternal.CREATE_ACCOUNT).send();

  if (result.resolve) {
    state.wallet = result.resolve;
  } else {
    throw new Error(result.reject);
  }
  
  return state.wallet;
}

export async function changeNetwork({ state }, selectednet) {
  const type = MTypesInternal.SET_NET;
  const payload = { selectednet };
  const provider = state.config[selectednet].PROVIDER;

  if (!provider) {
    return null;
  }

  state.isConnected = await new Message({ type, payload }).send();
  state.selectednet = selectednet;
}

export async function configUpdate({ state }, config) {
  const type = MTypesInternal.CONFIG_UPDATE;
  const payload = { config };

  const status = await new Message({ type, payload }).send();

  if (status.resolve) {
    state.config = config;
  } else {
    throw new Error(status.reject);
  }
}