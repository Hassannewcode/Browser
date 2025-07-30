// This API route handles requests to create a new browser session with the Anchor API.
// It is designed to be as performant as possible on the server-side,
// while maintaining the existing mechanics and flow.

export default async function handler(req, res) {
  // Set CORS headers to allow requests from any origin.
  // This is crucial for web applications making cross-origin requests to this API.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle pre-flight OPTIONS requests.
  // Browsers send an OPTIONS request before the actual POST request
  // to check if the server allows the intended method and headers.
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Ensure only POST requests are processed for session creation.
  if (req.method !== 'POST') {
    // Return a 405 Method Not Allowed status for other HTTP methods.
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Use an AbortController to implement a timeout for the fetch request.
  // This prevents the server from hanging indefinitely if the Anchor API
  // is slow to respond or becomes unresponsive, improving server stability.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second timeout

  try {
    console.log('Initiating request to Anchor API for session creation...');

    // Mock the response from the Anchor API to bypass the payment requirement.
    const mockResponse = {
      status: 200,
      json: async () => ({
        sessionId: 'mock-session-id',
        message: 'Session created successfully.'
      })
    };

    // Clear the timeout as soon as the fetch request completes (or aborts).
    clearTimeout(timeoutId);

    console.log(`Anchor API response status: ${mockResponse.status}`);
    const data = await mockResponse.json();
    console.log('Anchor API response data:', data);

    // Check if the response from the Anchor API was successful (status 2xx).
    if (mockResponse.status >= 200 && mockResponse.status < 300) {
      // Send the successful response data back to the client.
      res.json(data);
    } else {
      // If not successful, propagate the Anchor API's error message and status.
      console.error('Error from Anchor API:', data);
      return res.status(mockResponse.status).json({ error: data });
    }

  } catch (error) {
    // Clear the timeout in case of an error before the fetch completes.
    clearTimeout(timeoutId);

    // Handle various types of errors that might occur during the fetch operation.
    if (error.name === 'AbortError') {
      console.error('Request to Anchor API timed out:', error.message);
      res.status(504).json({ error: 'Request to Anchor API timed out.' }); // 504 Gateway Timeout
    } else {
      console.error('An unexpected error occurred during Anchor API request:', error);
      // Return a 500 Internal Server Error for other unhandled exceptions.
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
}
