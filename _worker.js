export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (url.pathname === '/' || !url.pathname) {
      return new Response(`
        <h1>Bibica Telegram Proxy</h1>
        <p>Dùng link dạng: <code>t.bibica.net/username</code></p>
        <p>Ví dụ: <a href="https://t.bibica.net/bibica_net">t.bibica.net/bibica_net</a></p>
      `, { headers: { 'Content-Type': 'text/html' } });
    }

    url.hostname = 't.me';
    url.protocol = 'https:';

    const modifiedRequest = new Request(url, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: 'follow'
    });

    try {
      const response = await fetch(modifiedRequest);
      
      // Fix CORS nếu cần
      const modifiedResponse = new Response(response.body, response);
      modifiedResponse.headers.set('Access-Control-Allow-Origin', '*');
      
      return modifiedResponse;
    } catch (error) {
      return new Response(`Lỗi proxy: ${error.message}`, { status: 500 });
    }
  }
};
