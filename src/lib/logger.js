
  
export class Loger {

  constructor(nameInit) {
    this._name = nameInit;
  }

  info(...args) {
    console.log(`${this._name}:`, args);
  }

  error(...args) {
    console.error(`${this._name}:`, args);
  }

  warn(...args) {
    console.warn(`${this._name}:`, args);
  }
}