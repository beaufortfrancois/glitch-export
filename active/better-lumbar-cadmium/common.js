/* Checks if the required feature is supported */
function isSupported(apiStr, apiParent) {
  if (apiStr in apiParent) {
    return true;
  } 
  const divNotSupported = document.getElementById('notSupported');
  divNotSupported.classList.toggle('hidden', false);
  divNotSupported.querySelector('code').textContent = apiStr;
  return false;
}

/* Custom Install */ 
let installSource;
let deferredPrompt;
const btnAdd = document.getElementById('butInstall');
const divInstallStatus = document.getElementById('installAvailable');

// Handle install available
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Show install promo and set global deferredPrompt to `e`
  showInstallPromo(e);
  // Log to console
  console.log('INSTALL: Available');
});

// Handle user request to install
btnAdd.addEventListener('click', (e) => {
  // Log to console
  console.log('INSTALL: Clicked');
  // hide our user interface that shows our A2HS button
  btnAdd.setAttribute('disabled', true);
  // Set the install source to this button
  installSource = 'butAdd';
  // Show the prompt
  deferredPrompt.prompt();
  // Wait for the user to respond to the prompt
  deferredPrompt.userChoice.then((resp) => {
    divInstallStatus.textContent = JSON.stringify(resp);
    console.log('INSTALL_PROMPT_RESPONSE:', resp);
    // If the user dismissed the prompt, clear the installSource
    if (resp.outcome === 'dismissed') {
      installSource = null;
    }
  });
});

// Log install event for analytics.
window.addEventListener('appinstalled', (evt) => {
  hideInstallPromo();
  deferredPrompt = null;
  if (document.hidden) {
    return;
  }
  const source = installSource ? installSource : 'browser';
  console.log(`INSTALL: Success (${source})`);
});

function showInstallPromo(e) {
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  divInstallStatus.textContent = 'true';
  // Update UI notify the user they can add to home screen
  btnAdd.removeAttribute('disabled');  
}

function hideInstallPromo() {
  divInstallStatus.textContent = 'false';
  // Update UI to disable to install promo
  btnAdd.setAttribute('disabled', 'disabled'); 
}


/**
 *
 * PWA Analytics
 *
 */

const spanDisplayMode = document.getElementById('displayMode');
const spanAlreadyInstalled = document.getElementById('alreadyInstalled');

// What's our referrer
window.addEventListener('DOMContentLoaded', () => {
  console.log('DOCUMENT_REFERRER', document.referrer);
});

// Track & log which display mode the app was started in.
window.addEventListener('DOMContentLoaded', () => {
  let displayMode = 'browser tab';
  if (navigator.standalone) {
    displayMode = 'standalone-ios';
  } 
  if (window.matchMedia('(display-mode: standalone)').matches) {
    displayMode = 'standalone';
  }
  // Log launch display mode to analytics
  console.log('DISPLAY_MODE_LAUNCH:', displayMode);
  spanDisplayMode.textContent = displayMode;
});

// Track and log when display mode changes
window.addEventListener('DOMContentLoaded', () => {
  window.matchMedia('(display-mode: standalone)').addListener((evt) => {
    let displayMode = 'browser tab';
    if (evt.matches) {
      displayMode = 'standalone';
    }
    // Log display mode change to analytics 
    console.log('DISPLAY_MODE_CHANGED:', displayMode);
    spanDisplayMode.textContent = displayMode;
  });
});

// Track & log if the app has previously been installed
if ('getInstalledRelatedApps' in navigator) {
  window.addEventListener('DOMContentLoaded', () => { 
    navigator.getInstalledRelatedApps().then((relatedApps) => {
      console.log('RELATED_APPS:', relatedApps);
      if (relatedApps.length === 0) {
        spanAlreadyInstalled.textContent = 'nope';
        return;
      }
      spanAlreadyInstalled.textContent = 'yes';
    });
  });
}

// Show the user agent
window.addEventListener('DOMContentLoaded', () => {
  const uaSpan = document.getElementById('uaString');
  uaSpan.textContent = navigator.userAgent;
});


/* Register the service worker  */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(() => { 
        console.log('SERVICE_WORKER: Registered'); 
      });
  });
}

