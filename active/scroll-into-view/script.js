let array = new Array(100);
for (let i = 0; i < 100; i++) {
  array[
    i
  ] = `<p class="color" style="background-color: hsl(280deg, 100%, ${100 -
    i / 2}%)">
&nbsp;</p>`;
}
colors.innerHTML = array.join("");

const searchParams = new URLSearchParams(location.search);
const behavior = searchParams.get("behaviour") || "auto";
bottomButton.onclick = () => bottomDiv.scrollIntoView({ behavior });
topButton.onclick = () => topDiv.scrollIntoView({ behavior });
