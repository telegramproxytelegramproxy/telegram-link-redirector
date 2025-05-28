export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname; // Giữ nguyên cả "/@username"
    const isMobile = /Android|iPhone|iPad|iPod/i.test(request.headers.get('User-Agent') || '');

    // 1. Xác định URL đích
    let targetUrl;
    if (path.startsWith('/@')) {
      // Xử lý link dạng @username
      targetUrl = `https://t.me${path}${url.search}`;
    } else if (path === '/' || path.startsWith('/blog') || path.startsWith('/apps')) {
      targetUrl = `https://telegram.org${path}${url.search}`;
    } else {
      targetUrl = `https://t.me${path}${url.search}`;
    }

    // 2. Xử lý cho mobile (ưu tiên mở app)
    if (isMobile && path.startsWith('/@')) {
      const username = path.slice(2); // Bỏ "/@" để lấy "username"
      return Response.redirect(`tg://resolve?domain=${username}${url.search.replace('?', '&')}`, 302);
    }

    // 3. Proxy nội dung
    const response = await fetch(targetUrl, {
      headers: {
        'Host': new URL(targetUrl).hostname,
        'User-Agent': request.headers.get('User-Agent') || ''
      },
      redirect: 'follow'
    });

    // 4. Sửa nội dung HTML (nếu cần)
    if (response.headers.get('content-type')?.includes('text/html')) {
      let html = await response.text();
      html = html.replace(/(https?:)?\/\/(t\.me|telegram\.org)/g, 'https://t.bibica.net');
      
      const modifiedResponse = new Response(html, response);
      modifiedResponse.headers.set('Cache-Control', 'public, max-age=3600');
      return modifiedResponse;
    }

    return response;
  }
};
