export default class {

  _name = '';

  constructor(name) {
    this._name = name;
  }

  warn(text) {
    console.warn(`${this._name}:`, text);
  }

  log(text) {
    console.log(`${this._name}:`, text);
  }

  error(text) {
    console.error(`${this._name}:`, text);
  }
}
