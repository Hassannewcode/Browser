export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    console.log('Initiating request to Anchor API for session creation...');

    const response = await fetch('https://api.anchorbrowser.io/v1/sessions', {
      method: 'POST',
      headers: {
        'anchor-api-key': 'sk-3fdd23b3448e47e99ded3a4d531f84fe',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        session: {
          max_duration: 999999,
          idle_timeout: 999999,
          // PERFORMANCE: Enable proxy for better speeds
          proxy: {
            type: "anchor_residential",
            country_code: "us", // or your preferred location
            active: true
          }
        },
        browser: {
          headless: { active: false },
          viewport: { width: 1920, height: 1080 },
          // PERFORMANCE: Enable all optimization features
          adblock: { active: true },           // Blocks ads for faster loading
          popup_blocker: { active: true },     // Prevents popup interference
          captcha_solver: { active: true },    // Automated captcha solving
          p2p_download: { active: false },     // Disable P2P for performance
          // Extensions array for performance extensions (you need to upload them first)
          // extensions: ["your-tab-suspender-extension-id", "other-performance-extension-ids"]
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    console.log(`Anchor API response status: ${response.status}`);
    const data = await response.json();
    console.log('Anchor API response data:', data);

    if (!response.ok) {
      console.error('Error from Anchor API:', data);
      return res.status(response.status).json({ error: data });
    }

    res.json(data);

  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.error('Request to Anchor API timed out:', error.message);
      res.status(504).json({ error: 'Request to Anchor API timed out.' });
    } else {
      console.error('An unexpected error occurred during Anchor API request:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
}
