// import Foo from "./foo.js";

for (let i = 0; i < 100; i++) {
  import(`./foo.js?id=${i}`);
}
