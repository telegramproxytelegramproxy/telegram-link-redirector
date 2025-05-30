export default {
  async fetch(request) {
    const url = new URL(request.url);
    const HOMEPAGE = 'https://bibica.net/giai-quyet-telegram-bi-nha-mang-viet-nam-chan-bang-mtproto-socks5-proton-vpn/';

    // Xử lý trang chủ
    if (url.hostname === 't.bibica.net' && (url.pathname === '/' || url.pathname === '')) {
      return Response.redirect(HOMEPAGE, 301);
    }

    // Tự động chuẩn hóa URL
    let path = url.pathname;
    let query = url.search;

    // Xử lý các trường hợp đặc biệt
    if (path === '/resolve' && url.searchParams.has('domain')) {
      // Chuyển /resolve?domain=xxx thành /xxx
      path = `/${url.searchParams.get('domain')}`;
      query = '';
    } else if (path.startsWith('/joinchat/')) {
      path = `/+${path.split('/')[2]}`;
    } else if (path === '/join' && url.searchParams.has('invite')) {
      path = `/+${url.searchParams.get('invite')}`;
      query = '';
    } else if (path.startsWith('/@')) {
      path = path.replace('/@', '/');
    }

    const targetUrl = `https://t.me${path}${query}`;

    // Kiểm tra response
    const response = await fetch(targetUrl, {
      headers: {
        'Host': 't.me',
        'User-Agent': 'Mozilla/5.0'
      },
      redirect: 'follow'
    });

    // Phát hiện link không tồn tại
    if (response.url.endsWith('t.me/') || response.status === 404) {
      return Response.redirect(HOMEPAGE, 302);
    }

    // Xử lý nội dung HTML
    if (response.headers.get('content-type')?.includes('text/html')) {
      let html = await response.text();
      
      // Thay thế mọi link Telegram
      html = html.replace(
        /(https?:)?\/\/(t\.me|telegram\.org)(\/[a-zA-Z0-9_\-+?=&@#\.\/]*)/g, 
        'https://t.bibica.net$3'
      );
      html = html.replace(
        /tg:\/\/(resolve|socks|proxy|join|addstickers)\?([a-zA-Z0-9_\-+?=&@#]+)/g, 
        'https://t.bibica.net/$1?$2'
      );

      // Sửa CSP header
      const modifiedResponse = new Response(html, response);
      const csp = modifiedResponse.headers.get('content-security-policy') || '';
      modifiedResponse.headers.set(
        'content-security-policy', 
        csp.replace(/(t\.me|telegram\.org)/g, 't.bibica.net')
      );
      
      return modifiedResponse;
    }

    return response;
  }
};
