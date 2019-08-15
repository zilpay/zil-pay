const fs = require('fs');
const manifest = {
  "name": "ZilPay",
  "short_name": "ZilPay Zilliqa wallet",
  "version": "0.2.5",
  "description": "ZilPay browser Extension for zilliqa blockchain",
  "author": "https://zilpay.xyz",
  "manifest_version": 2,
  "icons": {
    "128": "icon128.png",
    "96": "icon96.png",
    "48": "icon48.png",
    "38": "icon38.png",
    "39": "icon19.png",
    "19": "icon19.png",
    "16": "icon16.png"
  },
  "storage": {
    "managed_schema": "schema.json"
  },
  "permissions": [
    "storage",
    "notifications",
    "https://api.coinmarketcap.com/v1/ticker/*",
    "https://api.zilliqa.com/",
    "https://dev-api.zilliqa.com/",
    "https://zilpay.xyz/*"
  ],
  "content_scripts": [
    {
      "matches": [
          "*://*/*"
      ],
      "js": ["contentScript.js"],
      "run_at": "document_start",
      "all_frames": true
    }
  ],
  "web_accessible_resources": [
    "inpage.js"
  ],
  "browser_action": {
    "default_icon": {
      "19": "icon19.png",
      "38": "icon38.png"
    },
    "default_title": "ZilPay",
    "default_popup": "index.html"
  },
  "background": {
    "scripts": [
        "background.js"
    ]
  },
  "content_security_policy": "script-src 'self' 'unsafe-eval'; object-src 'self'"
}

if (process.env.PLATFORM == 'firefox') {
  manifest['applications'] = {
    "gecko": {
      "id": "addon@zilpay.xyz"
    }
  }
} else if (process.env.PLATFORM == 'chrome') {
  manifest['background']['persistent'] = true;
}

fs.writeFile(
  'dist/manifest.json',
  JSON.stringify(manifest, null, 4),
  () => console.log('manifest.json created')
);