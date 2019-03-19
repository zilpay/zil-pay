import Jazzicon from 'jazzicon'
import Utils from '../../lib/utils'
import axios from 'axios'
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
  const result = await Message.signal(
    MTypesInternal.UPDATE_BALANCE
  ).send();
  
  state.wallet = result.resolve;

  if (result.reject) {
    state.isConnected = false;
  } else {
    state.isConnected = true;
  }

  return result.resolve;
}

export async function createAccount({ state }) {
  state.wallet = await Message.signal(MTypesInternal.CREATE_ACCOUNT).send();
  return state.wallet;
}

export async function updateNode({ state }, selectednet) {
  const type = MTypesInternal.SET_NET;
  const payload = { selectednet };
  const provider = state.config[selectednet].PROVIDER;

  if (!provider) {
    return null;
  }
  
  axios.request(provider)
       .then(() => state.isConnected = true)
       .catch(() => state.isConnected = false);

  await new Message({ type, payload }).send();

  state.selectednet = selectednet;
}

export async function configUpdate({ state }, config) {
  const type = MTypesInternal.CONFIG_UPDATE;
  const payload = { config };

  await new Message({ type, payload }).send();

  state.config = config;
}

export async function netTest({ state }) {
  const provider = state.config[state.selectednet].PROVIDER;
  axios.request(provider)
       .then(() => state.isConnected = true)
       .catch(() => state.isConnected = false);
}