export default {
  async fetch(request) {
    const url = new URL(request.url);
    const HOMEPAGE = 'https://bibica.net/giai-quyet-telegram-bi-nha-mang-viet-nam-chan-bang-mtproto-socks5-proton-vpn/';

    // 1. Xử lý trang chủ
    if (url.hostname === 't.bibica.net' && (url.pathname === '/' || url.pathname === '')) {
      return Response.redirect(HOMEPAGE, 301);
    }

    // 2. Chặn hoàn toàn các link /dl?
    if (url.pathname === '/dl') {
      return Response.redirect(HOMEPAGE, 302);
    }

    // 3. Kiểm tra và chặn các link proxy/socks không hợp lệ
    if (url.pathname.startsWith('/socks') || url.pathname.startsWith('/proxy')) {
      const proxyParam = url.searchParams.get('server') || url.searchParams.get('host');
      
      if (proxyParam) {
        const proxyRegex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?):([1-9][0-9]{0,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/;
        
        if (!proxyRegex.test(proxyParam)) {
          return Response.redirect(HOMEPAGE, 302);
        }
      }
    }

    // 4. Tự động chuẩn hóa URL
    let path = url.pathname;
    let query = url.search;

    // Xử lý các trường hợp đặc biệt
    if (path === '/resolve' && url.searchParams.has('domain')) {
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

    // 5. Kiểm tra username Telegram hợp lệ
    const usernamePattern = /^\/([a-zA-Z0-9_]{5,32})(\/.*)?$/;
    const invitePattern = /^\/(\+|joinchat\/)([a-zA-Z0-9_-]{10,32})$/;
    const botPattern = /^\/(bot\d+[a-zA-Z0-9_]*)(\/.*)?$/;

    // Lấy phần username chính (loại bỏ query và các phần phụ)
    const mainPath = path.split('/')[1] || '';
    
    if (mainPath && 
        !usernamePattern.test(path) && 
        !invitePattern.test(path) && 
        !botPattern.test(path) &&
        !path.startsWith('/c/') && 
        !path.startsWith('/s/') &&
        !path.startsWith('/share/') &&
        !path.startsWith('/addstickers/') &&
        !path.startsWith('/addtheme/') &&
        !path.match(/^\/[a-z]{2}\//) && // Ngôn ngữ (ví dụ /en/)
        !path.match(/\.(html|php|js|css|jpg|png|gif|txt)$/i)) { // Các file tĩnh
      return Response.redirect(HOMEPAGE, 302);
    }

    const targetUrl = `https://t.me${path}${query}`;

    // 6. Kiểm tra response
    try {
      const response = await fetch(targetUrl, {
        headers: { 'Host': 't.me' },
        redirect: 'follow',
        timeout: 3000
      });

      // Phát hiện link không tồn tại hoặc chuyển hướng về trang chủ Telegram
      if (response.url.endsWith('t.me/') || response.status === 404) {
        return Response.redirect(HOMEPAGE, 302);
      }

      // 7. Xử lý nội dung HTML
      if (response.headers.get('content-type')?.includes('text/html')) {
        let html = await response.text();
        
        // Thay thế link Telegram
        html = html.replace(
          /(https?:)?\/\/(t\.me|telegram\.org)(\/[^\s"'<>]*)/g, 
          'https://t.bibica.net$3'
        );
        
        // Sửa CSP header
        const modifiedResponse = new Response(html, response);
        modifiedResponse.headers.set('content-security-policy', '');
        return modifiedResponse;
      }

      return response;
    } catch {
      return Response.redirect(HOMEPAGE, 302);
    }
  }
};
