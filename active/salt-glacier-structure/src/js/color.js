import { filterInputs, POTRACE } from './ui.js';
import { initialViewBox } from './panzoom.js';
import { progress, svgOutput, optimizeCurvesCheckbox } from './domrefs.js';
import ColorWorker from './colorworker?worker';

let colorWorker = null;
const intervalID = {};

const convertToColorSVG = async (imageData) => {
  if (colorWorker) {
    colorWorker.terminate();
  }
  colorWorker = new ColorWorker();

  return new Promise(async (resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = ({ data }) => {
      channel.port1.close();
      colorWorker.terminate();
      colorWorker = null;
      resolve(data.result);
    };

    progress.value = 0;
    let prefix = '';
    let suffix = '';
    let paths = '';
    let lastLength = 0;

    if (intervalID.current) {
      clearInterval(intervalID.current);
      intervalID.current = null;
    }
    intervalID.current = setInterval(() => {
      const innerHTML = `${prefix}${paths}${suffix}`;
      if (innerHTML.length !== lastLength) {
        svgOutput.innerHTML = innerHTML;
        lastLength = innerHTML.length;
      }
    }, 500);

    const progressChannel = new MessageChannel();
    progressChannel.port1.onmessage = ({ data }) => {
      const percentage = Math.floor((data.processed / data.total) * 100);
      progress.value = percentage;
      if (data.svg) {
        if (!prefix) {
          prefix = data.svg
            .replace(/(.*?<svg[^>]+>)(.*?)(<\/svg>)/, '$1')
            .replace(/\s+width="\d+(?:\.\d+)?"/, '')
            .replace(/\s+height="\d+(?:\.\d+)"/, '');
          suffix = data.svg.replace(/(.*?<svg[^>]+>)(.*?)(<\/svg>)/, '$3');
          if (initialViewBox.width) {
            prefix = prefix.replace(
              /viewBox="([^"]+)"/,
              `viewBox="${initialViewBox.x} ${initialViewBox.y} ${initialViewBox.width} ${initialViewBox.height}"`,
            );
          }
        }
        const path = data.svg.replace(/(.*?<svg[^>]+>)(.*?)(<\/svg>)/, '$2');
        paths += path;
      }
      if (data.processed === data.total) {
        clearInterval(intervalID.current);
        intervalID.current = null;
        progressChannel.port1.close();
        progress.value = 0;
      }
    };

    const params = {
      minPathSegments: Number(filterInputs[POTRACE.minPathLenght].value),
      strokeWidth: Number(filterInputs[POTRACE.strokeWidth].value),
      turdsize: Number(filterInputs[POTRACE.turdsize].value),
      alphamax: Number(filterInputs[POTRACE.alphamax].value),
      turnpolicy: Number(filterInputs[POTRACE.turnpolicy].value),
      opttolerance: Number(filterInputs[POTRACE.opttolerance].value),
      opticurve: optimizeCurvesCheckbox.checked ? 1 : 0,
    };
    colorWorker.postMessage({ imageData, params }, [
      channel.port2,
      progressChannel.port2,
    ]);
  });
};

export { convertToColorSVG, intervalID };