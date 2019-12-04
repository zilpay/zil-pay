import { shallowMount, createLocalVue } from '@vue/test-utils'
import VueRouter from 'vue-router'
import App from 'src/App.vue'

const localVue = createLocalVue()

localVue.use(VueRouter)

const router = new VueRouter()

describe('src:App.vue', () => {
  it('Should be mount', () => {
    const wrapper = shallowMount(App, {
      localVue,
      router
    })
    expect(wrapper).toBeTruthy()
  })
})
