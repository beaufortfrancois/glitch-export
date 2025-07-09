import { Float16Array } from "https://cdn.jsdelivr.net/npm/@petamoriken/float16/+esm";

const adapter = await navigator.gpu.requestAdapter();
if (!adapter) {
  throw new Error("Failed to get GPU adapter.");
}
if (!adapter.features.has("shader-f16")) {
  throw new Error("16-bit floating-point value support is not available");
}

const device = await adapter.requestDevice({
  requiredFeatures: ["shader-f16", "timestamp-query"],
});

const sizes = [256, 512, 1024, 2048, 4096];

for (const size of sizes) {
  pre.append(` ${size}x${size}\n`);
  pre.append(`----------------\n`);

  await multiplyMatricesWithFloat16(device, size, size);
  await new Promise((r) => requestAnimationFrame(r));

  await multiplyMatricesWithFloat32(device, size, size);
  await new Promise((r) => requestAnimationFrame(r));
  pre.append(`\n`);
}

async function multiplyMatricesWithFloat16(device, rows, columns) {
  // First Matrix

  const firstMatrix = new Float16Array(2 + rows * columns);
  firstMatrix[0] = rows;
  firstMatrix[1] = columns;
  for (let i = 2; i < firstMatrix.length; i++) {
    firstMatrix[i] = i - 1;
  }

  const gpuBufferFirstMatrix = device.createBuffer({
    mappedAtCreation: true,
    size: firstMatrix.byteLength,
    usage: GPUBufferUsage.STORAGE,
  });
  const arrayBufferFirstMatrix = gpuBufferFirstMatrix.getMappedRange();

  new Float16Array(arrayBufferFirstMatrix).set(firstMatrix);
  gpuBufferFirstMatrix.unmap();

  // Second Matrix

  const secondMatrix = new Float16Array(2 + rows * columns);
  secondMatrix[0] = columns;
  secondMatrix[1] = rows;
  for (let i = 2; i < firstMatrix.length; i++) {
    secondMatrix[i] = i - 1;
  }

  const gpuBufferSecondMatrix = device.createBuffer({
    mappedAtCreation: true,
    size: secondMatrix.byteLength,
    usage: GPUBufferUsage.STORAGE,
  });
  const arrayBufferSecondMatrix = gpuBufferSecondMatrix.getMappedRange();
  new Float16Array(arrayBufferSecondMatrix).set(secondMatrix);
  gpuBufferSecondMatrix.unmap();

  // Result Matrix

  const resultMatrixBufferSize =
    Float16Array.BYTES_PER_ELEMENT * (2 + firstMatrix[0] * secondMatrix[1]);
  const resultMatrixBuffer = device.createBuffer({
    size: resultMatrixBufferSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
  });

  // Compute shader code

  const shaderModule = device.createShaderModule({
    code: `
      enable f16;
      struct Matrix {
        size : vec2<f16>,
        numbers: array<f16>,
      }

      @group(0) @binding(0) var<storage, read> firstMatrix : Matrix;
      @group(0) @binding(1) var<storage, read> secondMatrix : Matrix;
      @group(0) @binding(2) var<storage, read_write> resultMatrix : Matrix;

      @compute @workgroup_size(8, 8)
      fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
        // Guard against out-of-bounds work group sizes
        if (global_id.x >= u32(firstMatrix.size.x) || global_id.y >= u32(secondMatrix.size.y)) {
          return;
        }

        resultMatrix.size = vec2(firstMatrix.size.x, secondMatrix.size.y);

        let resultCell = vec2(global_id.x, global_id.y);
        var result = 0.0h;
        for (var i = 0u; i < u32(firstMatrix.size.y); i = i + 1u) {
          let a = i + resultCell.x * u32(firstMatrix.size.y);
          let b = resultCell.y + i * u32(secondMatrix.size.y);
          result = result + firstMatrix.numbers[a] * secondMatrix.numbers[b];
        }

        let index = resultCell.y + resultCell.x * u32(secondMatrix.size.y);
        resultMatrix.numbers[index] = result;
      }
    `,
  });

  const now = performance.now();
  const gpuDurationInNanoSeconds = await submitCommands(
    device,
    shaderModule,
    firstMatrix,
    gpuBufferFirstMatrix,
    secondMatrix,
    gpuBufferSecondMatrix,
    resultMatrixBuffer,
    resultMatrixBufferSize
  );

  log("f16", performance.now() - now, gpuDurationInNanoSeconds);
}

