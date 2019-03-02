
export default function (hex) {
  let part0 = hex.substr(0, 5)
  let part1 = hex.substr(-5);

  return `${part0}...${part1}`;
}