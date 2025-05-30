export default {
  async fetch(request) {
    const url = new URL(request.url);
    const HOMEPAGE = 'https://bibica.net/giai-quyet-telegram-bi-nha-mang-viet-nam-chan-bang-mtproto-socks5-proton-vpn/';
    const TELEGRAM_HOMEPAGE = 'https://t.me/';

    // 1. Xử lý yêu cầu đến trang chủ của chúng ta
    if (url.hostname === 't.bibica.net' && (url.pathname === '/' || url.pathname === '')) {
      return Response.redirect(HOMEPAGE, 301);
    }

    // 2. Tạo URL đích trên Telegram
    const targetUrl = `https://t.me${url.pathname}${url.search}`;

    try {
      // 3. Gửi request đến Telegram
      const response = await fetch(targetUrl, {
        headers: { 'Host': 't.me' },
        redirect: 'manual', // Tự xử lý chuyển hướng
        timeout: 5000
      });

      // 4. Xử lý các response chuyển hướng (3xx)
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get('location');
        
        // Nếu chuyển hướng về trang chủ Telegram thì chặn
        if (location && (location === TELEGRAM_HOMEPAGE || location === 'https://t.me')) {
          return Response.redirect(HOMEPAGE, 302);
        }
        
        // Cho phép tất cả các chuyển hướng khác
        if (location) {
          return Response.redirect(location, response.status);
        }
      }

      // 5. Kiểm tra nếu nội dung là trang chủ Telegram
      if (response.url === TELEGRAM_HOMEPAGE && response.status === 200) {
        return Response.redirect(HOMEPAGE, 302);
      }

      // 6. Xử lý nội dung HTML (thay thẻ link)
      if (response.headers.get('content-type')?.includes('text/html')) {
        let html = await response.text();
        
        html = html.replace(
          /(https?:)?\/\/(t\.me|telegram\.org)(\/[^\s"'<>]*)/g, 
          'https://t.bibica.net$3'
        );
        
        const modifiedResponse = new Response(html, response);
        modifiedResponse.headers.delete('content-security-policy');
        return modifiedResponse;
      }

      // 7. Trả về response nguyên bản cho mọi trường hợp khác
      return response;

    } catch (error) {
      // Xử lý lỗi timeout hoặc lỗi mạng
      return Response.redirect(HOMEPAGE, 302);
    }
  }
};
