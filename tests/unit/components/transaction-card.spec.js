/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import Vuex from 'vuex'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import vueBemCn from 'vue-bem-cn'
import TransactionCard from 'src/components/TransactionCard.vue'
import { BEM_CONFIG, ICON_VARIANTS } from 'src/config'
import store from 'src/store'

const localVue = createLocalVue()
const TEST_TRANASCTION = {
  Info: 'Contract Txn, Shards Match of the sender and reciever',
  TranID: '8bd99abe0f280d5df9fd515eadd93870902ecf5a5c661cfc37bca22fc657f5fd',
  amount: '10000000000000',
  nonce: 55,
  toAddr: '0xE8A997e359AC2A1e891dBDf7fc7558623bB0eaD2',
  status: 'confirmed'
}

localVue.use(vueBemCn, { delimiters: BEM_CONFIG })
localVue.use(Vuex)

describe('components:TransactionCard', () => {
  const wrapper = shallowMount(TransactionCard, {
    localVue,
    store,
    propsData: {
      transaction: TEST_TRANASCTION
    }
  })

  it('Should be import', () => {
    expect(TransactionCard).toBeTruthy()
  })

  it('Should be mount', () => {
    expect(wrapper).toBeTruthy()
  })

  it('checks the props', () => {
    expect(wrapper.props().transaction).toEqual(TEST_TRANASCTION)
  })

  it('Should can know status', () => {
    expect(wrapper.vm.statusIcon).toBe(ICON_VARIANTS.statusPadding)
  })

})
