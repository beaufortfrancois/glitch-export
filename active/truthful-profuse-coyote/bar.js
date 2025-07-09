console.log("bar.js");

for (let i = 0; i < 100; i++) {
  import(`./baz.js?id=${i}`);
}

export default class Bar {}
