export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Making request to Anchor API...');
    
    const response = await fetch('https://api.anchorbrowser.io/v1/sessions', {
      method: 'POST',
      headers: {
        'anchor-api-key': 'sk-3fdd23b3448e47e99ded3a4d531f84fe',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        session: {
          initial_url: "https://anchorbrowser.io",
          recording: { active: true },
          proxy: {
            type: "anchor_residential",
            country_code: "us",
            active: true
          },
          timeout: {
            max_duration: 999999,
            idle_timeout: 999999
          },
          live_view: { read_only: false }
        },
        browser: {
          profile: {
            name: "performance-profile-" + Date.now(),
            persist: true
          },
          adblock: { active: true },
          popup_blocker: { active: true },
          captcha_solver: { active: true },
          headless: { active: false },
          viewport: {
            width: 1920, // Changed from 3840
            height: 1080 // Changed from 2160
          },
          fullscreen: { active: true },
          p2p_download: { active: false },
          extensions: []
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
}
