import { get, set } from 'https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm';

const val = Math.random();
postMessage('Setting item to ' + val);
await set('foo', val);
postMessage('Getting item: ' + await get('foo'));