/*
 * @license
 * Getting Started with Web Serial Codelab (https://todo)
 * Copyright 2019 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License
 */
'use strict';

let port;
let reader;
let inputDone;
let outputDone;
let inputStream;
let outputStream;

const log = document.getElementById('log');
const ledCBs = document.querySelectorAll('input.led');
const divLeftBut = document.getElementById('leftBut');
const divRightBut = document.getElementById('rightBut');
const butConnect = document.getElementById('butConnect');

const GRID_HAPPY = [1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,1,1,1,0];
const GRID_SAD =   [1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,1,1,0,1,0,0,0,1];
const GRID_OFF =   [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
const GRID_HEART = [0,1,0,1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,1,0,0,0,1,0,0];


document.addEventListener('DOMContentLoaded', () => {
  butConnect.addEventListener('click', clickConnect);
  
  // CODELAB: Add feature detection here.
  const notSupported = document.getElementById('notSupported');
  notSupported.classList.toggle('hidden', 'serial' in navigator);
  initCheckboxes();
});

async function connect() {
  // CODELAB: Add code to request & open port here.
  // - Request a port and open a connection.
  port = await navigator.serial.requestPort();
  // - Wait for the port to open.
  await port.open({ baudRate: 9600 });
  
  // CODELAB: Add code setup the output stream here.
  const encoder = new TextEncoderStream();
  outputDone = encoder.readable.pipeTo(port.writable);
  outputStream = encoder.writable;
  
  // CODELAB: Send CTRL-C and turn off echo on REPL
  writeToStream('\x03', 'echo(false);');

  // CODELAB: Add code to read the stream here.
  let decoder = new TextDecoderStream();
  inputDone = port.readable.pipeTo(decoder.writable);
  inputStream = decoder.readable
    .pipeThrough(new TransformStream(new LineBreakTransformer()))
    .pipeThrough(new TransformStream(new JSONTransformer()))
  
  reader = inputStream.getReader();
  readLoop();
}

async function disconnect() {
  drawGrid(GRID_OFF);
  sendGrid();
  
  // CODELAB: Close the input stream (reader).
  if (reader) {
    await reader.cancel();
    await inputDone.catch(() => {});
    reader = null;
    inputDone = null;
  }
  
  // CODELAB: Close the output stream.
  if (outputStream) {
    await outputStream.getWriter().close();
    await outputDone;
    outputStream = null;
    outputDone = null;
  }

  // CODELAB: Close the port.
  await port.close();
  port = null;
}

async function clickConnect() {
  // CODELAB: Add disconnect code here.
  if (port) {
    await disconnect();
    toggleUIConnected(false);
    return;
  }
  
  // CODELAB: Add connect code here.
  await connect();
  
  // CODELAB: Reset the grid on connect here.
  drawGrid(GRID_HAPPY);
  sendGrid();
  
  // CODELAB: Initialize micro:bit buttons.
  watchButton('BTN1');
  watchButton('BTN2');
  
  toggleUIConnected(true); 
}

async function readLoop() {
  // CODELAB: Add read loop here.
  while (true) {
    const { value, done } = await reader.read();
    if (value && value.button) {
      buttonPushed(value);
    } else {
      log.textContent += value + '\n';
    }
    if (done) {
      console.log('[readLoop] DONE', done);
      reader.releaseLock();
      break;
    }
  }
}

function sendGrid() {
  // CODELAB: Generate the grid
  const arr = [];
  ledCBs.forEach((cb) => {
    arr.push(cb.checked === true ? 1 : 0);
  });
  writeToStream(`show(0b${arr.reverse().join('')})`);
}

function writeToStream(...lines) {
  // CODELAB: Write to output stream
  const writer = outputStream.getWriter();
  lines.forEach((line) => {
    console.log('[SEND]', line);
    writer.write(line + '\n');
  });
  writer.releaseLock();
}

function watchButton(btnId) {
  // CODELAB: Hook up the micro:bit buttons to print a string.
  const cmd = `
    setWatch(function(e) {
      print('{"button": "${btnId}", "pressed": ' + e.state + '}');
    }, ${btnId}, {repeat:true, debounce:20, edge:"both"});
  `;
  writeToStream(cmd);
}


class LineBreakTransformer {
  constructor() {
    // A container for holding stream data until a new line.
    this.container = '';
  }

  transform(chunk, controller) {
    // CODELAB: Handle incoming chunk
    this.container += chunk;
    const lines = this.container.split('\r\n');
    this.container = lines.pop();
    lines.forEach(line => controller.enqueue(line));
  }

  flush(controller) {
    // CODELAB: Flush the stream.
    controller.enqueue(this.container);
  }
}

class JSONTransformer {
  transform(chunk, controller) {
    // CODELAB: Attempt to parse JSON content
    try {
      controller.enqueue(JSON.parse(chunk));
    } catch (e) {
      controller.enqueue(chunk);
    }
  }
}

function buttonPushed(butEvt) {
  // CODELAB: micro:bit button press handler
  if (butEvt.button === 'BTN1') {
    divLeftBut.classList.toggle('pressed', butEvt.pressed);
    if (butEvt.pressed) {
      drawGrid(GRID_HAPPY);
      sendGrid();
    }
    return;
  }
  if (butEvt.button === 'BTN2') {
    divRightBut.classList.toggle('pressed', butEvt.pressed);
    if (butEvt.pressed) {
      drawGrid(GRID_SAD);
      sendGrid();
    }
  }
}


// Code provided

function initCheckboxes() {
  ledCBs.forEach((cb) => {
    cb.addEventListener('change', () => {
      sendGrid();
    });
  });
}

function drawGrid(grid) {
  if (grid) {
    grid.forEach((v, i) => {
      ledCBs[i].checked = !!v;
    });
  }
}

function toggleUIConnected(connected) {
  let lbl = 'Connect';
  if (connected) {
    lbl = 'Disconnect';
  }
  butConnect.textContent = lbl;
  ledCBs.forEach((cb) => {
    if (connected) {
      cb.removeAttribute('disabled');
      return;
    }
    cb.setAttribute('disabled', true);
  });
}
