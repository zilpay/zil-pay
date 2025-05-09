import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Message, ReqBody } from 'lib/streem/message';
import { Runtime } from 'lib/runtime/extensionizer';

vi.mock('lib/runtime/extensionizer', () => ({
  Runtime: {
    runtime: {
      sendMessage: vi.fn(),
    },
  },
}));

describe('Basic Test Message - Error Handling', () => {
  const mockConsoleError = vi.fn();

  beforeEach(() => {
    console.error = mockConsoleError;
    (Runtime.runtime.sendMessage as ReturnType<typeof vi.fn>).mockClear();
  });

  it('should catch sendMessage error and log it', async () => {
    const message = Message.signal("ERROR_MESSAGE");
    const sendMessageMock = Runtime.runtime.sendMessage as ReturnType<typeof vi.fn>;
    const errorMessage = 'Simulated send error';
    sendMessageMock.mockImplementation(() => {
      throw new Error(errorMessage);
    });

    await expect(message.send()).rejects.toThrow('service_worker_stopped');

    expect(sendMessageMock).toHaveBeenCalledTimes(1);
    expect(mockConsoleError).toHaveBeenCalledWith(message, new Error(errorMessage));
  });
});

describe('Basic Test Message - Successful Send and Receive', () => {
  beforeEach(() => {
    (Runtime.runtime.sendMessage as ReturnType<typeof vi.fn>).mockClear();
  });

  it('should send the message and receive a response', async () => {
    const body: ReqBody<{ data: string }> = { type: 'TEST_MESSAGE', payload: { data: 'test' } };
    const message = new Message(body);
    const mockResponse = { result: 'success' };

    (Runtime.runtime.sendMessage as ReturnType<typeof vi.fn>).mockImplementation((_msg, callback) => {
      callback(mockResponse);
    });

    const response = await message.send();

    expect(Runtime.runtime.sendMessage).toHaveBeenCalledOnce();
    expect(Runtime.runtime.sendMessage).toHaveBeenCalledWith(body, expect.any(Function));
    expect(response).toEqual(mockResponse);
  });
});
