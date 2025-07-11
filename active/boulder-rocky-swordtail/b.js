var Module = typeof Module != 'undefined' ? Module : {};
var moduleOverrides = Object.assign({}, Module);
var arguments_ = [];
var thisProgram = './this.program';
var quit_ = (status, toThrow) => {
  throw toThrow;
};
var ENVIRONMENT_IS_WEB = typeof window == 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts == 'function';
var ENVIRONMENT_IS_NODE =
  typeof process == 'object' &&
  typeof process.versions == 'object' &&
  typeof process.versions.node == 'string';
var scriptDirectory = '';
var read_, readAsync, readBinary;
if (ENVIRONMENT_IS_NODE) {
  var fs = require('fs');
  var nodePath = require('path');
  if (ENVIRONMENT_IS_WORKER) {
    scriptDirectory = nodePath.dirname(scriptDirectory) + '/';
  } else {
    scriptDirectory = __dirname + '/';
  }
  read_ = (filename, binary) => {
    filename = isFileURI(filename)
      ? new URL(filename)
      : nodePath.normalize(filename);
    return fs.readFileSync(filename, binary ? undefined : 'utf8');
  };
  readBinary = (filename) => {
    var ret = read_(filename, true);
    if (!ret.buffer) {
      ret = new Uint8Array(ret);
    }
    return ret;
  };
  readAsync = (filename, onload, onerror, binary = true) => {
    filename = isFileURI(filename)
      ? new URL(filename)
      : nodePath.normalize(filename);
    fs.readFile(filename, binary ? undefined : 'utf8', (err, data) => {
      if (err) onerror(err);
      else onload(binary ? data.buffer : data);
    });
  };
  if (!Module['thisProgram'] && process.argv.length > 1) {
    thisProgram = process.argv[1].replace(/\\/g, '/');
  }
  arguments_ = process.argv.slice(2);
  if (typeof module != 'undefined') {
    module['exports'] = Module;
  }
  process.on('uncaughtException', (ex) => {
    if (
      ex !== 'unwind' &&
      !(ex instanceof ExitStatus) &&
      !(ex.context instanceof ExitStatus)
    ) {
      throw ex;
    }
  });
  quit_ = (status, toThrow) => {
    process.exitCode = status;
    throw toThrow;
  };
} else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  if (ENVIRONMENT_IS_WORKER) {
    scriptDirectory = self.location.href;
  } else if (typeof document != 'undefined' && document.currentScript) {
    scriptDirectory = document.currentScript.src;
  }
  if (scriptDirectory.startsWith('blob:')) {
    scriptDirectory = '';
  } else {
    scriptDirectory = scriptDirectory.substr(
      0,
      scriptDirectory.replace(/[?#].*/, '').lastIndexOf('/') + 1
    );
  }
  {
    read_ = (url) => {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.send(null);
      return xhr.responseText;
    };
    if (ENVIRONMENT_IS_WORKER) {
      readBinary = (url) => {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        xhr.responseType = 'arraybuffer';
        xhr.send(null);
        return new Uint8Array(xhr.response);
      };
    }
    readAsync = (url, onload, onerror) => {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'arraybuffer';
      xhr.onload = () => {
        if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) {
          onload(xhr.response);
          return;
        }
        onerror();
      };
      xhr.onerror = onerror;
      xhr.send(null);
    };
  }
} else {
}
var out = Module['print'] || console.log.bind(console);
var err = Module['printErr'] || console.error.bind(console);
Object.assign(Module, moduleOverrides);
moduleOverrides = null;
if (Module['arguments']) arguments_ = Module['arguments'];
if (Module['thisProgram']) thisProgram = Module['thisProgram'];
if (Module['quit']) quit_ = Module['quit'];
var wasmBinary;
if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];
if (typeof WebAssembly != 'object') {
  abort('no native wasm support detected');
}
var wasmMemory;
var ABORT = false;
var EXITSTATUS;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
function updateMemoryViews() {
  var b = wasmMemory.buffer;
  Module['HEAP8'] = HEAP8 = new Int8Array(b);
  Module['HEAP16'] = HEAP16 = new Int16Array(b);
  Module['HEAPU8'] = HEAPU8 = new Uint8Array(b);
  Module['HEAPU16'] = HEAPU16 = new Uint16Array(b);
  Module['HEAP32'] = HEAP32 = new Int32Array(b);
  Module['HEAPU32'] = HEAPU32 = new Uint32Array(b);
  Module['HEAPF32'] = HEAPF32 = new Float32Array(b);
  Module['HEAPF64'] = HEAPF64 = new Float64Array(b);
}
var __ATPRERUN__ = [];
var __ATINIT__ = [];
var __ATMAIN__ = [];
var __ATPOSTRUN__ = [];
var runtimeInitialized = false;
function preRun() {
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function')
      Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}
