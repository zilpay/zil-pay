let mixin;

if (process.env.NODE_ENV == 'development') {
  mixin = {
    methods: {
      set(value) {
        Object.keys(value).forEach(key => {
          let item = value[key];
          
          if (typeof item != 'string') {
            item = JSON.stringify(item);
          }

          window.localStorage.setItem(key, item);
        });
      },
      get(key) {
        let result = {};
        let item = window.localStorage.getItem(key);
    
        if (!item) {
          return {};
        }

        try {
          result[key] = JSON.parse(item);
        } catch(err) {
          result[key] = item;
        }

        return result;
      }
    }
  };
} else {
  mixin = {
    methods: {
      set(value) {
        return new Promise(resolve => {
          window.chrome.storage.local.set(value, resolve);
        });
      },
      get(keys) {
        return new Promise(resolve => {
          window.chrome.storage.local.get(keys, resolve);
        });
      }
    }
  };
}

export default mixin;
