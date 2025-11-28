// Short link service main file
export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;

        // Handle root path - show creation page
        if (path === '/') {
            return handleHomePage();
        }

        // Handle stats page
        if (path === '/stats') {
            return handleStatsPage();
        }

        // Handle API routes
        if (path.startsWith('/api/')) {
            return handleAPI(request, env, path);
        }

        // Handle short link access
        if (path.length > 1) {
            return handleShortLink(request, env, path.substring(1));
        }

        return new Response('Not Found', { status: 404 });
    }
};

// Generate random short code
function generateShortCode(length = 6) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Check if string is a valid URL
function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Handle homepage
function handleHomePage() {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Short Link Generator</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            max-width: 600px;
            width: 100%;
        }
        
        h1 {
            text-align: center;
            color: #333;
            margin-bottom: 30px;
            font-size: 2.5em;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            margin-bottom: 8px;
            color: #555;
            font-weight: 500;
        }
        
        textarea, input[type="text"] {
            width: 100%;
            padding: 15px;
            border: 2px solid #e1e5e9;
            border-radius: 10px;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        
        input[type="checkbox"] {
            width: auto;
            padding: 0;
            margin: 0;
        }
        
        textarea {
            min-height: 120px;
            resize: vertical;
        }
        
        textarea:focus, input[type="text"]:focus {
            outline: none;
            border-color: #667eea;
        }
        
        .btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 10px;
            font-size: 16px;
            cursor: pointer;
            width: 100%;
            transition: transform 0.2s;
        }
        
        .btn:hover {
            transform: translateY(-2px);
        }
        
        .result {
            margin-top: 20px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
            display: none;
        }
        
        .result.show {
            display: block;
        }
        
        .short-link {
            background: #e3f2fd;
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
            word-break: break-all;
            font-family: monospace;
        }
        
        .copy-btn {
            background: #4caf50;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 5px;
            cursor: pointer;
            margin-left: 10px;
        }
        
        .loading {
            display: none;
            text-align: center;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔗 Short Link Generator</h1>
        <form id="linkForm">
            <div class="form-group">
                <label for="content">Enter long URL or any text content:</label>
                <textarea id="content" placeholder="Enter the URL or text content to shorten..." required></textarea>
            </div>
            
            <div class="form-group">
                <label for="customCode">Custom short code (optional):</label>
                <input type="text" id="customCode" placeholder="Leave blank for auto-generation" maxlength="20">
            </div>
            
            <div class="form-group">
                <div style="display: flex; align-items: center; margin-bottom: 5px;">
                    <input type="checkbox" id="rawDisplay" style="margin-right: 8px;">
                    <label for="rawDisplay" style="margin: 0; cursor: pointer;">Display raw content</label>
                </div>
                <small style="display: block; color: #666; margin-left: 24px;">
                    When enabled, text content will be displayed as plain text instead of formatted page
                </small>
            </div>
            
            <button type="submit" class="btn">Generate Short Link</button>
            
            <div class="loading">
                <p>Generating...</p>
            </div>
        </form>
        
        <div id="result" class="result">
            <h3>Generated Successfully!</h3>
            <div class="short-link">
                <span id="shortUrl"></span>
                <button class="copy-btn" onclick="copyToClipboard()">Copy</button>
            </div>
            <p>Click the short link to access the original content</p>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
            <a href="/stats" style="color: #667eea; text-decoration: none;">📊 View Statistics</a>
        </div>
    </div>

    <script>
        document.getElementById('linkForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const content = document.getElementById('content').value;
            const customCode = document.getElementById('customCode').value;
            const loading = document.querySelector('.loading');
            const result = document.getElementById('result');
            
            loading.style.display = 'block';
            result.classList.remove('show');
            
            try {
                const response = await fetch('/api/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        content: content,
                        customCode: customCode,
                        rawDisplay: document.getElementById('rawDisplay').checked
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    document.getElementById('shortUrl').textContent = data.shortUrl;
                    result.classList.add('show');
                } else {
                    alert('Generation failed: ' + data.error);
                }
            } catch (error) {
                alert('Network error: ' + error.message);
            } finally {
                loading.style.display = 'none';
            }
        });
        
        function copyToClipboard() {
            const shortUrl = document.getElementById('shortUrl').textContent;
            navigator.clipboard.writeText(shortUrl).then(() => {
                alert('Copied to clipboard!');
            });
        }
    </script>
