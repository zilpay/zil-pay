import { writable } from 'svelte/store';

export default writable({
  isEnable: false,
  isReady: false
});
