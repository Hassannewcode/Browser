Error: Failed to fetch. Please refresh or check API settings.

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Anchor Browser Session</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            height: 100vh;
            font-family: Arial, sans-serif;
        }
        
        #loading {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            font-size: 18px;
        }
        
        #browser-iframe {
            width: 100%;
            height: 100vh;
            border: none;
            display: none;
        }
    </style>
</head>
<body>
    <div id="loading">Creating new browser session...</div>
    <iframe id="browser-iframe" 
            sandbox="allow-same-origin allow-scripts" 
            allow="clipboard-read; clipboard-write">
    </iframe>

    <script>
        async function createNewSession() {
            const url = 'https://api.anchorbrowser.io/v1/sessions';

            const options = {
                method: 'POST',
                headers: {
                    'anchor-api-key': 'sk-3fdd23b3448e47e99ded3a4d531f84fe',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    session: {
                        max_duration: 999999,
                        idle_timeout: 999999
                    },
                    browser: {
                        headless: {
                            active: false
                        }
                    }
                })
            };

            try {
                const response = await fetch(url, options);
                const data = await response.json();
                
                if (data.data && data.data.live_view_url) {
                    const iframe = document.getElementById('browser-iframe');
                    iframe.src = data.data.live_view_url;
                    iframe.style.display = 'block';
                    document.getElementById('loading').style.display = 'none';
                } else {
                    throw new Error('No live_view_url received');
                }
            } catch (error) {
                console.error('Error creating session:', error);
                document.getElementById('loading').textContent = 'Error creating session. Please refresh.';
            }
        }

        // Start session when page loads
        createNewSession();
    </script>
</body>
</html>
