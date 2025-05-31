export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const HOMEPAGE = 'https://bibica.net/giai-quyet-telegram-bi-nha-mang-viet-nam-chan-bang-mtproto-socks5-proton-vpn/';
    const TELEGRAM_HOMEPAGE = 'https://t.me/';

    // 1. Xử lý yêu cầu đến trang chủ (không cache)
    if (url.hostname === 't.bibica.net' && !url.pathname.replace('/', '')) {
      return Response.redirect(HOMEPAGE, 301);
    }

    // 2. Tạo cache key (bao gồm cả Host header)
    const cacheKey = new Request(url.toString(), {
      headers: { 'Host': 't.me' },
      redirect: 'manual'
    });

    // 3. Kiểm tra cache trước
    let cachedResponse = await caches.default.match(cacheKey);
    if (cachedResponse) {
      console.log('✅ Cache HIT');
      return cachedResponse;
    }

    // 4. Không có cache -> xử lý như bình thường
    console.log('❌ Cache MISS');
    const targetUrl = `https://t.me${url.pathname}${url.search}`;

    try {
      const response = await fetch(targetUrl, {
        headers: { 'Host': 't.me' },
        redirect: 'manual'
      });

      // 5. Xử lý các response chuyển hướng (3xx)
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get('location');
        
        if (location && (location === TELEGRAM_HOMEPAGE || location === 'https://t.me')) {
          return Response.redirect(HOMEPAGE, 302);
        }
        
        if (location) {
          return Response.redirect(location, response.status);
        }
      }

      // 6. Chặn trang chủ Telegram
      if (response.url === TELEGRAM_HOMEPAGE && response.status === 200) {
        return Response.redirect(HOMEPAGE, 302);
      }

      // 7. Xử lý nội dung HTML (thay thẻ link)
      let finalResponse;
      if (response.headers.get('content-type')?.includes('text/html')) {
        let html = await response.text();
        html = html.replace(
          /(https?:)?\/\/(t\.me|telegram\.org)(\/[^\s"'<>]*)/g, 
          'https://t.bibica.net$3'
        );
        
        finalResponse = new Response(html, response);
        finalResponse.headers.delete('content-security-policy');
      } else {
        finalResponse = new Response(response.body, response);
      }

      // 8. Thiết lập cache cho response (1 giờ)
      finalResponse.headers.set('Cache-Control', 'public, max-age=3600');
      
      // 9. Lưu vào cache (không chờ hoàn tất)
      ctx.waitUntil(caches.default.put(cacheKey, finalResponse.clone()));

      return finalResponse;

    } catch (error) {
      console.error('⚠️ Error:', error);
      return Response.redirect(HOMEPAGE, 302);
    }
  }
}
