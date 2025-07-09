button.onclick = async () => {
  const constraints = { video: { frameRate: 120 } };
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  const track = stream.getTracks()[0];

  const trackSettings = track.getSettings();
  canvas.width = trackSettings.width;
  canvas.height = trackSettings.height;

  const video = document.createElement("video");
  video.srcObject = stream;
  await video.play();
  canvas.classList.add("fullscreen");
  (function render() {
    const videoFrame = new VideoFrame(video);
    applyFilter(videoFrame);
    requestAnimationFrame(render);
  })();
};

const adapter = await navigator.gpu.requestAdapter();
const device = await adapter.requestDevice();

const format = navigator.gpu.getPreferredCanvasFormat();
const context = document.querySelector("canvas").getContext("webgpu");
context.configure({ device, format });

const module = device.createShaderModule({
  code: `
    @vertex
    fn vertexMain(@builtin(vertex_index) i : u32) -> @builtin(position) vec4f {
      const quadPos = array(vec2f(-1, 1), vec2f(-1, -1), vec2f(1, 1), vec2f(1, -1));
      return vec4f(quadPos[i], 0, 1);
    }

    @group(0) @binding(0) var<storage, read_write> buffer: array<vec3u>;
    @group(0) @binding(1) var myTexture: texture_external;

    @fragment
    fn fragmentMain(@builtin(position) position : vec4f) -> @location(0) vec4f {
      let result = textureLoad(myTexture, vec2u(position.xy));
      if (position.x > f32(textureDimensions(myTexture).x / 2)) {
         return result;
      }
      let gray = dot(result.xyz, vec3f(0.21, 0.71, 0.07));
      return vec4f(gray, gray, gray, 1);
    }
  `,
});
const pipeline = device.createRenderPipeline({
  layout: "auto",
  vertex: {
    module,
    entryPoint: "vertexMain",
  },
  fragment: {
    module,
    entryPoint: "fragmentMain",
    targets: [{ format }],
  },
  primitive: {
    topology: "triangle-strip",
  },
});

function applyFilter(videoFrame) {
  const texture = device.importExternalTexture({ source: videoFrame });
  const buffer = device.createBuffer({
    size: 32,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
  });
  const bindgroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: {buffer: buffer} },
      { binding: 1, resource: texture },
    ],
  });

  const commandEncoder = device.createCommandEncoder();
  const colorAttachments = [
    {
      view: context.getCurrentTexture().createView(),
      loadOp: "clear",
      storeOp: "store",
    },
  ];

  const passEncoder = commandEncoder.beginRenderPass({ colorAttachments });
  passEncoder.setPipeline(pipeline);
  passEncoder.setBindGroup(0, bindgroup);
  passEncoder.draw(4);
  passEncoder.end();
  device.queue.submit([commandEncoder.finish()]);
  videoFrame.close();
}
