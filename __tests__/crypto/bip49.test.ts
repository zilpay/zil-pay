import { describe, expect, test } from "vitest";
import { DerivationPath } from "../../crypto/bip49";
import { ETHEREUM, ZILLIQA } from "../../config/slip44";

describe("DerivationPath", () => {
  test("should create correct Ethereum path", () => {
    const ethPath = new DerivationPath(ETHEREUM, 0);
    expect(ethPath.getPath()).toBe("m/44'/60'/0'/0/0");
    expect(ethPath.getBasePath()).toBe("m/44'/60'/0'/0/");
  });

  test("should create correct Zilliqa path", () => {
    const zilPath = new DerivationPath(ZILLIQA, 0);
    expect(zilPath.getPath()).toBe("m/44'/313'/0'/0/0");
    expect(zilPath.getBasePath()).toBe("m/44'/313'/0'/0/");
  });

  test("should handle different indexes", () => {
    const ethPath = new DerivationPath(ETHEREUM, 5);
    expect(ethPath.getPath()).toBe("m/44'/60'/0'/0/5");
    expect(ethPath.getIndex()).toBe(5);
  });

  test("should display correct string", () => {
    const ethPath = new DerivationPath(ETHEREUM, 0);
    expect(ethPath.toString()).toBe("m/44'/60'/0'/0/0");
  });
});
