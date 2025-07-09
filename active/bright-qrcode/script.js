const canvas = document.getElementById("canvas");
const range = document.getElementById("range");

const adapter = await navigator.gpu.requestAdapter();
const device = await adapter.requestDevice();
const context = canvas.getContext("webgpu");
const format = "rgba16float";

canvas.height = canvas.height * devicePixelRatio;
canvas.width = canvas.width * devicePixelRatio;
canvas.style.height = `${canvas.height / devicePixelRatio}px`;
canvas.style.width = `${canvas.width / devicePixelRatio}px`;

context.configure({
  device,
  format,
  usage: GPUTextureUsage.RENDER_ATTACHMENT,
  toneMapping: { mode: "extended" },
});

// HTMLImageElement
let source = document.createElement("img");
source.crossOrigin = "";
source.src =
  "https://cdn.glitch.global/bbb4ffa9-cda2-4fcd-aeea-0c84de43f121/qrcode_gpuweb.github.io.png";
await source.decode();

(function render() {
  requestAnimationFrame(render);

  const code = `
struct VertexOutput {
  @builtin(position) position : vec4f,
  @location(0) fragUV : vec2f,
}

@vertex
fn vertexMain(@builtin(vertex_index) i : u32) -> VertexOutput {
  const quadPos = array(vec2f(-1, 1), vec2f(-1, -1), vec2f(1, 1), vec2f(1, -1));
  const quadUV = array(vec2f(0, 0), vec2f(0, 1), vec2f(1, 0), vec2f(1, 1));

  var output: VertexOutput;
  output.position = vec4f(quadPos[i], 0, 1);
  output.fragUV = quadUV[i];
  return output;
}

@group(0) @binding(0) var mySampler: sampler;
@group(0) @binding(1) var myTexture: texture_2d<f32>;

@fragment
fn fragmentMain(@location(0) fragUV : vec2f) -> @location(0) vec4f {
  return textureSample(myTexture, mySampler, fragUV) * ${range.value};
}`;

  const module = device.createShaderModule({ code });

  const pipeline = device.createRenderPipeline({
    layout: "auto",
    vertex: { module },
    fragment: { module, targets: [{ format }] },
    primitive: { topology: "triangle-strip" },
  });

  const size = [source.width, source.height];
  const texture = device.createTexture({
    size,
    format,
    usage:
      GPUTextureUsage.COPY_DST |
      GPUTextureUsage.RENDER_ATTACHMENT |
      GPUTextureUsage.TEXTURE_BINDING,
  });

  device.queue.copyExternalImageToTexture({ source }, { texture }, size);

  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: device.createSampler() },
      { binding: 1, resource: texture.createView() },
    ],
  });

  const colorAttachments = [
    {
      view: context.getCurrentTexture().createView(),
      loadOp: "clear",
      storeOp: "store",
    },
  ];

  const commandEncoder = device.createCommandEncoder();
  const passEncoder = commandEncoder.beginRenderPass({ colorAttachments });
  passEncoder.setPipeline(pipeline);
  passEncoder.setBindGroup(0, bindGroup);
  passEncoder.draw(4);
  passEncoder.end();

  device.queue.submit([commandEncoder.finish()]);
})();
