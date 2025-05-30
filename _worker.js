export default {
  async fetch(request) {
    const url = new URL(request.url);
    const domain = url.hostname === 't.bibica.net' ? 't.me' : 'telegram.org';
    const targetUrl = `https://${domain}${url.pathname}${url.search}`;

    const headers = new Headers(request.headers);
    headers.set('Host', domain);
    headers.delete('Referer');

    const response = await fetch(targetUrl, {
      headers: headers,
      redirect: 'follow'
    });

    if (response.headers.get('content-type')?.includes('text/html')) {
      let html = await response.text();
      
      // Thay thế tất cả các liên kết tg:// thành https://t.bibica.net/
      html = html.replace(/tg:\/\/([a-zA-Z0-9_\-?=&]+)/g, 'https://t.bibica.net/$1');
      
      // Thay thế tất cả các liên kết t.me/ thành https://t.bibica.net/
      html = html.replace(/(https?:)?\/\/t\.me\/([a-zA-Z0-9_\/\-?=&]+)/g, 'https://t.bibica.net/$2');
      
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
