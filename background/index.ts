import { startBackground } from "background/background";
import { GlobalState } from "background/state";

(async function () {
  const state = await GlobalState.fromStorage();

  startBackground(state);
})();
