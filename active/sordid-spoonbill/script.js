const template = document.createElement('template');
template.innerHTML = `
<style>
    :host {
    display: block;
    font-family: sans-serif;
    text-align: center;
    }

    :fullscreen {
      color: red;
    }

    :focus {
      color: red;
    }
</style>
<button autofocus>PROUT</button>
<!--
<video controls preload="auto" src="https://storage.googleapis.com/dalecurtis-shared/buck2.mp4"></video>
-->
`;

class TodoApp extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open', delegatesFocus: true });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
    }
}

window.customElements.define('to-do-app', TodoApp);