console.log("foo.js");

for (let i = 0; i < 100; i++) {
  import(`./bar.js?id=${i}`);
}

export default class Foo {}
