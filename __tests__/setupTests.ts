import { vi } from 'vitest';

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

(global as any).chrome = {
  storage: {
    local: {
      get: vi.fn((key, callback) => callback({ key: 'value' })),
      set: vi.fn(),
    },
  },
  runtime: {
    connect: vi.fn(),
  },
};
