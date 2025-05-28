export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const userAgent = request.headers.get('User-Agent') || '';
    const isMobile = /Android|iPhone|iPad|iPod/i.test(userAgent);

    // 1. Xác định URL đích (t.me hoặc telegram.org)
    let targetUrl;
    if (url.pathname === '/' || url.pathname.startsWith('/blog') || url.pathname.startsWith('/apps')) {
      targetUrl = `https://telegram.org${url.pathname}${url.search}`;
    } else {
      targetUrl = `https://t.me${url.pathname}${url.search}`;
    }

    // 2. Xử lý cho mobile: Ưu tiên mở app
    if (isMobile && !url.pathname.startsWith('/blog') && !url.pathname.startsWith('/apps')) {
      const path = url.pathname.slice(1);
      const tgUri = path.startsWith('+') && /^\+[0-9]+$/.test(path)
        ? `tg://resolve?phone=${path.slice(1)}`
        : path.startsWith('joinchat/') || path.startsWith('+')
          ? `tg://join?invite=${path.replace('joinchat/', '')}`
          : `tg://resolve?domain=${path}${url.search.replace('?', '&')}`;

      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta http-equiv="refresh" content="0; url=${tgUri}">
          <script>
            setTimeout(() => {
              window.location.href = "${targetUrl}";
            }, 800);
          </script>
        </head>
        <body>
          <p>Opening Telegram...</p>
        </body>
        </html>
      `, { headers: { 'Content-Type': 'text/html' } });
    }

    // 3. Proxy nội dung từ Telegram
    const proxyHeaders = new Headers(request.headers);
    proxyHeaders.set('Host', new URL(targetUrl).hostname);
    proxyHeaders.delete('Referer');

    try {
      const response = await fetch(targetUrl, {
        headers: proxyHeaders,
        redirect: 'follow'
      });

      // 4. Thay thế tất cả link Telegram thành domain của bạn
      if (response.headers.get('Content-Type')?.includes('text/html')) {
        let html = await response.text();
        html = html
          .replace(/https:\/\/t\.me/g, 'https://t.bibica.net')
          .replace(/https:\/\/telegram\.org/g, 'https://t.bibica.net')
          .replace(/href="\//g, 'href="/'); // Fix relative links

        return new Response(html, {
          headers: {
            'Content-Type': 'text/html',
            'Cache-Control': 'public, max-age=3600'
          }
        });
      }
      return response;
    } catch (error) {
      return new Response(`Proxy error: ${error.message}`, { status: 502 });
    }
  }
};