function initRuntime() {
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}
function postRun() {
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function')
      Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}
function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null;
function addRunDependency(id) {
  runDependencies++;
  Module['monitorRunDependencies']?.(runDependencies);
}
function removeRunDependency(id) {
  runDependencies--;
  Module['monitorRunDependencies']?.(runDependencies);
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback();
    }
  }
}
function abort(what) {
  Module['onAbort']?.(what);
  what = 'Aborted(' + what + ')';
  err(what);
  ABORT = true;
  EXITSTATUS = 1;
  what += '. Build with -sASSERTIONS for more info.';
  var e = new WebAssembly.RuntimeError(what);
  throw e;
}
var dataURIPrefix = 'data:application/octet-stream;base64,';
var isDataURI = (filename) => filename.startsWith(dataURIPrefix);
var isFileURI = (filename) => filename.startsWith('file://');
var wasmBinaryFile;
wasmBinaryFile = 'https://cdn.glitch.global/16bdd180-f30c-4bf9-b73c-be768ec06bbe/b.wasm?v=1710838948923';
function getBinarySync(file) {
  if (file == wasmBinaryFile && wasmBinary) {
    return new Uint8Array(wasmBinary);
  }
  if (readBinary) {
    return readBinary(file);
  }
  throw 'both async and sync fetching of the wasm failed';
}
function getBinaryPromise(binaryFile) {
  if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
    if (typeof fetch == 'function' && !isFileURI(binaryFile)) {
      return fetch(binaryFile, { credentials: 'same-origin' })
        .then((response) => {
          if (!response['ok']) {
            throw `failed to load wasm binary file at '${binaryFile}'`;
          }
          return response['arrayBuffer']();
        })
        .catch(() => getBinarySync(binaryFile));
    } else if (readAsync) {
      return new Promise((resolve, reject) => {
        readAsync(
          binaryFile,
          (response) => resolve(new Uint8Array(response)),
          reject
        );
      });
    }
  }
  return Promise.resolve().then(() => getBinarySync(binaryFile));
}
function instantiateArrayBuffer(binaryFile, imports, receiver) {
  return getBinaryPromise(binaryFile)
    .then((binary) => WebAssembly.instantiate(binary, imports))
    .then(receiver, (reason) => {
      err(`failed to asynchronously prepare wasm: ${reason}`);
      abort(reason);
    });
}
function instantiateAsync(binary, binaryFile, imports, callback) {
  if (
    !binary &&
    typeof WebAssembly.instantiateStreaming == 'function' &&
    !isDataURI(binaryFile) &&
    !isFileURI(binaryFile) &&
    !ENVIRONMENT_IS_NODE &&
    typeof fetch == 'function'
  ) {
    return fetch(binaryFile, { credentials: 'same-origin' }).then(
      (response) => {
        var result = WebAssembly.instantiateStreaming(response, imports);
        return result.then(callback, function (reason) {
          err(`wasm streaming compile failed: ${reason}`);
          err('falling back to ArrayBuffer instantiation');
          return instantiateArrayBuffer(binaryFile, imports, callback);
        });
      }
    );
  }
  return instantiateArrayBuffer(binaryFile, imports, callback);
}
function createWasm() {
  var info = { env: wasmImports, wasi_snapshot_preview1: wasmImports };
  function receiveInstance(instance, module) {
    wasmExports = instance.exports;
    wasmExports = Asyncify.instrumentWasmExports(wasmExports);
    wasmMemory = wasmExports['memory'];
    updateMemoryViews();
    addOnInit(wasmExports['__wasm_call_ctors']);
    removeRunDependency('wasm-instantiate');
    return wasmExports;
  }
  addRunDependency('wasm-instantiate');
  function receiveInstantiationResult(result) {
    receiveInstance(result['instance']);
  }
  if (Module['instantiateWasm']) {
    try {
      return Module['instantiateWasm'](info, receiveInstance);
    } catch (e) {
      err(`Module.instantiateWasm callback failed with error: ${e}`);
      return false;
    }
  }
  instantiateAsync(
    wasmBinary,
    wasmBinaryFile,
    info,
    receiveInstantiationResult
  );
  return {};
}
function jsAdd(x, y) {
  return x + y;
}
jsAdd.sig = 'iii';
function __asyncjs__promiseAdd(x, y) {
  console.log('__asyncjs__promiseAdd', x, y)
  return Asyncify.handleAsync(async () => Promise.resolve(x + y));
}
__asyncjs__promiseAdd.sig = 'iii';
function ExitStatus(status) {
  this.name = 'ExitStatus';
  this.message = `Program terminated with exit(${status})`;
  this.status = status;
}
var callRuntimeCallbacks = (callbacks) => {
  while (callbacks.length > 0) {
    callbacks.shift()(Module);
  }
};
var noExitRuntime = Module['noExitRuntime'] || true;
var _emscripten_date_now = () => Date.now();
_emscripten_date_now.sig = 'd';
var _emscripten_memcpy_js = (dest, src, num) =>
  HEAPU8.copyWithin(dest, src, src + num);