</body>
</html>`;

    return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
}

// Handle stats page
function handleStatsPage() {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Short Link Statistics</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            max-width: 600px;
            width: 100%;
        }
        
        h1 {
            text-align: center;
            color: #333;
            margin-bottom: 30px;
            font-size: 2.5em;
        }
        
        .search-form {
            margin-bottom: 30px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            margin-bottom: 8px;
            color: #555;
            font-weight: 500;
        }
        
        input[type="text"] {
            width: 100%;
            padding: 15px;
            border: 2px solid #e1e5e9;
            border-radius: 10px;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        
        input[type="text"]:focus {
            outline: none;
            border-color: #667eea;
        }
        
        .btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 10px;
            font-size: 16px;
            cursor: pointer;
            width: 100%;
            transition: transform 0.2s;
        }
        
        .btn:hover {
            transform: translateY(-2px);
        }
        
        .stats-result {
            margin-top: 20px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
            display: none;
        }
        
        .stats-result.show {
            display: block;
        }
        
        .stat-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e1e5e9;
        }
        
        .stat-item:last-child {
            border-bottom: none;
        }
        
        .stat-label {
            font-weight: 500;
            color: #555;
        }
        
        .stat-value {
            color: #333;
            font-family: monospace;
        }
        
        .error {
            color: #dc3545;
            text-align: center;
            padding: 20px;
        }
        
        .back-link {
            text-align: center;
            margin-top: 20px;
        }
        
        .back-link a {
            color: #667eea;
            text-decoration: none;
        }
        
        .back-link a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Statistics</h1>
        
        <div class="search-form">
            <div class="form-group">
                <label for="shortCode">Enter short code to view statistics:</label>
                <input type="text" id="shortCode" placeholder="e.g., abc123" required>
            </div>
            
            <button onclick="getStats()" class="btn">Get Statistics</button>
        </div>
        
        <div id="statsResult" class="stats-result">
            <div id="statsContent"></div>
        </div>
        
        <div class="back-link">
            <a href="/">← Back to Generator</a>
        </div>
    </div>

    <script>
        async function getStats() {
            const shortCode = document.getElementById('shortCode').value.trim();
            const resultDiv = document.getElementById('statsResult');
            const contentDiv = document.getElementById('statsContent');
            
            if (!shortCode) {
                alert('Please enter a short code');
                return;
            }
            
            try {
                const response = await fetch(\`/api/stats/\${shortCode}\`);
                const data = await response.json();
                
                if (data.success) {
                    const stats = data.stats;
                    const createdDate = new Date(stats.createdAt).toLocaleString();
                    
                    contentDiv.innerHTML = \`
                        <div class="stat-item">
                            <span class="stat-label">Short Code:</span>
                            <span class="stat-value">\${stats.shortCode}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Total Clicks:</span>
                            <span class="stat-value">\${stats.clicks}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Content Type:</span>
                            <span class="stat-value">\${stats.isUrl ? 'URL' : 'Text'}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Display Mode:</span>
                            <span class="stat-value">\${stats.rawDisplay ? 'Raw Content' : 'Formatted Page'}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Created At:</span>
                            <span class="stat-value">\${createdDate}</span>
                        </div>
                    \`;
                    resultDiv.classList.add('show');
                } else {
                    contentDiv.innerHTML = \`<div class="error">\${data.error}</div>\`;
                    resultDiv.classList.add('show');
                }
            } catch (error) {
                contentDiv.innerHTML = \`<div class="error">Network error: \${error.message}</div>\`;
                resultDiv.classList.add('show');
            }
        }
        
        // Allow Enter key to trigger search
        document.getElementById('shortCode').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                getStats();
            }
        });
    </script>
</body>
</html>`;

    return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
}

// Handle API requests
async function handleAPI(request, env, path) {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    if (path === '/api/create' && request.method === 'POST') {
        return handleCreateLink(request, env, corsHeaders);
    }

    if (path.startsWith('/api/stats/') && request.method === 'GET') {
        const shortCode = path.substring('/api/stats/'.length);
        return handleGetStats(env, shortCode, corsHeaders);
    }

    return new Response('API Not Found', { status: 404, headers: corsHeaders });
}

