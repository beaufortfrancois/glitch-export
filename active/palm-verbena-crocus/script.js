(async () => {
  await Promise.all([
    navigator.permissions.query({ name: "accelerometer" }),
    navigator.permissions.query({ name: "magnetometer" }),
    navigator.permissions.query({ name: "gyroscope" })
  ]);

  const options = { frequency: 1, referenceFrame: "device" };
  const sensor = new AbsoluteOrientationSensor(options);

  sensor.onreading = () => {
    console.log(sensor.quaternion);
    // console.log(arguments);
  };
  sensor.start();
})();
