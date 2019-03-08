const empty = {
  type: '',
  payload: '',
  resolver: '',
  reject: ''
};

export class Message {
  messageWidthPayload(msg) {
    return Object.assign(empty, msg);
  }
}