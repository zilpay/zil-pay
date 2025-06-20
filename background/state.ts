import { BackgroundState } from "background/storage";
import { Fields } from "config/fields";
import { BrowserStorage, buildObject } from "lib/storage";
import { migrateToV4 } from "./secure";

export class GlobalState {
  state: BackgroundState;

  static async fromStorage() {
    const recordsv4 = await BrowserStorage.get<string>(Fields.STORAGE_V4);
    let state: BackgroundState;

    if (!recordsv4) {
      const oldRecords = await BrowserStorage.getAll();

      if (oldRecords) {
        try {
          state = migrateToV4(oldRecords);
        } catch {
          state = BackgroundState.default();
        }
      } else {
        state = BackgroundState.default();
      }
    } else {
      try {
        state = new BackgroundState(JSON.parse(recordsv4));
      } catch {
        state = BackgroundState.default();
      }
    }

    return new GlobalState(state);
  }

  constructor(initialState: BackgroundState) {
    this.state = initialState;
  }

  async sync() {
    await BrowserStorage.set(
      buildObject(Fields.STORAGE_V4, JSON.stringify(this.state)),
    );
  }
}
