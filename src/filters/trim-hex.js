export default function (hex) {
  let part0 = hex.substr(0, 6)
  let part1 = hex.substr(-6);

  return `${part0}...${part1}`;
}