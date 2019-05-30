export default {
  data() {
    return {
      isKeyDownloaded: false,
      passwordLength: 6,
      password: null,
      confirmPassword: null,
    };
  },
  computed: {
    isValidPassword() {
      if (this.password === null) {
        return false;
      } else if (!this.password || this.password.length < this.passwordLength) {
        return `Min password length ${this.passwordLength}`;
      }
      return false;
    },
    isConfirmPassword() {
      if (this.confirmPassword === null) {
        return false;
      } else if (this.password !== this.confirmPassword) {
        return `Passwords Don't Match`;
      }
      return false;
    },
    isContinue() {
      const isPassword = !!this.isValidPassword || !!this.isConfirmPassword;
      return !this.isKeyDownloaded || isPassword || !this.password || !this.confirmPassword;
    }
  }
}