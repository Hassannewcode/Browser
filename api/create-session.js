export default async function handler(req, res) {
  // Add CORS headers to allow requests from any origin.
  // This is common for public APIs or development environments.
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Specify allowed HTTP methods for CORS pre-flight requests.
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  // Specify allowed headers for CORS pre-flight requests.
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle pre-flight OPTIONS requests. Browsers send this before complex requests
  // to check if the actual request is allowed by the server's CORS policy.
  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // Respond with 200 OK for pre-flight
  }

  // Enforce that only POST requests are allowed for creating sessions.
  // All other methods will receive a 405 Method Not Allowed response.
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Only POST requests are supported.' });
  }

  try {
    console.log('Making request to Anchor API...');

    // Define the Anchor API endpoint.
    const ANCHOR_API_URL = 'https://api.anchorbrowser.io/v1/sessions';
    
    // IMPORTANT: Your Anchor API Key should be securely stored in environment variables
    // (e.g., in a .env.local file for local development, and configured in Vercel project settings).
    // DO NOT hardcode sensitive keys directly in your code for production.
    const ANCHOR_API_KEY = process.env.ANCHOR_API_KEY; 

    // Basic check to ensure the API key is available.
    if (!ANCHOR_API_KEY) {
      console.error('ANCHOR_API_KEY is not set in environment variables.');
      return res.status(500).json({ error: 'Server configuration error: Anchor API Key is missing.' });
    }

    // Initiate the fetch request to the Anchor API.
    const response = await fetch(ANCHOR_API_URL, {
      method: 'POST', // Always POST for creating sessions.
      headers: {
        'anchor-api-key': ANCHOR_API_KEY, // Your API key for authentication.
        'Content-Type': 'application/json' // Indicate that the request body is JSON.
      },
      // Construct the JSON body for the Anchor API request.
      // This structure closely matches your provided examples while applying optimizations.
      body: JSON.stringify({
        session: {
          // Initial URL for the browser session.
          initial_url: "https://anchorbrowser.io",
          
          // Recording: Set to active as per your "ALL ON" requirement.
          // Note: Recording adds continuous overhead (CPU/I/O) as browser activity is captured,
          // which can slightly impact "no buffer" and "max FPS" goals.
          recording: { active: true },
          
          // Proxy configuration: Using Anchor's residential proxy, active as specified.
          // Proxies can introduce minor network latency but are often essential for specific use cases.
          proxy: {
            type: "anchor_residential",
            country_code: "us",
            active: true
          },
          
          // Timeout settings: Set to very high values as per your original examples.
          // For truly "no delay" in session termination, shorter timeouts for idle
          // sessions would be more efficient, but keeping high as requested.
          timeout: {
            max_duration: 999999, // Max duration in seconds (approx. 11.5 days).
            idle_timeout: 999999  // Max idle time in seconds before termination.
          },
          
          // Live View: Set to 'read_only: false' as per your second example.
          // Note: An active live view, especially one that is not read-only, consumes
          // network bandwidth and processing resources for streaming, which can
          // affect overall "no buffer" performance.
          live_view: { read_only: false }
        },
        browser: {
          // Profile configuration: A unique name for the session profile.
          // 'persist: false' is crucial for "MAX performance" as it ensures a clean,
          // fast-loading browser instance for each session, avoiding delays from
          // loading large, persistent profile data.
          profile: {
            name: "session-profile-" + Date.now(), // Dynamic name for uniqueness.
            persist: false // Do not persist profile for faster startup.
          },
          
          // Adblock: Active. This is beneficial for "MAX performance, no buffer, no delay"
          // as it prevents loading of ads and trackers, reducing page weight and processing.
          adblock: { active: true },
          
          // Popup Blocker: Active. Similar to adblock, helps reduce unwanted content
          // and potential resource consumption from pop-up windows.
          popup_blocker: { active: true },
          
          // Captcha Solver: Active as per your "ALL ON" requirement.
          // Note: This feature introduces inherent delays when a captcha is encountered,
          // as the solving process (which might involve external services) takes time.
          // It directly impacts the "no delay" goal during captcha resolution.
          captcha_solver: { active: true },
          
          // Headless Mode: Set to 'active: true'. THIS IS THE MOST CRITICAL SETTING
          // for achieving "MAX FPS, no delay, no buffer, ABSOLUTE MAXIMUM" performance.
          // Running headless means the browser operates without a visible graphical interface,
          // drastically reducing CPU and (virtual) GPU resource consumption for rendering.
          headless: { active: true },
          
          // Viewport: Optimized for a common Full HD resolution (1920x1080).
          // While the original example had 4K (3840x2160), a smaller resolution
          // like 1920x1080 still provides high fidelity while being less resource-intensive
          // for internal rendering calculations, contributing to better FPS.
          viewport: {
            width: 1920,
            height: 1080
          },
          
          // Fullscreen: Set to 'active: true' as per your "ALL ON" requirement.
          // In headless mode, this has minimal practical performance impact as there's
          // no display to maximize, but it's included for strict adherence to your request.
          fullscreen: { active: true },
          
          // P2P Download: Set to 'active: true' as per your "ALL ON" requirement.
          // Note: Enabling P2P capabilities can consume significant network bandwidth
          // and CPU resources if active transfers occur, directly impacting "no buffer"
          // and "no delay" for other browser operations.
          p2p_download: { active: true },
          
          // Extensions: An empty array, meaning no browser extensions are loaded,
          // which minimizes startup time and resource consumption.
          extensions: []
        }
      })
    });
    
    // Log the response status from the Anchor API for debugging.
    console.log('Response status from Anchor API:', response.status);
    
    // Parse the JSON response body from the Anchor API.
    const responseData = await response.json();
    console.log('Response data from Anchor API:', responseData);
    
    // Check if the HTTP response status indicates an error (e.g., 4xx or 5xx).
    if (!response.ok) {
      // If the Anchor API returned an error, log it and send a detailed error response.
      console.error('Error received from Anchor API:', responseData);
      return res.status(response.status).json({ 
        error: responseData.message || 'Unknown error from Anchor API', // Use their error message if available.
        details: responseData // Include full response data for more context.
      });
    }
    
    // If the request was successful, send the data received from Anchor API back to the client.
    // The HTML frontend expects `live_view_url` and `id` at the top level of this response.
    res.json(responseData);
    console.log('Anchor API session created successfully and response sent to client.');

  } catch (error) {
    // Catch any unexpected errors during the fetch operation (e.g., network issues, JSON parsing errors).
    console.error('Caught an unhandled error during Anchor API request or response processing:', error);
    // Send a 500 Internal Server Error response.
    res.status(500).json({ 
      error: 'Failed to communicate with Anchor API or process response.', 
      message: error.message, // Provide the error message.
      // Include stack trace only in development environment for security.
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
}
