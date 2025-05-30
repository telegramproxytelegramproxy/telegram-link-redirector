export default {
  async fetch(request) {
    const url = new URL(request.url);
    const domain = url.hostname === 't.bibica.net' ? 't.me' : 'telegram.org';
    const targetUrl = `https://${domain}${url.pathname}${url.search}`;

    // Clone headers và chỉnh sửa
    const headers = new Headers(request.headers);
    headers.set('Host', domain);
    headers.delete('Referer'); // Telegram không thích Referer

    // Gửi request đến Telegram server
    const response = await fetch(targetUrl, {
      headers: headers,
      redirect: 'follow'
    });

    // Nếu là HTML, thay thế các link Telegram
    if (response.headers.get('content-type')?.includes('text/html')) {
      let html = await response.text();
      
      // Thay thế tất cả t.me/... và tg://... thành t.bibica.net/...
      html = html.replace(
        /(https?:)?\/\/(t\.me)(\/[a-zA-Z0-9_\-?=&@#]+)?/g, 
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
    
    // Nếu không phải HTML (JS/CSS/img/font/API...), trả về nguyên gốc
    return response;
  }
};
