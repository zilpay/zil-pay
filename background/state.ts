import { BackgroundState } from "background/storage";

export class GlobalState {
  state: BackgroundState;

  static async fromStorage() {
    const state = await BackgroundState.fromStorage();

    return new GlobalState(state);
  }

  constructor(initialState: BackgroundState) {
    this.state = initialState;
  }

  async sync() {
    await this.state.sync();
  }
}
