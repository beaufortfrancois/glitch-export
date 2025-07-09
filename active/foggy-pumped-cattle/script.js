if (matchMedia("(prefers-color-scheme: light)").matches) {
  preJs.textContent += "matchMedia('(prefers-color-scheme: light)').matches";
} else if (matchMedia("(prefers-color-scheme: dark)").matches) {
  preJs.textContent += "matchMedia('(prefers-color-scheme: dark)').matches";
}
if (matchMedia("(prefers-color-scheme: only light)").matches) {
  preOnlyJs.textContent += "matchMedia('(prefers-color-scheme: only light)').matches";
} else if (matchMedia("(prefers-color-scheme: only dark)").matches) {
  preOnlyJs.textContent += "matchMedia('(prefers-color-scheme: only dark)').matches";
}
