async function requestMediaKeySystemAccess(keySystem, config) {
  const text = JSON.stringify(config[0].videoCapabilities);
  try {
    await navigator.requestMediaKeySystemAccess(keySystem, config);
    pre.textContent += `OK:   ${keySystem} - ${text}\r\n`;
  } catch (error) {
    pre.textContent += `FAIL: ${keySystem} - ${text}\r\n`;
  }
}

const widevineConfigs = [
  [
    {
      videoCapabilities: [
        {
          robustness: "HW_SECURE_ALL", // Widevine L1
          contentType: 'video/webm; codecs="vp09.00.10.08"'
        }
      ]
    }
  ],
  [
    {
      videoCapabilities: [
        {
          robustness: "HW_SECURE_DECODE", // Widevine L2
          contentType: 'video/webm; codecs="vp09.00.10.08"'
        }
      ]
    }
  ],
  [
    {
      videoCapabilities: [
        {
          robustness: "HW_SECURE_CRYPTO", // Widevine L2
          contentType: 'video/webm; codecs="vp09.00.10.08"'
        }
      ]
    }
  ],
  [
    {
      videoCapabilities: [
        {
          robustness: "SW_SECURE_DECODE", // Widevine L3
          contentType: 'video/webm; codecs="vp09.00.10.08"'
        }
      ]
    }
  ],
  [
    {
      videoCapabilities: [
        {
          robustness: "SW_SECURE_CRYPTO", // Widevine L3
          contentType: 'video/webm; codecs="vp09.00.10.08"'
        }
      ]
    }
  ]
];
for (const config of widevineConfigs)
  requestMediaKeySystemAccess("com.widevine.alpha", config);

const fairPlayConfigs = [
  [
    {
      videoCapabilities: [
        {
          contentType: 'video/mp4; codecs="dvhe.05.01"'
        }
      ]
    }
  ]
];
for (const config of fairPlayConfigs)
  requestMediaKeySystemAccess("com.apple.fairplay", config);

const fairPlayStreamingConfigs = [
  [
    {
      videoCapabilities: [
        {
          contentType: 'video/mp4; codecs="dvhe.05.01"'
        }
      ]
    }
  ]
];
for (const config of fairPlayStreamingConfigs)
  requestMediaKeySystemAccess("com.apple.fps.2_0", config);
