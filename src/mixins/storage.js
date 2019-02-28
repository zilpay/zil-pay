let mixin;

if (process.env.NODE_ENV == 'development') {
  mixin = {
    methods: {
      set(value) {
        Object.keys(value).forEach(key => {
          window.localStorage.setItem(key, value[key]);
        });
      },
      get(keys) {
        return keys.map(key => window.localStorage.getItem(key));
      }
    }
  };
} else {
  mixin = {
    methods: {
      set(value) {
        return new Promise(resolve => {
          window.chrome.storage.sync.set(value, resolve);
        });
      },
      get(keys) {
        return new Promise(resolve => {
          window.chrome.storage.sync.get(keys, resolve);
        });
      }
    }
  };
}

export default mixin;
