(function () {
  'use strict';

  function getEventData(event) {
    if (event.data) {
      return event.data;
    }

    return event;
  }
  const isInBrowser = typeof self !== 'undefined'; // Function to read a base64 string as a buffer

  // Isomorphic worker api to be imported by web workers
  let parentPort;

  if (!isInBrowser) {
    parentPort = require('worker_threads').parentPort;
  } // https://nodejs.org/api/worker_threads.html#worker_threads_worker_postmessage_value_transferlist
  // https://developer.mozilla.org/en-US/docs/Web/API/Worker/postMessage


  function postMessage(message, transferArray) {
    // Can't bind parentPort.postMessage, so we need to kinda copy code here :p
    if (isInBrowser) {
      self.postMessage(message, transferArray);
    } else {
      parentPort.postMessage(message, transferArray);
    }
  } // https://nodejs.org/api/worker_threads.html#worker_threads_worker_parentport
  // https://developer.mozilla.org/en-US/docs/Web/API/Worker/onmessage

  function onMessage(callback, port) {
    if (!callback) {
      console.error('workerapi: No callback was provided to onMessage!');
    } // If we passed a port, use that


    if (port) {
      if (isInBrowser) {
        // We are in the browser
        port.onmessage = callback;
      } else {
        // We are in Node
        port.on('message', callback);
      }

      return;
    }

    if (isInBrowser) {
      // We are in the browser
      self.onmessage = callback;
    } else {
      // We are in Node
      parentPort.on('message', callback);
    }
  }

  // Smarter workers.

  let idCounter = 0;

  const generateId = () => {
    const randomId = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
    idCounter++;
    const id = `${randomId}-${idCounter}`;

    if (idCounter > 100000) {
      idCounter = 0;
    }

    return id;
  };

  function getSmartWorkerMessage(message, messageId, workerId) {
    if (!messageId) {
      messageId = generateId();
    }

    return {
      workerId,
      messageId,
      message
    };
  }

  const WORKER_MESSAGE_TYPE = {
    CONNECT: 'CONNECT',
    INSTANTIATE_WASM: 'INSTANTIATE_WASM',
    CLEAR_MEMORY: 'CLEAR_MEMORY',
    CLEAR_MEMORY_DONE: 'CLEAR_MEMORY_DONE',
    GET_MEMORY: 'GET_MEMORY',
    SET_MEMORY: 'SET_MEMORY',
    SET_MEMORY_DONE: 'SET_MEMORY_DONE',
    GET_CONSTANTS: 'GET_CONSTANTS',
    GET_CONSTANTS_DONE: 'GET_CONSTANTS_DONE',
    CONFIG: 'CONFIG',
    RESET_AUDIO_QUEUE: 'RESET_AUDIO_QUEUE',
    PLAY: 'PLAY',
    BREAKPOINT: 'BREAKPOINT',
    PAUSE: 'PAUSE',
    UPDATED: 'UPDATED',
    CRASHED: 'CRASHED',
    SET_JOYPAD_STATE: 'SET_JOYPAD_STATE',
    AUDIO_LATENCY: 'AUDIO_LATENCY',
    RUN_WASM_EXPORT: 'RUN_WASM_EXPORT',
    GET_WASM_MEMORY_SECTION: 'GET_WASM_MEMORY_SECTION',
    GET_WASM_CONSTANT: 'GET_WASM_CONSTANT',
    FORCE_OUTPUT_FRAME: 'FORCE_OUTPUT_FRAME',
    SET_SPEED: 'SET_SPEED',
    IS_GBC: 'IS_GBC'
  };

  // Some shared constants by the graphics lib and worker
  const GAMEBOY_CAMERA_WIDTH = 160;
  const GAMEBOY_CAMERA_HEIGHT = 144;

  // Exporting this function, as we can use it in the benchmarker

  function getImageDataFromGraphicsFrameBuffer(wasmByteMemory) {
    // Draw the pixels
    // 160x144
    // Split off our image Data
    // Even though it is not cheap to create buffers,
    // We need to create this everytime, as it will be transferred back to the
    // main thread, thus removing this worker / access to this buffer.
    const imageDataArray = new Uint8ClampedArray(GAMEBOY_CAMERA_HEIGHT * GAMEBOY_CAMERA_WIDTH * 4);

    for (let y = 0; y < GAMEBOY_CAMERA_HEIGHT; ++y) {
      let stride1 = y * (GAMEBOY_CAMERA_WIDTH * 3);
      let stride2 = y * (GAMEBOY_CAMERA_WIDTH * 4);

      for (let x = 0; x < GAMEBOY_CAMERA_WIDTH; ++x) {
        // Each color has an R G B component
        const pixelStart = stride1 + x * 3;
        const imageDataIndex = stride2 + (x << 2);
        imageDataArray[imageDataIndex + 0] = wasmByteMemory[pixelStart + 0];
        imageDataArray[imageDataIndex + 1] = wasmByteMemory[pixelStart + 1];
        imageDataArray[imageDataIndex + 2] = wasmByteMemory[pixelStart + 2]; // Alpha, no transparency

        imageDataArray[imageDataIndex + 3] = 255;
      }
    }

    return imageDataArray;
  }

  // Web worker for wasmboy lib

  let libWorkerPort;

  const libMessageHandler = event => {
    const eventData = getEventData(event); // Handle our messages from the lib thread

    switch (eventData.message.type) {
      case WORKER_MESSAGE_TYPE.GET_CONSTANTS_DONE:
        {
          postMessage(getSmartWorkerMessage(eventData.message, eventData.messageId));
          return;
        }

      case WORKER_MESSAGE_TYPE.UPDATED:
        {
          // Process the memory buffer and pass back to the main thread
          const imageDataArray = getImageDataFromGraphicsFrameBuffer(new Uint8ClampedArray(eventData.message.graphicsFrameBuffer));
          postMessage(getSmartWorkerMessage({
            type: WORKER_MESSAGE_TYPE.UPDATED,
            imageDataArrayBuffer: imageDataArray.buffer
          }), [imageDataArray.buffer]);
          return;
        }
    }
  };

  const messageHandler = event => {
    // Handle our messages from the main thread
    const eventData = getEventData(event);

    switch (eventData.message.type) {
      case WORKER_MESSAGE_TYPE.CONNECT:
        {
          // Set our lib port
          libWorkerPort = eventData.message.ports[0];
          onMessage(libMessageHandler, libWorkerPort); // Simply post back that we are ready

          postMessage(getSmartWorkerMessage(undefined, eventData.messageId));
          return;
        }

      case WORKER_MESSAGE_TYPE.GET_CONSTANTS:
        {
          // Forward to our lib worker
          libWorkerPort.postMessage(getSmartWorkerMessage({
            type: WORKER_MESSAGE_TYPE.GET_CONSTANTS
          }, eventData.messageId));
          return;
        }

      default:
        {
          //handle other messages from main
          console.log(eventData);
        }
    }
  };

  onMessage(messageHandler);

}());
//# sourceMappingURL=graphics.worker.js.map
