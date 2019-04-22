import { Message } from '../../lib/messages/messageCall'
import { MTypesInternal, MTypesZilPay } from '../../lib/messages/messageTypes'


export async function transactionsUpdate({ state }) {
  const transactions = await Message.signal(MTypesInternal.GET_ALL_TX).send();
  state.transactions = transactions;
}

export async function nonContractSendTransaction(_, data) {
  const type = MTypesZilPay.CALL_SIGN_TX;
  const payload = data;
  await new Message({ type, payload }).send();  
}

export async function rejectConfirmTx({ state }) {
  await Message.signal(MTypesZilPay.REJECT_CONFIRM_TX).send();
  state.confirmationTx.pop();
}

export async function confirmTx({ state }, payload) {
  const result = await new Message({
    type: MTypesZilPay.CONFIRM_TX,
    payload
  }).send();
  
  state.confirmationTx.pop();

  if (result.reject) {
    throw new Error(result.reject);
  }
}
