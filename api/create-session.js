// In a server-side environment (e.g., Next.js API route)
// Make sure to set ANCHOR_API_KEY in your environment variables.
const ANCHOR_API_KEY = process.env.ANCHOR_API_KEY;
const ANCHOR_API_BASE_URL = 'https://api.anchorbrowser.io/v1';

export default async function handler(req, res) {
  // Set standard CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Basic validation for POST requests requiring a body
  if (req.method === 'POST' && !req.body) {
    return res.status(400).json({ error: 'Request body is missing.' });
  }

  try {
    const { action, sessionId, config } = req.body;

    switch (action) {
      case 'CREATE_ULTRA_SESSION':
        return await createUltraSession(req, res, config);
      case 'PAUSE_SESSION':
        return await pauseSession(req, res, sessionId);
      case 'RESUME_SESSION':
        return await resumeSession(req, res, sessionId);
      case 'TERMINATE_SESSION':
        return await terminateSession(req, res, sessionId);
      case 'GET_SESSIONS':
        return await getAllSessions(req, res);
      default:
        // Explicitly handle unsupported actions
        return res.status(400).json({ error: 'Invalid or unsupported action.' });
    }
  } catch (error) {
    console.error('API Handler Error:', error); // Log the full error for debugging
    // Provide a generic error message to the client for security
    return res.status(500).json({ error: 'An internal server error occurred.' });
  }
}

async function fetchAnchorApi(endpoint, options = {}) {
  const defaultHeaders = {
    'anchor-api-key': ANCHOR_API_KEY,
    'Content-Type': 'application/json',
  };

  const response = await fetch(`${ANCHOR_API_BASE_URL}${endpoint}`, {
    ...options,
    headers: { ...defaultHeaders, ...options.headers },
  });

  const data = await response.json();

  if (!response.ok) {
    // Include more details in the error if available from the API
    const errorMessage = data.message || data.error || 'Unknown API error';
    const error = new Error(`API Error: ${response.status} - ${errorMessage}`);
    error.statusCode = response.status;
    error.responseData = data;
    throw error;
  }
  return data;
}

async function createUltraSession(req, res, customConfig = {}) {
  const ULTRA_CONFIG = {
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
        name: `ultra-performance-${Date.now()}`,
        persist: true
      },
      adblock: { active: true },
      popup_blocker: { active: true },
      captcha_solver: { active: true },
      headless: { active: false },
      viewport: {
        width: 3840,
        height: 2160
      },
      fullscreen: { active: true },
      p2p_download: { active: false },
      extensions: [] // Add your extension UUIDs here
    },
    ...customConfig // Allow overriding default config
  };

  try {
    const data = await fetchAnchorApi('/sessions', {
      method: 'POST',
      body: JSON.stringify(ULTRA_CONFIG)
    });
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error creating session:', error);
    return res.status(error.statusCode || 500).json({ error: error.message, details: error.responseData });
  }
}

async function pauseSession(req, res, sessionId) {
  if (!sessionId) return res.status(400).json({ error: 'Session ID is required.' });
  try {
    const data = await fetchAnchorApi(`/sessions/${sessionId}/recordings/pause`, {
      method: 'POST',
    });
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error pausing session:', error);
    return res.status(error.statusCode || 500).json({ error: error.message, details: error.responseData });
  }
}

async function resumeSession(req, res, sessionId) {
  if (!sessionId) return res.status(400).json({ error: 'Session ID is required.' });
  try {
    const data = await fetchAnchorApi(`/sessions/${sessionId}/recordings/resume`, {
      method: 'POST',
    });
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error resuming session:', error);
    return res.status(error.statusCode || 500).json({ error: error.message, details: error.responseData });
  }
}

async function terminateSession(req, res, sessionId) {
  if (!sessionId) return res.status(400).json({ error: 'Session ID is required.' });
  try {
    const data = await fetchAnchorApi(`/sessions/${sessionId}`, {
      method: 'DELETE',
    });
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error terminating session:', error);
    return res.status(error.statusCode || 500).json({ error: error.message, details: error.responseData });
  }
}

async function getAllSessions(req, res) {
  // NOTE: The Anchor Browser API documentation needs to be checked
  // for an endpoint to list all active sessions. This is a placeholder.
  // Assuming '/sessions' GET request would list sessions.
  try {
    const data = await fetchAnchorApi('/sessions', {
      method: 'GET',
    });
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching all sessions:', error);
    return res.status(error.statusCode || 500).json({ error: error.message, details: error.responseData });
  }
}