async function multiplyMatricesWithFloat32(device, rows, columns) {
  // First Matrix

  const firstMatrix = new Float32Array(2 + rows * columns);
  firstMatrix[0] = rows;
  firstMatrix[1] = columns;
  for (let i = 2; i < firstMatrix.length; i++) {
    firstMatrix[i] = i - 1;
  }

  const gpuBufferFirstMatrix = device.createBuffer({
    mappedAtCreation: true,
    size: firstMatrix.byteLength,
    usage: GPUBufferUsage.STORAGE,
  });
  const arrayBufferFirstMatrix = gpuBufferFirstMatrix.getMappedRange();

  new Float32Array(arrayBufferFirstMatrix).set(firstMatrix);
  gpuBufferFirstMatrix.unmap();

  // Second Matrix

  const secondMatrix = new Float32Array(2 + rows * columns);
  secondMatrix[0] = columns;
  secondMatrix[1] = rows;
  for (let i = 2; i < firstMatrix.length; i++) {
    secondMatrix[i] = i - 1;
  }

  const gpuBufferSecondMatrix = device.createBuffer({
    mappedAtCreation: true,
    size: secondMatrix.byteLength,
    usage: GPUBufferUsage.STORAGE,
  });
  const arrayBufferSecondMatrix = gpuBufferSecondMatrix.getMappedRange();
  new Float32Array(arrayBufferSecondMatrix).set(secondMatrix);
  gpuBufferSecondMatrix.unmap();

  // Result Matrix

  const resultMatrixBufferSize =
    Float32Array.BYTES_PER_ELEMENT * (2 + firstMatrix[0] * secondMatrix[1]);
  const resultMatrixBuffer = device.createBuffer({
    size: resultMatrixBufferSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
  });

  // Compute shader code

  const shaderModule = device.createShaderModule({
    code: `
      struct Matrix {
        size : vec2<f32>,
        numbers: array<f32>,
      }

      @group(0) @binding(0) var<storage, read> firstMatrix : Matrix;
      @group(0) @binding(1) var<storage, read> secondMatrix : Matrix;
      @group(0) @binding(2) var<storage, read_write> resultMatrix : Matrix;

      @compute @workgroup_size(8, 8)
      fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
        // Guard against out-of-bounds work group sizes
        if (global_id.x >= u32(firstMatrix.size.x) || global_id.y >= u32(secondMatrix.size.y)) {
          return;
        }

        resultMatrix.size = vec2(firstMatrix.size.x, secondMatrix.size.y);

        let resultCell = vec2(global_id.x, global_id.y);
        var result = 0.0;
        for (var i = 0u; i < u32(firstMatrix.size.y); i = i + 1u) {
          let a = i + resultCell.x * u32(firstMatrix.size.y);
          let b = resultCell.y + i * u32(secondMatrix.size.y);
          result = result + firstMatrix.numbers[a] * secondMatrix.numbers[b];
        }

        let index = resultCell.y + resultCell.x * u32(secondMatrix.size.y);
        resultMatrix.numbers[index] = result;
      }
    `,
  });

  const now = performance.now();
  const gpuDurationInNanoSeconds = await submitCommands(
    device,
    shaderModule,
    firstMatrix,
    gpuBufferFirstMatrix,
    secondMatrix,
    gpuBufferSecondMatrix,
    resultMatrixBuffer,
    resultMatrixBufferSize
  );

  log("f32", performance.now() - now, gpuDurationInNanoSeconds);
}

async function submitCommands(
  device,
  shaderModule,
  firstMatrix,
  gpuBufferFirstMatrix,
  secondMatrix,
  gpuBufferSecondMatrix,
  resultMatrixBuffer,
  resultMatrixBufferSize
) {
  // Pipeline setup

  const computePipeline = device.createComputePipeline({
    layout: "auto",
    compute: {
      module: shaderModule,
      entryPoint: "main",
    },
  });

  // Bind group

  const bindGroup = device.createBindGroup({
    layout: computePipeline.getBindGroupLayout(0 /* index */),
    entries: [
      {
        binding: 0,
        resource: {
          buffer: gpuBufferFirstMatrix,
        },
      },
      {
        binding: 1,
        resource: {
          buffer: gpuBufferSecondMatrix,
        },
      },
      {
        binding: 2,
        resource: {
          buffer: resultMatrixBuffer,
        },
      },
    ],
  });

  // New!
  const querySet = device.createQuerySet({
    type: "timestamp",
    count: 2,
  });
  const resolveBuffer = device.createBuffer({
    size: 2 * 8,
    usage: GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC,
  });
  const resultBuffer = device.createBuffer({
    size: 2 * 8,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  });
  const timestampWrites = {
    querySet,
    beginningOfPassWriteIndex: 0,
    endOfPassWriteIndex: 1,
  };

  // Commands submission

  const commandEncoder = device.createCommandEncoder();

  const passEncoder = commandEncoder.beginComputePass({ timestampWrites });
  passEncoder.setPipeline(computePipeline);
  passEncoder.setBindGroup(0, bindGroup);
  const workgroupCountX = Math.ceil(firstMatrix[0] / 8);
  const workgroupCountY = Math.ceil(secondMatrix[1] / 8);
  passEncoder.dispatchWorkgroups(workgroupCountX, workgroupCountY);
  passEncoder.end();

  commandEncoder.resolveQuerySet(querySet, 0, 2, resolveBuffer, 0);
  commandEncoder.copyBufferToBuffer(
    resolveBuffer,
    0,
    resultBuffer,
    0,
    resultBuffer.size
  );

  // Submit GPU commands.
  device.queue.submit([commandEncoder.finish()]);

  await resultBuffer.mapAsync(GPUMapMode.READ);
  const times = new BigInt64Array(resultBuffer.getMappedRange());
  const gpuDurationInNanoSeconds = Number(times[1] - times[0]);
  resultBuffer.unmap();
  return gpuDurationInNanoSeconds;
}

function log(group, timeJs, gpuDurationInNanoseconds) {
  const timeGpu = gpuDurationInNanoseconds / 1000 / 1000;
  pre.append(
    `- [${group}] JS: ${timeJs.toFixed(2).padStart(7)}ms  - GPU: ${timeGpu
      .toFixed(2)
      .padStart(7)}ms\n`
  );
}
