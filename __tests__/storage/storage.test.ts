import { describe, it, expect, beforeEach, vi } from "vitest";
import { BrowserStorage } from "../../lib/storage/storage";
import type { StorageKeyValue } from "../../lib/storage/builder";

describe("BrowserStorage - Basic Operations", () => {
  beforeEach(() => {
    chrome.storage.local.set.reset();
    chrome.storage.local.get.reset();
    chrome.storage.local.remove.reset();
    chrome.storage.local.clear.reset();
    chrome.runtime.lastError = undefined;
  });

  it("sets a single key-value pair", async () => {
    const mockData: StorageKeyValue = { key: "value" };
    chrome.storage.local.set.callsFake((data, callback) => callback());

    await BrowserStorage.set(mockData);

    expect(chrome.storage.local.set.calledWith(mockData)).toBe(true);
  });

  it("sets multiple key-value pairs", async () => {
    const mockData1: StorageKeyValue = { key1: "value1" };
    const mockData2: StorageKeyValue = { key2: "value2" };
    chrome.storage.local.set.callsFake((data, callback) => callback());

    await BrowserStorage.set(mockData1, mockData2);

    expect(
      chrome.storage.local.set.calledWith({ key1: "value1", key2: "value2" }),
    ).toBe(true);
  });

  it("rejects on set error", async () => {
    const mockData: StorageKeyValue = { key: "value" };
    chrome.storage.local.set.callsFake((data, callback) => {
      chrome.runtime.lastError = { message: "Storage set failed" };
      callback();
    });

    await expect(BrowserStorage.set(mockData)).rejects.toThrow(
      "Storage set failed",
    );
  });

  it("gets a single key", async () => {
    const key = "key";
    const mockResult = { key: "value" };
    chrome.storage.local.get.callsFake((keys, callback) =>
      callback(mockResult),
    );

    const result = await BrowserStorage.get(key);

    expect(chrome.storage.local.get.calledWith([key])).toBe(true);
    expect(result).toBe(mockResult[key]);
  });

  it("gets multiple keys", async () => {
    const keys = ["key1", "key2"];
    const mockResult = { key1: "value1", key2: "value2" };
    chrome.storage.local.get.callsFake((keys, callback) =>
      callback(mockResult),
    );

    const result = await BrowserStorage.get(...keys);

    expect(chrome.storage.local.get.calledWith(keys)).toBe(true);
    expect(result).toEqual(mockResult);
  });

  it("rejects on get error", async () => {
    const key = "key";
    chrome.storage.local.get.callsFake((keys, callback) => {
      chrome.runtime.lastError = { message: "Storage get failed" };
      callback();
    });

    await expect(BrowserStorage.get(key)).rejects.toThrow("Storage get failed");
  });

  it("gets all items", async () => {
    const mockResult = { key1: "value1", key2: "value2" };
    chrome.storage.local.get.callsFake((keys, callback) =>
      callback(mockResult),
    );

    const result = await BrowserStorage.getAll();

    expect(chrome.storage.local.get.calledWith(null)).toBe(true);
    expect(result).toEqual(mockResult);
  });

  it("removes keys", async () => {
    const keys = ["key1", "key2"];
    chrome.storage.local.remove.callsFake((keys, callback) => callback());

    await BrowserStorage.rm(...keys);

    expect(chrome.storage.local.remove.calledWith(keys)).toBe(true);
  });

  it("rejects on remove error", async () => {
    const key = "key";
    chrome.storage.local.remove.callsFake((keys, callback) => {
      chrome.runtime.lastError = { message: "Storage remove failed" };
      callback();
    });

    await expect(BrowserStorage.rm(key)).rejects.toThrow(
      "Storage remove failed",
    );
  });

  it("clears storage", async () => {
    chrome.storage.local.clear.callsFake((callback) => callback());

    await BrowserStorage.clear();

    expect(chrome.storage.local.clear.called).toBe(true);
  });

  it("rejects on clear error", async () => {
    chrome.storage.local.clear.callsFake((callback) => {
      chrome.runtime.lastError = { message: "Storage clear failed" };
      callback();
    });

    await expect(BrowserStorage.clear()).rejects.toThrow(
      "Storage clear failed",
    );
  });
});

describe("BrowserStorage - Subscription", () => {
  beforeEach(() => {
    chrome.storage.onChanged.addListener.resetHistory();
    chrome.storage.onChanged.removeListener.resetHistory();
    chrome.runtime.lastError = undefined;
  });

  it("subscribes to storage changes and calls callback", () => {
    const mockCallback = vi.fn();
    const mockChanges = { key: { oldValue: "old", newValue: "new" } };

    const { unsubscribe } = BrowserStorage.subscribe(mockCallback);
    const listener = chrome.storage.onChanged.addListener.firstCall.args[0];

    listener(mockChanges);

    expect(chrome.storage.onChanged.addListener.called).toBe(true);
    expect(mockCallback).toHaveBeenCalledWith(mockChanges);

    unsubscribe();
    expect(chrome.storage.onChanged.removeListener.called).toBe(true);
  });

  it("handles errors in subscription callback", () => {
    const mockCallback = vi.fn(() => {
      throw new Error("Callback error");
    });
    const mockConsoleError = vi.fn();
    console.error = mockConsoleError;
    const mockChanges = { key: { oldValue: "old", newValue: "new" } };

    const { unsubscribe } = BrowserStorage.subscribe(mockCallback);
    const listener = chrome.storage.onChanged.addListener.firstCall.args[0];

    listener(mockChanges);

    expect(mockCallback).toHaveBeenCalledWith(mockChanges);
    expect(mockConsoleError).toHaveBeenCalledWith(
      "Error in storage change callback:",
      expect.any(Error),
    );

    unsubscribe();
    expect(chrome.storage.onChanged.removeListener.called).toBe(true);
    console.error = console.error;
  });
});
