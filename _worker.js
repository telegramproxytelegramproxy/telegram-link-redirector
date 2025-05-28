export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // 1. Xác định URL đích (ưu tiên t.me trước)
    let targetUrl;
    if (url.pathname === '/' || url.pathname.startsWith('/blog') || url.pathname.startsWith('/apps')) {
      targetUrl = `https://telegram.org${url.pathname}${url.search}`;
    } else {
      targetUrl = `https://t.me${url.pathname}${url.search}`;
    }

    // 2. Proxy request và giữ nguyên mọi thứ
    const response = await fetch(targetUrl, {
      headers: request.headers,
      redirect: 'follow'
    });

    // 3. Clone response để sửa header
    const newResponse = new Response(response.body, response);

    // 4. Sửa lại Content-Security-Policy nếu có
    const csp = newResponse.headers.get('Content-Security-Policy');
    if (csp) {
      newResponse.headers.set(
        'Content-Security-Policy', 
        csp.replace(/t\.me|telegram\.org/g, 't.bibica.net')
      );
    }

    return newResponse;
  }
};
