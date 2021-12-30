import Renderer from './renderer.js';
import { Wilson } from './algorithms.js';

const round = (num: number) => {
  return Math.round(num / 2) * 2;
};

const resize = (canvas: HTMLCanvasElement, width: number, height: number) => {
  const scale = window.devicePixelRatio;
  const ctx = canvas.getContext('2d')!;

  canvas.width = round(width * scale);
  canvas.height = round(height * scale);

  ctx.scale(scale, scale);
};

await new Promise((res) => {
  window.addEventListener('load', res);
});

const canvas = document.querySelector('canvas')!;

const dimension = 50;

const renderer = new Renderer(canvas, 1);
const algorithm = new Wilson(dimension, dimension);

const ips = dimension ** 2;

const tpi = 1000 / ips;

let elapsed = 0;
let last = performance.now();

let size = renderer.size(algorithm.board());
resize(canvas, size.width, size.height);

const stream = canvas.captureStream(120);
const options = { mimeType: 'video/webm; codecs=vp9' };

const recorder = new MediaRecorder(stream, options);

recorder.addEventListener('dataavailable', (e) => {
  const url = URL.createObjectURL(e.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'video.webm';
  a.innerText = 'download';
  document.querySelector('.container')!.appendChild(a);
});

recorder.start();

let finalFrames = 100;
const run = (timestamp: number) => {
  const iterations = elapsed / tpi;

  let requiresContinue = true;
  for (let i = 0; i < iterations; i++) {
    requiresContinue = algorithm.step() && requiresContinue;
    if (!requiresContinue) {
      break;
    }
    elapsed -= tpi;
  }

  renderer.draw(algorithm.board());

  elapsed += timestamp - last;
  last = timestamp;

  if (requiresContinue) {
    requestAnimationFrame(run);
  } else if (finalFrames > 0) {
    finalFrames--;
    requestAnimationFrame(run);
  } else {
    recorder.stop();
  }
};

requestAnimationFrame(run);

export {};
