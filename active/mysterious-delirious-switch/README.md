# Conway's Game of Life

## A WebGPU implementation

This repo contains a WebGPU implementation of [Conway's Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life). It updates the game state using compute shaders, and renders it using WebGPU's rendering capabilities.

The app serves as an introduction to many of the core concepts of the WebGPU API. It is intended to be accessible to beginners, both those with no GPU experience and those with experience using other GPU APIs such as WebGL.

Because it is aimed at teaching the API, the application is not intended to be a perfectly optimal implementation of the Game of Life. There are absolutely ways to make various aspects of this code faster/more compact/more clever, but it would likely make the code harder to follow for beginners.
