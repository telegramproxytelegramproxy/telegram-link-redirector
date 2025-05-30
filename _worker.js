export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // Xử lý chuyển hướng trang chủ
    if (url.hostname === 't.bibica.net' && (url.pathname === '/' || url.pathname === '')) {
      return Response.redirect(
        'https://bibica.net/giai-quyet-telegram-bi-nha-mang-viet-nam-chan-bang-mtproto-socks5-proton-vpn/',
        301
      );
    }

    const targetDomain = url.hostname === 't.bibica.net' ? 't.me' : 'telegram.org';
    let targetPath = url.pathname;

    // Xử lý bỏ @ trong username
    if (url.hostname === 't.bibica.net' && targetPath.startsWith('/@')) {
      targetPath = targetPath.replace(/^\/@/, '/');
    }

    const targetUrl = `https://${targetDomain}${targetPath}${url.search}`;

    // Gửi request và kiểm tra response
    const response = await fetch(targetUrl, {
      headers: {
        'Host': targetDomain,
        'User-Agent': 'Mozilla/5.0'
      },
      redirect: 'follow'
    });

    // Phát hiện link không tồn tại (trả về trang chủ Telegram)
    if (response.url.endsWith('t.me/') || response.url.endsWith('telegram.org/')) {
      return Response.redirect(
        'https://bibica.net/giai-quyet-telegram-bi-nha-mang-viet-nam-chan-bang-mtproto-socks5-proton-vpn/',
        302
      );
    }

    // Xử lý nội dung HTML
    if (response.headers.get('content-type')?.includes('text/html')) {
      let html = await response.text();
      
      // Thay thế các link Telegram
      html = html.replace(
        /(https?:)?\/\/(t\.me)\/@?([a-zA-Z0-9_\-]+)/g, 
        'https://t.bibica.net/$3'
      );
      html = html.replace(
        /(https?:)?\/\/(telegram\.org)(\/[a-zA-Z0-9_\-?=&@#\.\/]+)/g, 
        'https://t.bibica.net$3'
      );
      html = html.replace(
        /tg:\/\/([a-zA-Z0-9_\-?=&@#]+)/g, 
        'https://t.bibica.net/$1'
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
