export default {
  methods: {
    getAccountName(account) {
      if (!account) {
        return ''
      } else if (account.name) {
        return account.name
      } else if (account.isImport) {
        return `${this.local.IMPORTED} ${account.index}`
      } else if (account.hwType) {
        return `${account.hwType} ${account.index}`
      }

      return `${this.local.ACCOUNT} ${account.index}`
    }
  }
}
