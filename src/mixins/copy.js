/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
const DEFAULT_TIMER = 1000
const COPY_FORMS = {
  copy: 'copy',
  copied: 'copied'
}
/**
 * Mixin for useing P component copy with `v-tooltip`.
 * @example
 * import CopyMixin from '@/mixins/copy'
 * export default {
 *  name: 'ExampleComponent',
 *  mixins: [CopyMixin]
 * }
 */
export default {
  data() {
    return {
      copytitle: COPY_FORMS.copy
    }
  },
  methods: {
    onCopyMixin() {
      this.copytitle = COPY_FORMS.copied

      setTimeout(
        () => this.copytitle = COPY_FORMS.copy,
        DEFAULT_TIMER
      )
    }
  }
}
