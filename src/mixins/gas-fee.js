export default {
  data() {
    return {
      gasLimit: 1,
      gasPrice: 1000,
    };
  },
  computed: {
    fee() {
      return this.gasLimit * this.gasPrice * Math.pow(10, -6);
    }
  }
}