import { describe, it, expect, beforeEach } from "vitest";
import { RAMStorage } from "../../background/secure/ram-session";
import { utils } from "aes-js";

describe("RAMStorage", () => {
  let storage: RAMStorage;
  const testData = utils.utf8.toBytes("test data");
  const testKey = "test_key";

  beforeEach(() => {
    storage = new RAMStorage();
  });

  it("set stores and get retrieves data", async () => {
    await storage.set(testKey, testData, 60000);
    const result = await storage.get(testKey);
    expect(result).toEqual(testData);
  });

  it("get returns null for non-existent key", async () => {
    const result = await storage.get("non_existent");
    expect(result).toBeNull();
  });

  it("delete removes specific key", async () => {
    await storage.set(testKey, testData, 60000);
    storage.delete(testKey);
    const result = await storage.get(testKey);
    expect(result).toBeNull();
  });

  it("clear removes all data", async () => {
    await storage.set("key1", testData, 60000);
    await storage.set("key2", testData, 60000);
    storage.clear();
    const result1 = await storage.get("key1");
    const result2 = await storage.get("key2");
    expect(result1).toBeNull();
    expect(result2).toBeNull();
  });

  it("get returns null after TTL expires", async () => {
    await storage.set(testKey, testData, 1000);
    await new Promise((resolve) => setTimeout(resolve, 1100));
    const result = await storage.get(testKey);
    expect(result).toBeNull();
  });

  it("stores multiple keys independently", async () => {
    const data1 = utils.utf8.toBytes("data1");
    const data2 = utils.utf8.toBytes("data2");
    
    await storage.set("key1", data1, 60000);
    await storage.set("key2", data2, 60000);
    
    const result1 = await storage.get("key1");
    const result2 = await storage.get("key2");
    
    expect(result1).toEqual(data1);
    expect(result2).toEqual(data2);
  });
});