_emscripten_memcpy_js.sig = 'vppp';
var printCharBuffers = [null, [], []];
var UTF8Decoder =
  typeof TextDecoder != 'undefined' ? new TextDecoder('utf8') : undefined;
var UTF8ArrayToString = (heapOrArray, idx, maxBytesToRead) => {
  var endIdx = idx + maxBytesToRead;
  var endPtr = idx;
  while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
  if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
    return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
  }
  var str = '';
  while (idx < endPtr) {
    var u0 = heapOrArray[idx++];
    if (!(u0 & 128)) {
      str += String.fromCharCode(u0);
      continue;
    }
    var u1 = heapOrArray[idx++] & 63;
    if ((u0 & 224) == 192) {
      str += String.fromCharCode(((u0 & 31) << 6) | u1);
      continue;
    }
    var u2 = heapOrArray[idx++] & 63;
    if ((u0 & 240) == 224) {
      u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
    } else {
      u0 =
        ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63);
    }
    if (u0 < 65536) {
      str += String.fromCharCode(u0);
    } else {
      var ch = u0 - 65536;
      str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023));
    }
  }
  return str;
};
var printChar = (stream, curr) => {
  var buffer = printCharBuffers[stream];
  if (curr === 0 || curr === 10) {
    (stream === 1 ? out : err)(UTF8ArrayToString(buffer, 0));
    buffer.length = 0;
  } else {
    buffer.push(curr);
  }
};
var UTF8ToString = (ptr, maxBytesToRead) =>
  ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
