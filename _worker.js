// Cloudflare Worker script for t.bibica.net proxy (supports both t.me and tg://)
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const path = url.pathname
  const userAgent = request.headers.get('user-agent') || ''
  const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(userAgent)

  // Handle Telegram paths:
  // 1. /@username → t.me/@username
  // 2. /joinchat/invitecode → t.me/joinchat/invitecode
  // 3. /s/secretpath → t.me/s/secretpath
  if (path.startsWith('/@') || path.startsWith('/join') || path.startsWith('/s/')) {
    // Mobile devices: redirect to tg://
    if (isMobile) {
      const tgPath = path.replace(/^\//, '')
      return Response.redirect(`tg://${tgPath}`, 302)
    }
    // Desktop: redirect to t.me
    return Response.redirect(`https://t.me${path}`, 302)
  }

  // Handle direct tg:// links (e.g. t.bibica.net/tg/resolve?domain=xxx)
  if (path.startsWith('/tg/')) {
    const tgPath = path.replace('/tg/', '')
    return Response.redirect(`tg://${tgPath}`, 302)
  }

  // Handle root domain - custom welcome page
  if (path === '/') {
    return new Response(`
      <html>
        <head>
          <title>t.bibica.net - Telegram Proxy</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body>
          <h1>Welcome to t.bibica.net</h1>
          <p>This service proxies Telegram links. Examples:</p>
          <ul>
            <li><a href="/@bibica_net">t.bibica.net/@bibica_net</a> → t.me/@bibica_net</li>
            <li><a href="/joinchat/ABCDEF">t.bibica.net/joinchat/ABCDEF</a> → t.me/joinchat/ABCDEF</li>
          </ul>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    })
  }

  // Default 404 response
  return new Response('Not Found', { 
    status: 404,
    headers: { 'Content-Type': 'text/plain' }
  })
}
