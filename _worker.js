export default {
  async fetch(request) {
    const url = new URL(request.url);
    const domain = url.hostname === 't.bibica.net' ? 't.me' : 'telegram.org';
    const targetUrl = `https://${domain}${url.pathname}${url.search}`;

    // Clone request headers và sửa Host header
    const headers = new Headers(request.headers);
    headers.set('Host', domain);
    headers.delete('Referer');

    const response = await fetch(targetUrl, {
      headers: headers,
      redirect: 'follow'
    });

    // Nếu là HTML thì sửa lại các link tài nguyên
    if (response.headers.get('content-type')?.includes('text/html')) {
      let html = await response.text();
      
      // Thay thế tất cả link tài nguyên
      html = html.replace(/(https?:)?\/\/(t\.me|telegram\.org)/g, 'https://t.bibica.net');
      
      // Clone response và sửa headers
      const modifiedResponse = new Response(html, response);
      
      // Sửa CSP header để cho phép load từ domain của bạn
      const csp = modifiedResponse.headers.get('content-security-policy') || '';
      modifiedResponse.headers.set(
        'content-security-policy', 
        csp.replace(/t\.me|telegram\.org/g, 't.bibica.net')
      );
      
      return modifiedResponse;
    }

    // Với các file tĩnh (CSS, JS...) thì trả về trực tiếp
    return response;
  }
};
