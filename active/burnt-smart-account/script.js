function isMetaThemeColorValidOnAndroid(color) {
  // Chrome will only use meta theme color if it's are dark enough to ensure there's enough contrast on the UI.
  const largest = Math.max(color.red, color.green, color.blue);
  const smallest = Math.min(color.red, color.green, color.blue);
  const average = (largest + smallest) / 2;
  const luminance = average / 255;
  return luminance <= 0.94;
}

colorPicker.oninput = event => {
  const color = hexToRgb(colorPicker.value);
  console.log(isMetaThemeColorValidOnAndroid(color));
};

/* Utils */

function hexToRgb(hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        red: parseInt(result[1], 16),
        green: parseInt(result[2], 16),
        blue: parseInt(result[3], 16)
      }
    : null;
}
