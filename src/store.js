import Vue from 'vue'
import Vuex from 'vuex'
import Static from './stores/static'


Vue.use(Vuex)

export default new Vuex.Store({
  modules: { Static },
  state: {
    loading: true,
    isConnect: true
  },
  mutations: {
    spiner(state) {
      let spiner = window.document.querySelector('#spinner');
      let app = window.document.querySelector('#app');

      state.loading = !state.loading;

      if (state.loading) {
        spiner.style.display = 'block';
        spiner.className = 'isLoad';        
        app.style.filter = 'blur(5px)';
      } else {
        app.style.filter = null;
        spiner.className = null;   
        spiner.style.display = 'none';
      }
    }
  },
  actions: {

  }
})
