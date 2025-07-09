// WebGPU Cube
// from http://localhost:8080/webgpu/webgpu-cube.html

/* global GPUBufferUsage */
/* global GPUTextureUsage */

import {
  vec3,
  mat4,
} from "https://webgpufundamentals.org/3rdparty/wgpu-matrix.module.js";

let searchParams = new URL(document.location).searchParams;
const numCanvases = searchParams.get("numCanvases") || 20;

const stats = new Stats();
stats.showPanel(1);
document.body.appendChild(stats.dom);

const debugElem = document.querySelector("#debug");

const r = (max) => Math.random() * max;
const roundUp = (align, value) => (((value + align - 1) / align) | 0) * align;

async function main() {
  const gpu = navigator.gpu;
  if (!gpu) {
    fail("this browser does not support webgpu");
    return;
  }

  const adapter = await gpu.requestAdapter();
  if (!adapter) {
    fail("this browser appears to support WebGPU but it's disabled");
    return;
  }

  const device = await adapter.requestDevice();

  const presentationFormat = gpu.getPreferredCanvasFormat(adapter);
  const sampleCount = 1;

  const visibleCanvasSet = new Set();
  const observer = new IntersectionObserver((entries) => {
    for (const { target, isIntersecting } of entries) {
      if (isIntersecting) {
        visibleCanvasSet.add(target);
      } else {
        visibleCanvasSet.delete(target);
      }
    }
  });

  const canvasToCanvasInfoMap = new Map();
  for (let i = 0; i < numCanvases; ++i) {
    const div = document.createElement("div");
    div.className = "canvasContainer";

    const canvas = document.createElement("canvas");
    div.appendChild(canvas);
    document.body.appendChild(div);
    observer.observe(canvas);

    const id = document.createElement("div");
    id.className = "id";
    id.textContent = i;
    div.appendChild(id);

    const context = canvas.getContext("webgpu");
    context.configure({
      alphaMode: "opaque",
      format: presentationFormat,
      device,
    });

    const canvasInfo = {
      id: i,
      canvas,
      context,
      presentationSize: [300, 150],
      presentationFormat,
      // these are filled out in resizeToDisplaySize
      renderTarget: undefined,
      renderTargetView: undefined,
      depthTexture: undefined,
      depthTextureView: undefined,
      colorMult: [r(1), r(1), r(1), 1],
    };
    canvasToCanvasInfoMap.set(canvas, canvasInfo);
  }

  const shaderSrc = `
  struct VSUniforms {
    worldViewProjection: mat4x4<f32>,
    worldInverseTranspose: mat4x4<f32>,
  };
  @group(0) @binding(0) var<uniform> vsUniforms: VSUniforms;

  struct MyVSInput {
      @location(0) position: vec4<f32>,
      @location(1) normal: vec3<f32>,
      @location(2) texcoord: vec2<f32>,
  };

  struct MyVSOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) normal: vec3<f32>,
    @location(1) texcoord: vec2<f32>,
  };

  @vertex
  fn myVSMain(v: MyVSInput) -> MyVSOutput {
    var vsOut: MyVSOutput;
    vsOut.position = vsUniforms.worldViewProjection * v.position;
    vsOut.normal = (vsUniforms.worldInverseTranspose * vec4<f32>(v.normal, 0.0)).xyz;
    vsOut.texcoord = v.texcoord;
    return vsOut;
  }

  struct FSUniforms {
    colorMult: vec4<f32>,
    lightDirection: vec3<f32>,
  };

  @group(0) @binding(1) var<uniform> fsUniforms: FSUniforms;
  @group(0) @binding(2) var diffuseSampler: sampler;
  @group(0) @binding(3) var diffuseTexture: texture_2d<f32>;

  @fragment
  fn myFSMain(v: MyVSOutput) -> @location(0) vec4<f32> {
    var diffuseColor = textureSample(diffuseTexture, diffuseSampler, v.texcoord);
    var a_normal = normalize(v.normal);
    var l = dot(a_normal, fsUniforms.lightDirection) * 0.5 + 0.5;
    return vec4<f32>(diffuseColor.rgb * l, diffuseColor.a) * fsUniforms.colorMult;
  }
  `;

  const shaderModule = await device.createShaderModule({ code: shaderSrc });

  const vUniformBufferSize = 2 * 16 * 4; // 2 mat4s * 16 floats per mat * 4 bytes per float
  const fUniformBufferSize = 7 * 4; // (1 vec4 + 1 vec3) * 4 bytes per float

  const vsUniformBuffer = device.createBuffer({
    size: roundUp(16, vUniformBufferSize),
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  const fsUniformBuffer = device.createBuffer({
    size: roundUp(16, fUniformBufferSize),
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  const vsUniformValues = new Float32Array(2 * 16); // 2 mat4s
  const worldViewProjection = vsUniformValues.subarray(0, 16);
  const worldInverseTranspose = vsUniformValues.subarray(16, 32);
  const fsUniformValues = new Float32Array(7); // 1 vec4 + 1 vec3
  const colorMult = fsUniformValues.subarray(0, 4);
  const lightDirection = fsUniformValues.subarray(4, 7);

  function createBuffer(device, data, usage) {
    const buffer = device.createBuffer({
      size: data.byteLength,
      usage,
      mappedAtCreation: true,
    });
    const dst = new data.constructor(buffer.getMappedRange());
    dst.set(data);
    buffer.unmap();
    return buffer;
  }

  const positions = new Float32Array([
    1, 1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, -1, 1, 1, -1, 1, -1, -1, -1, -1, -1,
    -1, 1, -1, 1, 1, 1, 1, 1, 1, 1, -1, -1, 1, -1, -1, -1, -1, 1, -1, -1, 1, -1,
    1, -1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1, -1, 1, -1, 1, 1, -1,
    1, -1, -1, -1, -1, -1,
  ]);
  const normals = new Float32Array([
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
  ]);
  const texcoords = new Float32Array([
    1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1,
    0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1,
  ]);
  const indices = new Uint16Array([
    0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14,
    15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23,
  ]);

  const positionBuffer = createBuffer(device, positions, GPUBufferUsage.VERTEX);
  const normalBuffer = createBuffer(device, normals, GPUBufferUsage.VERTEX);
  const texcoordBuffer = createBuffer(device, texcoords, GPUBufferUsage.VERTEX);
  const indicesBuffer = createBuffer(device, indices, GPUBufferUsage.INDEX);

  const tex = device.createTexture({
    size: [2, 2, 1],
    format: "rgba8unorm",
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
  });
  device.queue.writeTexture(
    { texture: tex },
    new Uint8Array([
      255, 255, 128, 255, 128, 255, 255, 255, 255, 128, 255, 255, 255, 128, 128,
      255,
    ]),
    { bytesPerRow: 8, rowsPerImage: 2 },
    { width: 2, height: 2 }
  );

  const sampler = device.createSampler({
    magFilter: "nearest",
    minFilter: "nearest",
  });

  const pipeline = device.createRenderPipeline({
    layout: "auto",
    vertex: {
      module: shaderModule,
      entryPoint: "myVSMain",
      buffers: [
        // position
        {
          arrayStride: 3 * 4, // 3 floats, 4 bytes each
          attributes: [{ shaderLocation: 0, offset: 0, format: "float32x3" }],
        },
        // normals
        {
          arrayStride: 3 * 4, // 3 floats, 4 bytes each
          attributes: [{ shaderLocation: 1, offset: 0, format: "float32x3" }],
        },
        // texcoords
        {
          arrayStride: 2 * 4, // 2 floats, 4 bytes each
          attributes: [{ shaderLocation: 2, offset: 0, format: "float32x2" }],
        },
      ],
    },
    fragment: {
      module: shaderModule,
      entryPoint: "myFSMain",
      targets: [{ format: presentationFormat }],
    },
    primitive: {
      topology: "triangle-list",
      cullMode: "back",
    },
    depthStencil: {
      depthWriteEnabled: true,
      depthCompare: "less",
      format: "depth24plus",
    },
    ...(sampleCount > 1 && {
      multisample: {
        count: sampleCount,
      },
    }),
  });

  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: vsUniformBuffer } },
      { binding: 1, resource: { buffer: fsUniformBuffer } },
      { binding: 2, resource: sampler },
      { binding: 3, resource: tex.createView() },
    ],
  });

  const renderPassDescriptor = {
    colorAttachments: [
      {
        // view: undefined, // Assigned later
        // resolveTarget: undefined, // Assigned Later
        clearValue: { r: 0.5, g: 0.5, b: 0.5, a: 1.0 },
        loadOp: "clear",
        storeOp: "store",
      },
    ],
    depthStencilAttachment: {
      // view: undefined,  // Assigned later
      depthClearValue: 1.0,
      depthLoadOp: "clear",
      depthStoreOp: "store",
    },
  };

  function resizeToDisplaySize(device, canvasInfo) {
    const {
      canvas,
      context,
      renderTarget,
      presentationSize,
      presentationFormat,
      depthTexture,
    } = canvasInfo;
    const width = Math.min(
      device.limits.maxTextureDimension2D,
      canvas.clientWidth
    );
    const height = Math.min(
      device.limits.maxTextureDimension2D,
      canvas.clientHeight
    );

    const needResize =
      !canvasInfo.renderTarget ||
      width !== presentationSize[0] ||
      height !== presentationSize[1];
    if (needResize) {
      if (renderTarget) {
        renderTarget.destroy();
      }
      if (depthTexture) {
        depthTexture.destroy();
      }

      canvas.width = width;
      canvas.height = height;
      presentationSize[0] = width;
      presentationSize[1] = height;

      if (sampleCount > 1) {
        const newRenderTarget = device.createTexture({
          size: presentationSize,
          format: presentationFormat,
          sampleCount,
          usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });
        canvasInfo.renderTarget = newRenderTarget;
        canvasInfo.renderTargetView = newRenderTarget.createView();
      }

      const newDepthTexture = device.createTexture({
        size: presentationSize,
        format: "depth24plus",
        sampleCount,
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
      });
      canvasInfo.depthTexture = newDepthTexture;
      canvasInfo.depthTextureView = newDepthTexture.createView();
    }
    return needResize;
  }

  function render(time) {
    time *= 0.01;

    stats.begin();
    visibleCanvasSet.forEach((canvas) => {
      const canvasInfo = canvasToCanvasInfoMap.get(canvas);
      const { context, id } = canvasInfo;
      resizeToDisplaySize(device, canvasInfo);

      const projection = mat4.perspective(
        (30 * Math.PI) / 180,
        canvas.clientWidth / canvas.clientHeight,
        0.5,
        10
      );
      const eye = [1, 4, -6];
      const target = [0, 0, 0];
      const up = [0, 1, 0];

      const view = mat4.lookAt(eye, target, up);
      const viewProjection = mat4.multiply(projection, view);
      const world = mat4.rotationY(time * 0.5 + id / numCanvases);
      mat4.rotateZ(world, id, world);
      mat4.transpose(mat4.inverse(world), worldInverseTranspose);
      mat4.multiply(viewProjection, world, worldViewProjection);

      vec3.normalize([1, 8, -10], lightDirection);
      colorMult.set(canvasInfo.colorMult);

      device.queue.writeBuffer(vsUniformBuffer, 0, vsUniformValues);
      device.queue.writeBuffer(fsUniformBuffer, 0, fsUniformValues);

      if (sampleCount === 1) {
        const t0 = performance.now();
        const texture = context.getCurrentTexture();
        const t1 = performance.now();
        const time = t1 - t0;
        if (time > 1) {
          console.warn(`getCurrentTexture() took ${time} milliseconds.`);
        }
        const t2 = performance.now();
        renderPassDescriptor.colorAttachments[0].view = texture.createView();

        const t3 = performance.now();
        const time2 = t3 - t2;
        if (time2 > 1) {
          console.warn(`createView() took ${time2} milliseconds.`);
        }
        if ((time2 + time) > 1) {
          console.warn(`getCurrentTexture().createView() took ${time2 + time} milliseconds.`);
        }
      } else {
        renderPassDescriptor.colorAttachments[0].view =
          canvasInfo.renderTargetView;
        renderPassDescriptor.colorAttachments[0].resolveTarget = context
          .getCurrentTexture()
          .createView();
      }
      renderPassDescriptor.depthStencilAttachment.view =
        canvasInfo.depthTextureView;

      const commandEncoder = device.createCommandEncoder();
      const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
      passEncoder.setPipeline(pipeline);
      passEncoder.setBindGroup(0, bindGroup);
      passEncoder.setVertexBuffer(0, positionBuffer);
      passEncoder.setVertexBuffer(1, normalBuffer);
      passEncoder.setVertexBuffer(2, texcoordBuffer);
      passEncoder.setIndexBuffer(indicesBuffer, "uint16");
      passEncoder.drawIndexed(indices.length);
      passEncoder.end();
      device.queue.submit([commandEncoder.finish()]);
    });
    stats.end();

    //debugElem.textContent = [...visibleCanvasSet.keys()].map(canvas => {
    //  return canvasToCanvasInfoMap.get(canvas).id;
    //}).join(', ');

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

function fail(msg) {
  const elem = document.querySelector("#fail");
  const contentElem = elem.querySelector(".content");
  elem.style.display = "";
  contentElem.textContent = msg;
}

main();
