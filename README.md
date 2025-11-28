# Cloudflare Short Link Service

A free short link service based on Cloudflare Workers and KV storage, supporting URL shortening and arbitrary text content storage.

## Features

- 🔗 **URL Shortening**: Convert long URLs to short links with automatic redirection
- 📝 **Text Content Storage**: Store any text content and generate short links for access
- 🎯 **Custom Short Codes**: Support for custom short link suffixes
- 📊 **Access Statistics**: Track click counts for each short link
- 🚀 **Free Deployment**: Completely based on Cloudflare's free services
- 📱 **Responsive Design**: Support for desktop and mobile devices

## Tech Stack

- **Cloudflare Workers**: Serverless computing platform
- **Cloudflare KV**: Key-value storage database
- **Vanilla JavaScript**: No additional frameworks required
- **Modern CSS**: Gradient backgrounds and responsive layout

## Deployment Steps

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Login to Cloudflare

\`\`\`bash
npx wrangler login
\`\`\`

### 3. Create KV Namespace

\`\`\`bash
# Create production KV namespace
npx wrangler kv:namespace create "LINKS_KV"

# Create preview KV namespace
npx wrangler kv:namespace create "LINKS_KV" --preview
\`\`\`

### 4. Update Configuration

Update the created KV namespace IDs in the \`wrangler.toml\` file:

\`\`\`toml
[[kv_namespaces]]
binding = "LINKS_KV"
id = "your-production-kv-namespace-id"
preview_id = "your-preview-kv-namespace-id"
\`\`\`

### 5. Local Development

\`\`\`bash
npm run dev
\`\`\`

### 6. Deploy to Production

\`\`\`bash
npm run deploy
\`\`\`

## API Endpoints

### Create Short Link

\`\`\`
POST /api/create
Content-Type: application/json

{
  "content": "URL or text content to shorten",
  "customCode": "Custom short code (optional)"
}
\`\`\`

**Response Example:**
\`\`\`json
{
  "success": true,
  "shortUrl": "https://your-domain.com/abc123",
  "shortCode": "abc123"
}
\`\`\`

### Get Statistics

\`\`\`
GET /api/stats/{shortCode}
\`\`\`

**Response Example:**
\`\`\`json
{
  "success": true,
  "stats": {
    "shortCode": "abc123",
    "clicks": 42,
    "createdAt": "2023-12-01T10:00:00.000Z",
    "isUrl": true
  }
}
\`\`\`

## Usage Instructions

1. **Access Homepage**: Open the deployed domain to enter the short link creation page
2. **Enter Content**: Input the URL or text content you want to shorten in the text box
3. **Custom Short Code**: Optionally choose a custom short link suffix, leave blank for auto-generation
4. **Generate Short Link**: Click the generate button to get your short link
5. **Access Short Link**: 
   - If the original content is a URL, it will automatically redirect
   - If it's text content, it will be displayed on a beautiful page

## Custom Configuration

### Modify Domain

Update the domain configuration in \`wrangler.toml\`:

\`\`\`toml
[vars]
DOMAIN = "your-custom-domain.com"
\`\`\`

### Adjust Short Code Length

Modify the default length parameter of the \`generateShortCode\` function in \`src/index.js\`.

## Free Tier Limits

Cloudflare free plan includes:
- **Workers**: 100,000 requests per day
- **KV Storage**: 100,000 read operations, 1,000 write operations
- **Storage Space**: 1GB

This is completely sufficient for personal use.

## Notes

- Short codes are case-sensitive
- Custom short codes cannot conflict with system routes (like \`api\`)
- It's recommended to regularly backup important short link data
- For production environments, it's recommended to bind a custom domain

## License

MIT License