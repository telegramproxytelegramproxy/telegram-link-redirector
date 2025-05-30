export default {
  async fetch(request) {
    const url = new URL(request.url);
    const domain = url.hostname === 't.bibica.net' ? 't.me' : 'telegram.org';
    const targetUrl = `https://${domain}${url.pathname}${url.search}`;

    const headers = new Headers(request.headers);
    headers.set('Host', domain);
    headers.delete('Referer'); // Telegram thường chặn Referer

    const response = await fetch(targetUrl, {
      headers: headers,
      redirect: 'follow',
      cf: { cacheEverything: false } // Tắt cache để tránh lỗi động
    });

    if (response.headers.get('content-type')?.includes('text/html')) {
      let html = await response.text();
      
      // Chỉ thay thế các link Telegram (t.me/... hoặc tg://...)
      html = html.replace(
        /(https?:)?\/\/(t\.me)(\/[a-zA-Z0-9_\-?=&]+)?/g, 
        'https://t.bibica.net$3'
      );
      html = html.replace(
        /tg:\/\/([a-zA-Z0-9_\-?=&]+)/g, 
        'https://t.bibica.net/$1'
      );

      const modifiedResponse = new Response(html, response);
      
      // Sửa CSP để tránh bị chặn
      const csp = modifiedResponse.headers.get('content-security-policy') || '';
      modifiedResponse.headers.set(
        'content-security-policy', 
        csp.replace(/t\.me|telegram\.org/g, 't.bibica.net')
      );
      
      return modifiedResponse;
    }
    
    return response;
  }
};
