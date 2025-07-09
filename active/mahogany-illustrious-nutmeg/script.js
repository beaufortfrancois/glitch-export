const adapter = await navigator.gpu.requestAdapter();
const device = await adapter.requestDevice();
const bindGroupLayout = device.createBindGroupLayout({
  entries: [
    {
      binding: 0,
      visibility: GPUShaderStage.COMPUTE,
      buffer: {
        type: 'uniform',
        hasDynamicOffset: true,
      },
    },
  ],
});

const buffer = device.createBuffer({
  size: 10 * Float32Array.BYTES_PER_ELEMENT,
  usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
});
const bindGroup = device.createBindGroup({
  layout: bindGroupLayout,
  entries: [
    {
      binding: 0,
      resource: {
        buffer,
      },
    },
  ],
});

const offsets = [0];
const encoder = device.createCommandEncoder();
const pass = encoder.beginComputePass();
function test() {  
  console.time('setBindGroup');
  for (let i = 0; i < 100000; ++i) {
    pass.setBindGroup(0, bindGroup, offsets);
  }
  console.timeEnd('setBindGroup');
}
setInterval(test, 1000);
