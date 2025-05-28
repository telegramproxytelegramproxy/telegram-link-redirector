export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname.slice(1); // Bỏ "/" ở đầu (ví dụ: "duck_group")
    const userAgent = request.headers.get('User-Agent') || '';
    const isMobile = /Android|iPhone|iPad|iPod/i.test(userAgent);

    // 1. Xử lý truy cập trang chủ (không có path)
    if (!path) {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <body>
          <h1>Welcome to Telegram Gateway</h1>
          <p>Try <a href="/duck_group">/duck_group</a> or <a href="/duck_bot?start=123">/duck_bot?start=123</a></p>
        </body>
        </html>
      `, { headers: { 'Content-Type': 'text/html' } });
    }

    // 2. Ưu tiên mở app Telegram nếu là mobile
    if (isMobile) {
      const tgUri = `tg://resolve?domain=${path}`;
      return Response.redirect(tgUri, 302);
    }

    // 3. Proxy nội dung từ telegram.org cho desktop
    const proxyUrl = `https://telegram.org/${path}${url.search}`;
    try {
      const response = await fetch(proxyUrl, {
        headers: { 'Host': 'telegram.org' },
        redirect: 'follow'
      });

      // Rewrite tất cả links để giữ nguyên domain t.bibica.net
      if (response.headers.get('Content-Type')?.includes('text/html')) {
        let html = await response.text();
        html = html.replace(/(https?:\/\/)(telegram\.org|t\.me)/g, 'https://t.bibica.net');
        return new Response(html, { 
          headers: { 'Content-Type': 'text/html' } 
        });
      }
      return response;
    } catch (error) {
      return new Response(`Proxy failed. <a href="tg://resolve?domain=${path}">Open in Telegram App</a>`, {
        status: 502,
        headers: { 'Content-Type': 'text/html' }
      });
    }
  }
};
