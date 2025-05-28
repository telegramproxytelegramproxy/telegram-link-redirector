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
      
      html = html.replace(/(https?:)?\/\/(t\.me|telegram\.org)/g, 'https://t.bibica.net');

      const modifiedResponse = new Response(html, response);

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
