export default {
  methods: {
    split(hex, length=10) {
      const part0 = hex.slice(0, length);
      const part1 = hex.slice(hex.length - length);

      return `${part0}...${part1}`;
    }
  }
}