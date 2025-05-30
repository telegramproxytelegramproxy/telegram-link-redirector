export default {
  async fetch(request) {
    const url = new URL(request.url);
    const HOMEPAGE = 'https://bibica.net/giai-quyet-telegram-bi-nha-mang-viet-nam-chan-bang-mtproto-socks5-proton-vpn/';
    const TELEGRAM_DOMAIN = 't.me';

    // 1. Xử lý yêu cầu đến trang chủ
    if (url.hostname === 't.bibica.net' && (url.pathname === '/' || url.pathname === '')) {
      return Response.redirect(HOMEPAGE, 301);
    }

    // 2. Proxy tất cả các request đến Telegram
    const targetUrl = `https://${TELEGRAM_DOMAIN}${url.pathname}${url.search}`;

    try {
      // 3. Gửi request đến Telegram với timeout
      const response = await fetch(targetUrl, {
        headers: { 'Host': TELEGRAM_DOMAIN },
        redirect: 'manual', // Xử lý chuyển hướng thủ công
        timeout: 5000
      });

      // 4. Phát hiện và xử lý chuyển hướng
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get('location');
        if (location && location.includes(TELEGRAM_DOMAIN)) {
          // Chặn chuyển hướng về Telegram
          return Response.redirect(HOMEPAGE, 302);
        }
        // Cho phép chuyển hướng khác
        return Response.redirect(location, response.status);
      }

      // 5. Kiểm tra nếu nội dung là trang chủ Telegram
      const finalUrl = new URL(response.url);
      if (finalUrl.hostname === TELEGRAM_DOMAIN && 
          (finalUrl.pathname === '/' || finalUrl.pathname === '')) {
        return Response.redirect(HOMEPAGE, 302);
      }

      // 6. Xử lý nội dung HTML
      if (response.headers.get('content-type')?.includes('text/html')) {
        let html = await response.text();
        
        // Thay thế tất cả link Telegram thành link của bạn
        html = html.replace(
          new RegExp(`(https?:)?//(${TELEGRAM_DOMAIN}|telegram\\.org)(/[^\\s"'<>]*)`, 'g'),
          'https://t.bibica.net$3'
        );
        
        // Sửa CSP header để cho phép thay thế nội dung
        const modifiedResponse = new Response(html, response);
        modifiedResponse.headers.set('content-security-policy', "default-src 'self' https://t.bibica.net https://t.me");
        return modifiedResponse;
      }

      // 7. Trả về response nguyên bản cho các loại nội dung khác
      return response;
    } catch (error) {
      // Xử lý lỗi timeout hoặc lỗi mạng
      return Response.redirect(HOMEPAGE, 302);
    }
  }
};
