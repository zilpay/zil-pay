import { vi } from 'vitest';
import sinonChrome from 'sinon-chrome';


global.chrome = sinonChrome;

const mockGetRandomValues = (array: Uint8Array): Uint8Array => {
  for (let i = 0; i < array.length; i++) {
    array[i] = Math.floor(Math.random() * 256); 
  }
  return array;
};

(global as any).window = {
  crypto: {
    getRandomValues: vi.fn(mockGetRandomValues),
  },
};
