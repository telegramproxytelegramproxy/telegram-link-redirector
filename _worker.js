export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // Xử lý chuyển hướng trang chủ (cả t.bibica.net và t.bibica.net/)
    if (url.hostname === 't.bibica.net' && (url.pathname === '/' || url.pathname === '')) {
      return Response.redirect(
        'https://bibica.net/giai-quyet-telegram-bi-nha-mang-viet-nam-chan-bang-mtproto-socks5-proton-vpn/',
        301 // Redirect vĩnh viễn
      );
    }

    const targetDomain = url.hostname === 't.bibica.net' ? 't.me' : 'telegram.org';
    let targetPath = url.pathname;

    // Xử lý bỏ @ nếu có trong URL (ví dụ: /@username → /username)
    if (url.hostname === 't.bibica.net' && targetPath.startsWith('/@')) {
      targetPath = targetPath.replace(/^\/@/, '/');
    }

    const targetUrl = `https://${targetDomain}${targetPath}${url.search}`;

    // Clone headers và chỉnh sửa
    const headers = new Headers(request.headers);
    headers.set('Host', targetDomain);
    headers.delete('Referer');

    const response = await fetch(targetUrl, {
      headers: headers,
      redirect: 'follow'
    });

    // Nếu là HTML, thay thế tất cả liên kết Telegram
    if (response.headers.get('content-type')?.includes('text/html')) {
      let html = await response.text();
      
      // Thay thế t.me/@username → t.bibica.net/username (bỏ @)
      html = html.replace(
        /(https?:)?\/\/(t\.me)\/@([a-zA-Z0-9_\-]+)/g, 
        'https://t.bibica.net/$3'
      );
      
      // Thay thế các link Telegram khác (không có @)
      html = html.replace(
        /(https?:)?\/\/(t\.me|telegram\.org)(\/[a-zA-Z0-9_\-?=&@#\.\/]+)/g, 
        'https://t.bibica.net$3'
      );
      
      // Thay thế tg:// thành https://t.bibica.net/
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

    // Nếu là CSS/JS/IMG/Font... trả về nguyên bản (đã proxy qua Worker)
    return response;
  }
};
