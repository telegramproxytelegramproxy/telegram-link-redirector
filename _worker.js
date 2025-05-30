export default {
  async fetch(request) {
    const url = new URL(request.url);
    const targetDomain = url.hostname === 't.bibica.net' ? 't.me' : 'telegram.org';
    const targetUrl = `https://${targetDomain}${url.pathname}${url.search}`;

    // Clone headers và chỉnh sửa
    const headers = new Headers(request.headers);
    headers.set('Host', targetDomain);
    headers.delete('Referer'); // Tránh bị Telegram chặn

    const response = await fetch(targetUrl, {
      headers: headers,
      redirect: 'follow'
    });

    // Nếu là HTML, thay thế tất cả liên kết Telegram
    if (response.headers.get('content-type')?.includes('text/html')) {
      let html = await response.text();
      
      // Thay thế t.me/... và telegram.org/... thành t.bibica.net/...
      html = html.replace(
        /(https?:)?\/\/(t\.me|telegram\.org)(\/[a-zA-Z0-9_\-?=&@#\.\/]+)/g, 
        'https://t.bibica.net$3'
      );
      html = html.replace(
        /tg:\/\/([a-zA-Z0-9_\-?=&@#]+)/g, 
        'https://t.bibica.net/$1'
      );

      // Sửa CSP để không chặn tài nguyên
      const modifiedResponse = new Response(html, response);
      const csp = modifiedResponse.headers.get('content-security-policy') || '';
      modifiedResponse.headers.set(
        'content-security-policy', 
        csp.replace(/(t\.me|telegram\.org)/g, 't.bibica.net')
      );
      
      return modifiedResponse;
    }

    // Nếu là CSS/JS/IMG/Font... trả về nguyên bản (đã proxy qua Worker)
    return response;
  }
};
