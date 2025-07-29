/**
 * @file This Next.js API route handles requests to create a highly optimized virtual browser session
 * via the Anchor Browser API. It prioritizes maximum performance (FPS, minimal delay/buffer)
 * while adhering to specific user requirements to keep certain resource-intensive features active.
 * * Key optimizations focus on enabling headless mode, streamlining viewport settings,
 * and configuring other browser behaviors for efficiency within the given constraints.
 * * Note: Achieving "ABSOLUTE MAXIMUM" performance with features like recording, P2P download,
 * and captcha solving simultaneously active involves inherent trade-offs, as these features
 * naturally consume resources and can introduce latency. The script aims for the best
 * possible performance given these explicit requirements.
 */

// Import necessary modules (if any, though `fetch` is global in modern Node.js environments for Next.js API routes)
// import fetch from 'node-fetch'; // Not strictly needed for Next.js API routes as fetch is globally available.

/**
 * Main handler function for the API route.
 * @param {import('next').NextApiRequest} req - The incoming request object.
 * @param {import('next').NextApiResponse} res - The outgoing response object.
 */
export default async function handler(req, res) {
  // --- CORS Headers Configuration ---
  // These headers allow requests from any origin ('*'), which is common for development
  // or public APIs. For production, consider restricting 'Access-Control-Allow-Origin'
  // to your specific frontend domains for enhanced security.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS'); // Only allow POST for main logic, OPTIONS for pre-flight
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allow Content-Type header for JSON bodies

  // --- Handle OPTIONS (Pre-flight) Request ---
  // Browsers send an OPTIONS request before a "complex" actual request (like POST with custom headers).
  // This needs to be handled to ensure CORS policies are respected.
  if (req.method === 'OPTIONS') {
    console.log('Received OPTIONS request for CORS pre-flight. Responding with 200 OK.');
    return res.status(200).end(); // Respond with 200 OK and an empty body for pre-flight
  }

  // --- Enforce POST Method for Session Creation ---
  // This API route is designed specifically for creating new browser sessions,
  // which is typically a POST operation.
  if (req.method !== 'POST') {
    console.warn(`Method Not Allowed: Received a ${req.method} request, but only POST is supported.`);
    return res.status(405).json({ error: 'Method not allowed. Only POST requests are supported for creating sessions.' });
  }

  // --- Main Logic: Creating Anchor Browser Session ---
  try {
    console.log('Initiating request to Anchor API for session creation...');

    // Define the Anchor API endpoint for creating sessions
    const ANCHOR_API_URL = 'https://api.anchorbrowser.io/v1/sessions';
    // Define your Anchor API Key. In a real-world application, this should be
    // stored securely (e.g., in environment variables) and not hardcoded.
    const ANCHOR_API_KEY = 'sk-3fdd23b3448e47e99ded3a4d531f84fe'; // Placeholder: Replace with actual secure key retrieval

    const response = await fetch(ANCHOR_API_URL, {
      method: 'POST',
      headers: {
        'anchor-api-key': ANCHOR_API_KEY,
        'Content-Type': 'application/json' // Essential for sending JSON payload
      },
      // Construct the request body with detailed session and browser configurations.
      // These parameters are tuned for maximum performance while keeping specified features "ON".
      body: JSON.stringify({
        session: {
          // Setting very high timeouts as per user's preference for potentially long-running sessions.
          // Note: For 'no delay' in session termination for non-active sessions, shorter timeouts are generally better.
          max_duration: 999999, // Max duration for the session in seconds (approx. 11.5 days)
          idle_timeout: 999999, // Max idle time before session terminates in seconds (approx. 11.5 days)
          
          // Recording: Enabled as requested ("ALL ON"). This will add continuous overhead
          // as the browser's activity is captured. This inherently impacts "no buffer" due to I/O.
          recording: { active: true },
          
          // Initial URL for the browser session. Mandatory.
          initial_url: "https://anchorbrowser.io",
          
          // Live View: Set to read-only. While 'live_view' itself consumes resources for streaming,
          // 'read_only: true' minimizes interactivity overhead from the live view perspective.
          live_view: { read_only: true },
          
          // Proxy Configuration: Using Anchor's residential proxy, active as required.
          // Proxies introduce an additional network hop, which can add minimal latency
          // but is often necessary for specific use cases (e.g., bypassing geo-restrictions).
          proxy: {
            type: "anchor_residential",
            country_code: "us",
            active: true
          },
        },
        browser: {
          // --- ABSOLUTE CRITICAL FOR MAX PERFORMANCE, NO DELAY, NO BUFFER, MAX FPS ---
          // Headless Mode: Set to true. This is the single most effective optimization.
          // The browser will run without a graphical user interface, drastically reducing
          // CPU and (virtual) GPU consumption related to rendering, leading to faster
          // execution and response times for programmatic control.
          headless: { active: true },
          
          // Fullscreen: Enabled as requested ("ALL ON"). In headless mode, this setting
          // has negligible performance impact as there's no physical screen to maximize.
          fullscreen: { active: true },
          
          // P2P Download: Enabled as requested ("ALL ON"). This allows peer-to-peer connections.
          // If the browser engages in active P2P transfers, it will consume network bandwidth
          // and CPU resources, which can directly lead to "buffering" and "delays" from
          // a network and processing standpoint for other browser tasks.
          p2p_download: { active: true }, 
          
          // Captcha Solver: Enabled as requested ("ALL ON"). This feature involves an
          // automated process to detect and solve captchas. This process itself takes
          // time, can involve external API calls, and consumes resources, directly
          // introducing "delay" when a captcha challenge is encountered.
          captcha_solver: { active: true }, 

          // Viewport: Setting to a commonly used Full HD resolution (1920x1080).
          // While not as impactful as in headed mode, rendering internal browser
          // elements at very high resolutions (e.g., 4K) can still add minor overhead.
          // This is a good balance for typical automation needs.
          viewport: {
            width: 1920, 
            height: 1080 
          },
          
          // Adblock and Popup Blocker: Kept active. These are beneficial for performance
          // by preventing the loading of unnecessary and often resource-intensive ads
          // and pop-ups, thus contributing to "no buffer" and "max FPS" by reducing page load.
          adblock: { active: true },
          popup_blocker: { active: true },
          
          // Browser Profile: Setting persist to false. This ensures a clean browser state
          // for each new session, preventing potential delays from loading and processing
          // large, persistent profile data. A unique name is still good for logging/identification.
          profile: {
            name: "session-profile-" + Date.now(), // Unique name for the session profile
            persist: false // Do not persist the profile after the session ends for faster restarts
          },
          extensions: [] // No specific extensions loaded, minimizing overhead
        }
      })
    });
    
    // --- API Response Handling ---
    console.log(`Anchor API Response Status: ${response.status}`);
    const data = await response.json(); // Attempt to parse response body as JSON
    console.log('Anchor API Response Data:', data);
    
    // Check if the API call was successful (status code 2xx)
    if (!response.ok) {
      // If the Anchor API returned an error (e.g., 4xx or 5xx), propagate it.
      // The 'data' object should contain the error details from their API.
      console.error('Error from Anchor API:', data);
      return res.status(response.status).json({ 
        error: data.message || 'Unknown error from Anchor API', // Use their error message if available
        details: data // Include full error data for debugging
      });
    }
    
    // Send the successful response data from Anchor API back to the client
    res.json(data);
    console.log('Anchor API session created successfully and response sent.');

  } catch (error) {
    // --- Error Handling for Network Issues or Malformed Responses ---
    // This block catches errors that occur before or during the fetch operation,
    // such as network connectivity issues, DNS resolution problems, or invalid JSON responses.
    console.error('Caught an error during Anchor API request or response processing:', error);
    // Respond with a 500 Internal Server Error for unhandled exceptions
    res.status(500).json({ 
      error: 'Failed to communicate with Anchor API or process response.', 
      message: error.message, // Provide the error message for debugging
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined // Include stack in dev for debugging
    });
  }
}
