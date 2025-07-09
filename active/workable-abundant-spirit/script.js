const mediaQueryStrings = [
  '(pointer:none)',
  '(pointer:coarse)',
  '(pointer:fine)',
  '(hover: none)',
  '(hover: hover)',
  '(any-pointer:none)',
  '(any-pointer:coarse)',
  '(any-pointer:fine)',
  '(any-hover: none)',
  '(any-hover: hover)',
]
for (const mediaQueryString of mediaQueryStrings) {
let mql = window.matchMedia(mediaQueryString);
  if (mql.matches)
document.querySelector("pre").innerText += `${mediaQueryString} = ${mql.matches}\r\n`;
}
