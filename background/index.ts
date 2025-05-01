import { randomBytes } from "../crypto/random";

(function() {
  let bytes = randomBytes(16);

  console.log(bytes);
}());
