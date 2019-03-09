import storage from './storage'


export default {
  namespaced: true,

  state: {

  },
  mutations: {
  },
  actions: {
  },
  getters: {
    STORAGE_STATE() {
      return storage.state;
    },
    STORAGE_MUTATIONS() {
      return storage.mutations;
    }
  }
}
