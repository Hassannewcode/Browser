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
          initial_url: "https://google.com",
          recording: { active: false }, // Disabled for max performance
          proxy: {
            type: "anchor_residential",
            country_code: "us",
            active: false // Disabled for max speed
          },
          timeout: {
            max_duration: 999999,
            idle_timeout: 999999
          },
          live_view: {
            read_only: false
          }
        },
        browser: {
          profile: {
            persist: false // Disabled for speed
          },
          adblock: { active: true }, // Enabled for faster loading
          popup_blocker: { active: true }, // Enabled for performance
          captcha_solver: { active: true },
          headless: { active: false },
          viewport: { width: 1920, height: 1080 }, // Higher resolution for better performance
          fullscreen: { active: false },
          p2p_download: { active: false } // Disabled for performance
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
