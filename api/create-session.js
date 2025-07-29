export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      console.log('Making request to Anchor API...');
      
      const { settings = {} } = req.body;
      
      const response = await fetch('https://api.anchorbrowser.io/v1/sessions', {
        method: 'POST',
        headers: {
          'anchor-api-key': 'sk-3fdd23b3448e47e99ded3a4d531f84fe',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session: {
            initial_url: settings.initialUrl || "https://google.com",
            recording: { active: settings.recording === true }, // Disable for max performance
            proxy: {
              type: settings.proxyType || "anchor_residential",
              country_code: settings.proxyCountry || "us",
              active: settings.proxy === true // Disable for max speed
            },
            timeout: {
              max_duration: 999999,
              idle_timeout: 999999
            },
            live_view: {
              read_only: false,
              fps: settings.fps || 60, // Maximum FPS
              quality: settings.quality || "high", // High quality streaming
              latency: "low" // Low latency mode
            }
          },
          browser: {
            profile: {
              name: settings.profileName || null,
              persist: settings.persistProfile === true // Disable for speed
            },
            adblock: { active: settings.adblock !== false },
            popup_blocker: { active: settings.popupBlocker !== false },
            captcha_solver: { active: settings.captchaSolver !== false },
            headless: { active: false },
            viewport: {
              width: settings.viewportWidth || 1920,
              height: settings.viewportHeight || 1080
            },
            fullscreen: { active: settings.fullscreen === true },
            p2p_download: { active: settings.p2pDownload === true },
            // Performance optimizations
            gpu_acceleration: { active: true },
            hardware_acceleration: { active: true },
            memory_optimization: { active: true }
          }
        })
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (!response.ok) {
        return res.status(response.status).json({ error: data });
      }
      
      res.json(data);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { sessionId } = req.body;
      
      if (!sessionId) {
        return res.status(400).json({ error: 'Session ID required' });
      }
      
      const response = await fetch(`https://api.anchorbrowser.io/v1/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'anchor-api-key': 'sk-3fdd23b3448e47e99ded3a4d531f84fe'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return res.status(response.status).json({ error: errorData });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error terminating session:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
