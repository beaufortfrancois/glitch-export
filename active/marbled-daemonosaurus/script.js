(() => {
  
  function handleEvent(event) {
    console.log(`${event.target.id} ${event.type}`);
  }
  
  
  ['camera2 1, facing front', 'camera2 2, facing front infrared'].forEach(async (label, index) => {
    const mediaDevices = await navigator.mediaDevices.enumerateDevices();
    const deviceId = mediaDevices.filter(mediaDevice => (mediaDevice.label === label))[0].deviceId;

    const constraints = {
      audio: false,
      video: {
        width: {
          ideal: 360,
        },
        deviceId: {
          exact: deviceId
        }
      }
    };

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      var video = document.querySelector(`#video${index}`);
    
      video.addEventListener('loadstart', handleEvent);
      video.addEventListener('progress', handleEvent);
      video.addEventListener('canplay', handleEvent);
      video.addEventListener('canplaythrough', handleEvent);      
      
      video.volume = 0;
      video.srcObject = mediaStream;
      video.oncanplay = async () => {
        await video.play();
        
      pre.textContent += "[" + index + "]videoWidth: " + video.videoWidth + "\n";
      
      };     
      
    } catch(err) {
      console.error(err.name + ": " + err.message); 
    }
  });
})();
