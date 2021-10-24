import { writable } from 'svelte/store';

export type GuardType = {
  isEnable: boolean;
  isReady: boolean;
};

export default writable<GuardType>({
  isEnable: false,
  isReady: false
});