// Create short link
async function handleCreateLink(request, env, corsHeaders) {
    try {
        const { content, customCode, rawDisplay } = await request.json();

        if (!content || content.trim().length === 0) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Content cannot be empty'
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        let shortCode = customCode?.trim();

        // If no custom short code, generate random short code
        if (!shortCode) {
            shortCode = generateShortCode();
            // Ensure generated short code is not duplicate
            let attempts = 0;
            while (await env.LINKS_KV.get(shortCode) && attempts < 10) {
                shortCode = generateShortCode();
                attempts++;
            }
        } else {
            // Check if custom short code already exists
            const existing = await env.LINKS_KV.get(shortCode);
            if (existing) {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'This short code is already taken, please choose another one'
                }), {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }
        }

        // Store link data
        const linkData = {
            content: content.trim(),
            isUrl: isValidURL(content.trim()),
            rawDisplay: rawDisplay || false,
            createdAt: new Date().toISOString(),
            clicks: 0
        };

        await env.LINKS_KV.put(shortCode, JSON.stringify(linkData));

        const shortUrl = `${new URL(request.url).origin}/${shortCode}`;

        return new Response(JSON.stringify({
            success: true,
            shortUrl: shortUrl,
            shortCode: shortCode
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: 'Server error'
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

// Handle short link access
async function handleShortLink(request, env, shortCode) {
    try {
        const linkDataStr = await env.LINKS_KV.get(shortCode);

        if (!linkDataStr) {
            return new Response('Short link not found', { status: 404 });
        }

        const linkData = JSON.parse(linkDataStr);

        // Increment click count
        linkData.clicks = (linkData.clicks || 0) + 1;
        await env.LINKS_KV.put(shortCode, JSON.stringify(linkData));

        // If it's a URL, redirect
        if (linkData.isUrl && !linkData.rawDisplay) {
            return Response.redirect(linkData.content, 302);
        }

        // If it's text, check display mode
        if (linkData.rawDisplay) {
            // Display raw content
            return new Response(linkData.content, {
                headers: { 'Content-Type': 'text/plain; charset=utf-8' }
            });
        } else {
            // Show formatted content page
            return handleTextContent(linkData.content, shortCode, linkData.clicks);
        }

    } catch (error) {
        return new Response('Server error', { status: 500 });
    }
}

// Display text content page
function handleTextContent(content, shortCode, clicks) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Short Link Content</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .header h1 {
            color: #333;
            margin-bottom: 10px;
        }
        
        .short-code {
            background: #e3f2fd;
            padding: 10px 20px;
            border-radius: 25px;
            display: inline-block;
            font-family: monospace;
            color: #1976d2;
        }
        
        .content {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 15px;
            margin: 20px 0;
            line-height: 1.6;
            white-space: pre-wrap;
            word-wrap: break-word;
            font-size: 16px;
        }
        
        .stats {
            text-align: center;
            color: #666;
            margin-top: 20px;
        }
        
        .actions {
            text-align: center;
            margin-top: 30px;
        }
        
        .btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 25px;
            display: inline-block;
            margin: 0 10px;
            transition: transform 0.2s;
        }
        
        .btn:hover {
            transform: translateY(-2px);
        }
        
        .copy-btn {
            background: #4caf50;
            border: none;
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            cursor: pointer;
            margin: 0 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📄 Short Link Content</h1>
            <div class="short-code">${shortCode}</div>
        </div>
        
        <div class="content">${content}</div>
        
        <div class="stats">
            <p>👀 Views: ${clicks}</p>
        </div>
        
        <div class="actions">
            <button class="copy-btn" onclick="copyContent()">Copy Content</button>
            <a href="/" class="btn">Create New Short Link</a>
            <a href="/stats" class="btn" style="background: #28a745;">View Statistics</a>
        </div>
    </div>

    <script>
        function copyContent() {
            const content = \`${content.replace(/`/g, '\\`')}\`;
            navigator.clipboard.writeText(content).then(() => {
                alert('Content copied to clipboard!');
            });
        }
    </script>
</body>
</html>`;

    return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
}

// Get statistics
async function handleGetStats(env, shortCode, corsHeaders) {
    try {
        const linkDataStr = await env.LINKS_KV.get(shortCode);

        if (!linkDataStr) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Short link not found'
            }), {
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const linkData = JSON.parse(linkDataStr);

        return new Response(JSON.stringify({
            success: true,
            stats: {
                shortCode: shortCode,
                clicks: linkData.clicks || 0,
                createdAt: linkData.createdAt,
                isUrl: linkData.isUrl,
                rawDisplay: linkData.rawDisplay || false
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: 'Server error'
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}