const numCanvas = 1000;

const adapter = await navigator.gpu.requestAdapter();
const device = await adapter.requestDevice();

const format = navigator.gpu.getPreferredCanvasFormat();

async function drawWebGPUCanvas(context, i) {
  const colorAttachments = [
    {
      view: context.getCurrentTexture().createView(),
      clearValue: { r: 0, g: i / numCanvas, b: 0, a: 1 },
      loadOp: "clear",
      storeOp: "store",
    },
  ];
  const commandEncoder = device.createCommandEncoder();
  const passEncoder = commandEncoder.beginRenderPass({ colorAttachments });
  passEncoder.end();
  device.queue.submit([commandEncoder.finish()]);
}

(function createWebGpuContext(i) {
  if (i >= numCanvas) return;

  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);

  const context = canvas.getContext("webgpu");
  context.configure({ device, format });
  drawWebGPUCanvas(context, i);

  setTimeout(() => {
    createWebGpuContext(++i);
  });
})(0);
