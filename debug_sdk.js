```javascript
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const moncash = require('moncash-sdk');

console.log("Configuration keys or default config:");
console.log(JSON.stringify(moncash, null, 2));
```