var SYSCALLS = {
  varargs: undefined,
  get() {
    var ret = HEAP32[+SYSCALLS.varargs >> 2];
    SYSCALLS.varargs += 4;
    return ret;
  },
  getp() {
    return SYSCALLS.get();
  },
  getStr(ptr) {
    var ret = UTF8ToString(ptr);
    return ret;
  },
};
var _fd_write = (fd, iov, iovcnt, pnum) => {
  var num = 0;
  for (var i = 0; i < iovcnt; i++) {
    var ptr = HEAPU32[iov >> 2];
    var len = HEAPU32[(iov + 4) >> 2];
    iov += 8;
    for (var j = 0; j < len; j++) {
      printChar(fd, HEAPU8[ptr + j]);
    }
    num += len;
  }
  HEAPU32[pnum >> 2] = num;
  return 0;
};
_fd_write.sig = 'iippp';
var runtimeKeepaliveCounter = 0;
var keepRuntimeAlive = () => noExitRuntime || runtimeKeepaliveCounter > 0;
var _proc_exit = (code) => {
  EXITSTATUS = code;
  if (!keepRuntimeAlive()) {
    Module['onExit']?.(code);
    ABORT = true;
  }
  quit_(code, new ExitStatus(code));
};
_proc_exit.sig = 'vi';
var exitJS = (status, implicit) => {
  EXITSTATUS = status;
  _proc_exit(status);
};
var handleException = (e) => {
  if (e instanceof ExitStatus || e == 'unwind') {
    return EXITSTATUS;
  }
  quit_(1, e);
};
var _exit = exitJS;
_exit.sig = 'vi';
var sigToWasmTypes = (sig) => {
  var typeNames = {
    i: 'i32',
    j: 'i64',
    f: 'f32',
    d: 'f64',
    e: 'externref',
    p: 'i32',
  };
  var type = {
    parameters: [],
    results: sig[0] == 'v' ? [] : [typeNames[sig[0]]],
  };
  for (var i = 1; i < sig.length; ++i) {
    type.parameters.push(typeNames[sig[i]]);
  }
  return type;
};
var runtimeKeepalivePush = () => {
  runtimeKeepaliveCounter += 1;
};
runtimeKeepalivePush.sig = 'v';
var runtimeKeepalivePop = () => {
  runtimeKeepaliveCounter -= 1;
};
runtimeKeepalivePop.sig = 'v';
var Asyncify = {
  instrumentWasmImports(imports) {
    var importPattern = /^(invoke_.*|__asyncjs__.*)$/;
    for (let [x, original] of Object.entries(imports)) {
      let sig = original.sig;
      if (typeof original == 'function') {
        let isAsyncifyImport = original.isAsync || importPattern.test(x);
        if (isAsyncifyImport) {
          let type = sigToWasmTypes(sig);
          type.parameters.unshift('externref');
          imports[x] = original = new WebAssembly.Function(type, original, {
            suspending: 'first',
          });
        }
      }
    }
  },
  instrumentWasmExports(exports) {
    var exportPattern =
      /^(main|__main_argc_argv|_ZN10emscripten8internal5async.*)$/;
    Asyncify.asyncExports = new Set();
    var ret = {};
    for (let [x, original] of Object.entries(exports)) {
      if (typeof original == 'function') {
        let isAsyncifyExport = exportPattern.test(x);
        if (isAsyncifyExport) {
          Asyncify.asyncExports.add(original);
          original = Asyncify.makeAsyncFunction(original);
        }
        ret[x] = (...args) => original(...args);
      } else {
        ret[x] = original;
      }
    }
    return ret;
  },
  asyncExports: null,
  isAsyncExport(func) {
    return Asyncify.asyncExports?.has(func);
  },
  handleAsync: async (startAsync) => {
    try {
      return await startAsync();
    } finally {
    }
  },
  handleSleep(startAsync) {
    return Asyncify.handleAsync(() => new Promise(startAsync));
  },
  makeAsyncFunction(original) {
    var type = original.type
      ? original.type()
      : WebAssembly.Function.type(original);
    var parameters = type.parameters;
    var results = type.results;
    parameters.shift();
    return new WebAssembly.Function(
      { parameters: parameters, results: ['externref'] },
      original,
      { promising: 'first' }
    );
  },
};
var wasmImports = {
  __asyncjs__promiseAdd: __asyncjs__promiseAdd,
  emscripten_date_now: _emscripten_date_now,
  emscripten_memcpy_js: _emscripten_memcpy_js,
  fd_write: _fd_write,
  jsAdd: jsAdd,
};
Asyncify.instrumentWasmImports(wasmImports);
var wasmExports = createWasm();
var ___wasm_call_ctors = () =>
  (___wasm_call_ctors = wasmExports['__wasm_call_ctors'])();
var ___original_main = (Module['___original_main'] = () =>
  (___original_main = Module['___original_main'] =
    wasmExports['__original_main'])());
var _main = (Module['_main'] = (a0, a1) =>
  (_main = Module['_main'] = wasmExports['main'])(a0, a1));
var ___start_em_js = (Module['___start_em_js'] = 1744);
var ___stop_em_js = (Module['___stop_em_js'] = 1881);
var calledRun;
dependenciesFulfilled = function runCaller() {
  if (!calledRun) run();
  if (!calledRun) dependenciesFulfilled = runCaller;
};
function callMain() {
  var entryFunction = _main;
  var argc = 0;
  var argv = 0;
  try {
    var ret = entryFunction(argc, argv);
    Promise.resolve(ret)
      .then((result) => {
        exitJS(result, true);
      })
      .catch((e) => {
        handleException(e);
      });
    return ret;
  } catch (e) {
    return handleException(e);
  }
}
function run() {
  if (runDependencies > 0) {
    return;
  }
  preRun();
  if (runDependencies > 0) {
    return;
  }
  function doRun() {
    if (calledRun) return;
    calledRun = true;
    Module['calledRun'] = true;
    if (ABORT) return;
    initRuntime();
    preMain();
    if (Module['onRuntimeInitialized']) Module['onRuntimeInitialized']();
    if (shouldRunNow) callMain();
    postRun();
  }
  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function () {
      setTimeout(function () {
        Module['setStatus']('');
      }, 1);
      doRun();
    }, 1);
  } else {
    doRun();
  }
}
if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function')
    Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}
var shouldRunNow = true;
if (Module['noInitialRun']) shouldRunNow = false;
run();
