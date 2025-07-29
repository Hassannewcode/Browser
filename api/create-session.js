// This API route initiates a high-performance Anchor browser session.
// It includes CORS headers for broader accessibility and robust error handling.

export default async function handler(req, res) {
  // Set CORS headers to allow requests from any origin.
  // This is crucial for web applications making cross-origin API calls.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle pre-flight OPTIONS requests.
  // Browsers send an OPTIONS request before the actual POST request
  // to check if the server allows the intended cross-origin request.
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Ensure only POST requests are processed for session creation.
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Initiating request to Anchor API for high-performance session...');

    // Make the POST request to the Anchor API to create a new session.
    const response = await fetch('https://api.anchorbrowser.io/v1/sessions', {
      method: 'POST',
      headers: {
        // Your Anchor API key for authentication.
        'anchor-api-key': 'sk-3fdd23b3448e47e99ded3a4d531f84fe',
        'Content-Type': 'application/json' // Specify content type as JSON.
      },
      body: JSON.stringify({
        session: {
          // Set max_duration and idle_timeout to very high values
          // to ensure the session persists for a long time without expiring.
          max_duration: 999999,
          idle_timeout: 999999
        },
        browser: {
          // Keep headless active: false to ensure a visible browser session.
          headless: { active: false },
          // Set a high viewport resolution for better rendering quality.
          viewport: { width: 1920, height: 1080 },
          // --- Performance Optimizations for Remote Browser ---
          // NOTE: These parameters are hypothetical and based on common
          // remote browser API capabilities for performance tuning.
          // You MUST verify these against the actual Anchor API documentation.

          // Request a high frame rate (e.g., 60 or 120 FPS) for smoother visuals.
          // The exact key might be 'frame_rate', 'max_fps', or similar.
          // Setting a higher value here requests the remote browser to attempt
          // to render and stream at this rate.
          max_fps: 120, // Example: Request 120 frames per second

          // Optimize for low latency streaming. This often involves reducing
          // internal buffering and prioritizing real-time delivery over quality
          // consistency in some cases.
          // The key might be 'latency_mode', 'network_optimization', 'stream_preset'.
          latency_mode: 'low-latency', // Example: Prioritize minimal delay

          // Configure streaming quality to minimize buffering.
          // 'high-performance' or 'real-time' presets often trade off
          // visual fidelity slightly for reduced buffering and faster updates.
          // The key might be 'stream_quality', 'encoding_preset', 'buffer_strategy'.
          stream_quality: 'real-time', // Example: Optimize for real-time updates

          // Potentially a parameter to request highest refresh rate if available,
          // though 'max_fps' usually covers this for streaming.
          // This is highly dependent on the remote server's display capabilities.
          // refresh_rate_preference: 'highest', // Example: Request highest available refresh rate
        }
      })
    });

    console.log('Response status from Anchor API:', response.status);
    const data = await response.json();
    console.log('Response data from Anchor API:', data);

    // If the API response indicates an error, return the error status and data.
    if (!response.ok) {
      console.error('Anchor API returned an error:', data);
      return res.status(response.status).json({ error: data });
    }

    // Send the successful response data back to the client.
    res.json(data);
  } catch (error) {
    // Catch and log any unexpected errors during the API call.
    console.error('Error during Anchor API request:', error);
    // Return a 500 Internal Server Error with the error message.
    res.status(500).json({ error: error.message });
  }
}
