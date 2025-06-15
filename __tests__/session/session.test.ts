import "../setupTests";
import { describe, it, expect } from "vitest";
import { Session, SessionStorageKeys } from "../../background/secure/session";
import { utils } from "aes-js";
import { Runtime } from "../../lib/runtime";
import { uuid } from "../../crypto/uuid";

describe("Session", () => {
  const vaultContent = utils.utf8.toBytes("test vault");
  const sessionTime = 60;
  const testUuid = uuid(); // Generate a test UUID

  it("setSession stores and getVault retrieves content", async () => {
    const session = new Session(testUuid);
    await session.setSession(sessionTime, vaultContent);
    const result = await session.getVault();
    expect(result).toEqual(vaultContent);
  });

  it("clearSession removes all data", async () => {
    const session = new Session(testUuid);
    await session.setSession(sessionTime, vaultContent);
    await session.clearSession();
    await expect(session.getVault()).rejects.toThrow("Session does not exist");
  });

  it("getVault throws error after session expires", async () => {
    const session = new Session(testUuid);
    await session.setSession(1, vaultContent); // 1 second
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
    await expect(session.getVault()).rejects.toThrow("Session has expired");
    const data = await Runtime.storage.session.get([
      `${SessionStorageKeys.EndSession}:${testUuid}`,
      `${SessionStorageKeys.SessionKey}:${testUuid}`,
      `${SessionStorageKeys.VaultCipher}:${testUuid}`,
    ]);
    expect(data).toEqual({
      [`${SessionStorageKeys.EndSession}:${testUuid}`]: undefined,
      [`${SessionStorageKeys.SessionKey}:${testUuid}`]: undefined,
      [`${SessionStorageKeys.VaultCipher}:${testUuid}`]: undefined,
    });
  });
});
