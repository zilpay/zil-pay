import {} from "./secure";
import {} from "./services";
import {} from "./storage";

import { addr } from "micro-eth-signer";
const priv =
  "0x0687640ee33ef844baba3329db9e16130bd1735cbae3657bd64aed25e9a5c377";
const pub =
  "030fba7ba5cfbf8b00dd6f3024153fc44ddda93727da58c99326eb0edd08195cdb";
const nonChecksummedAddress = "0x0089d53f703f7e0843953d48133f74ce247184c2";
const checksummedAddress = addr.addChecksum(nonChecksummedAddress);
console.log(
  checksummedAddress, // 0x0089d53F703f7E0843953D48133f74cE247184c2
  addr.isValid(checksummedAddress), // true
  addr.isValid(nonChecksummedAddress), // also true
  addr.fromPrivateKey(priv),
  addr.fromPublicKey(pub),
);
