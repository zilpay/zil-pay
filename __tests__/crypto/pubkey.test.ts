import { describe, expect, it } from "vitest";
import { fromZILPrivateKey } from "../../crypto/zilliqa/pubkey";
import { utils } from "aes-js";

describe("test cases pubkey", () => {
  it("test zil private key to pub key", async () => {
    let sk = Uint8Array.from(
      utils.hex.toBytes(
        "3a649fbe8198729669affd1e9ae93e9e81fd25b71ea5f79792bec9fa6ac9ed92",
      ),
    );
    let pk = fromZILPrivateKey(sk);
    let pkHex = utils.hex.fromBytes(pk);

    expect(pkHex).toEqual(
      "025ded2f80f60d6c98d16ea5e1b2787427f44b8fcf11b5cacd56911e6c0e4c184c",
    );
  });
});
