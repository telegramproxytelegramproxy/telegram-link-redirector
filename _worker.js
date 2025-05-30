export default {
  async fetch(request) {
    const url = new URL(request.url);
    const HOMEPAGE = 'https://bibica.net/giai-quyet-telegram-bi-nha-mang-viet-nam-chan-bang-mtproto-socks5-proton-vpn/';
    const TELEGRAM_DOMAIN = 't.me';
    const TELEGRAM_CDN_DOMAINS = [
      'cdn1.cdn-telegram.org',
      'cdn2.cdn-telegram.org', 
      'cdn3.cdn-telegram.org',
      'cdn4.cdn-telegram.org',
      'cdn5.cdn-telegram.org'
    ];

    // 1. Xử lý trang chủ
    if (url.hostname === 't.bibica.net' && (url.pathname === '/' || url.pathname === '')) {
      return Response.redirect(HOMEPAGE, 301);
    }

    // 2. Xử lý các request đến CDN Telegram
    if (TELEGRAM_CDN_DOMAINS.includes(url.hostname)) {
      const cdnUrl = `https://${url.hostname}${url.pathname}`;
      return fetch(cdnUrl, {
        headers: {
          'Referer': 'https://t.me/',
          'Origin': 'https://t.me'
        },
        redirect: 'follow'
      });
    }

    // 3. Proxy request đến Telegram
    const targetUrl = `https://${TELEGRAM_DOMAIN}${url.pathname}${url.search}`;

    try {
      const response = await fetch(targetUrl, {
        headers: { 'Host': TELEGRAM_DOMAIN },
        redirect: 'manual',
        timeout: 5000
      });

      // 4. Xử lý chuyển hướng
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get('location');
        if (location) {
          // Cho phép chuyển hướng đến CDN Telegram
          if (TELEGRAM_CDN_DOMAINS.some(domain => location.includes(domain))) {
            return Response.redirect(location, response.status);
          }
          // Chặn chuyển hướng về trang chủ Telegram
          if (location.includes(TELEGRAM_DOMAIN)) {
            return Response.redirect(HOMEPAGE, 302);
          }
          return Response.redirect(location, response.status);
        }
      }

      // 5. Kiểm tra trang chủ Telegram
      const finalUrl = new URL(response.url);
      if (finalUrl.hostname === TELEGRAM_DOMAIN && 
          (finalUrl.pathname === '/' || finalUrl.pathname === '')) {
        return Response.redirect(HOMEPAGE, 302);
      }

      // 6. Xử lý nội dung HTML
      if (response.headers.get('content-type')?.includes('text/html')) {
        let html = await response.text();
        
        // Thay thế link Telegram nhưng giữ nguyên link CDN
        html = html.replace(
          /(https?:)?\/\/(t\.me|telegram\.org)(\/[^\s"'<>]*)/g, 
          'https://t.bibica.net$3'
        );
        
        const modifiedResponse = new Response(html, response);
        modifiedResponse.headers.set('content-security-policy', "default-src 'self' https://t.bibica.net https://t.me *.cdn-telegram.org");
        return modifiedResponse;
      }

      return response;
    } catch (error) {
      return Response.redirect(HOMEPAGE, 302);
    }
  }
};
