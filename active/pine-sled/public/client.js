class LoadingIndicator extends HTMLElement {
  constructor() {
      super();
  }
  
  connectedCallback() {
    this.style.display = 'none';
    this.attachShadow({mode: 'open'});
    this.loadingVisibleTemplate = document.createElement('template');
    this.loadingVisibleTemplate.innerHTML = `
      <style>
        @keyframes fade-in {
          from {opacity: 0;}
          to {opacity: 1;}
        }

        .loading-background {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          background: rgba(0, 0, 0, 0.6);
          animation-name: fade-in;
          animation-duration: 0.2s;
          text-align: center;
        }

        .loading-panel {
          margin: 20rem auto;
          width: 20rem;
          height: 5rem;
          background: white;
          border: 2px solid grey;
          padding: 2rem;
        }

        .loading-message {
        }

        .loading-cancel {
          animation-name: fade-in;
          animation-duration: 0.2s;
        }
      </style>
      <div class="loading-background">
        <div class="loading-panel">
          <div class="loading-message">Loading…</div>
        </div>
      <div>
    `;
    
    
    this.onLinkClick = this.onLinkClick.bind(this);
    document.body.addEventListener('click', this.onLinkClick);
  }
    
  disconnectedCallback() {
    document.body.removeEventListener('click', this.onLinkClick);
  }
    
  onLinkClick(evt) {
    if ('A' !== evt.target.tagName) {
      return;
    }

    if (!window.location.href.startsWith(evt.target.origin)) {
      return;
    }

//     function sleep_until (seconds) {
//        var max_sec = new Date().getTime();
//        while (new Date() < max_sec + seconds * 1000) {}
//         return true;
//     }

//     while(status !== 'loading-canceled') {
//       sleep_until(3);
//       //TODO
//     }


    // setTimeout(function() {
    // evt.preventDefault();
    // }, 0);
    
    window.onbeforeunload = e => {
    e.preventDefault();
return false;
console.log(e);
}
    this.currentEvent = evt;
    // return false;
    this.setLoadingInitial(evt);
    // window.location.assign(evt.target.href);
  }
  
  get status() {
    return this.getAttribute(status);
  }
  
  set status(newStatus) {
    this.setAttribute('status', newStatus);
  }
  
  attributeChangedCallback(attrName, oldVal, newVal) {
    console.log(attrName, oldVal, newVal);
  }

  setLoadingInitial() {
    this.status = 'loading-initial';
    setTimeout(() => this.setLoadingVisible(), 300);
  }
  
  setLoadingVisible() {
    this.shadowRoot.appendChild(this.loadingVisibleTemplate.content.cloneNode(true));
    this.style.display = 'block';
    this.status = 'loading-visible';
    setTimeout(() => this.setLoadingCancelable(), 2000);
  }
  
  setLoadingCancelable() {
    const cancelButton = document.createElement('button');
    cancelButton.innerHTML = 'Cancel';
    cancelButton.classList.add('loading-cancel');
    cancelButton.addEventListener('click', () => this.setLoadingCanceled());
    this.shadowRoot.querySelector('.loading-panel').appendChild(cancelButton);
    this.status = 'loading-cancelable';
  }
  
  setLoadingCanceled() {
    this.shadowRoot.removeChild(this.shadowRoot.querySelector('.loading-background'));
    this.shadowRoot.removeChild(this.shadowRoot.querySelector('style'));
    this.status = 'loading-canceled';
console.log(this.currentEvent);
    this.currentEvent.preventDefault();

    // window.stop();
    // const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    // const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    //window.location.replace(window.location.href);
    // document.documentElement.scrollTop = document.body.scrollTop = scrollLeft;
    // document.documentElement.scrollLeft = document.body.scrollLeft = scrollTop;
  }
}

window.customElements.define('loading-indicator', LoadingIndicator);