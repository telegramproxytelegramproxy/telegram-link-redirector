// File: worker.js
export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const path = url.pathname
    const userAgent = request.headers.get('user-agent') || ''
    const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(userAgent)

    // Handle Telegram paths
    if (path.startsWith('/@') || path.startsWith('/join') || path.startsWith('/s/')) {
      const target = isMobile 
        ? `tg://${path.replace(/^\//, '')}` 
        : `https://t.me${path}`
      return Response.redirect(target, 302)
    }

    // Root response
    if (path === '/') {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <body>
          <h1>t.bibica.net Telegram Proxy</h1>
          <p>Try these links:</p>
          <ul>
            <li><a href="/@bibica_net">/@bibica_net</a></li>
            <li><a href="/joinchat/EXAMPLE">/joinchat/EXAMPLE</a></li>
          </ul>
        </body>
        </html>
      `, { headers: { 'Content-Type': 'text/html' } })
    }

    return new Response('Not Found', { status: 404 })
  }
}
