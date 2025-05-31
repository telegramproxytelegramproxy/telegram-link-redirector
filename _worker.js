export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const HOMEPAGE = 'https://bibica.net/giai-quyet-telegram-bi-nha-mang-viet-nam-chan-bang-mtproto-socks5-proton-vpn/';
    const TELEGRAM_HOMEPAGE = 'https://t.me/';
    const CACHE_TTL = 86400; // Cache trong 24 giờ

    // 1. Xử lý yêu cầu đến trang chủ (không cache)
    if (url.hostname === 't.bibica.net' && (url.pathname === '/' || url.pathname === '')) {
      return Response.redirect(HOMEPAGE, 301);
    }

    // 2. Tạo cache key
    const cacheKey = new Request(url.toString(), {
      headers: { 
        'Host': 't.me',
        'Accept': request.headers.get('Accept') || 'text/html'
      },
      redirect: 'manual'
    });

    // 3. Kiểm tra cache trước
    const cache = caches.default;
    let response = await cache.match(cacheKey);
    
    if (response) {
      console.log('Cache HIT for:', url.pathname);
      return response;
    }

    console.log('Cache MISS for:', url.pathname);

    try {
      // 4. Không có cache -> gửi request đến Telegram
      const targetUrl = `https://t.me${url.pathname}${url.search}`;
      response = await fetch(targetUrl, {
        headers: { 'Host': 't.me' },
        redirect: 'manual',
        cf: {
          cacheEverything: true,
          cacheTtl: CACHE_TTL
        }
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

      // 6. Kiểm tra nếu nội dung là trang chủ Telegram
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

      // 8. Thiết lập cache và lưu response
      finalResponse.headers.set('Cache-Control', `public, max-age=${CACHE_TTL}`);
      finalResponse.headers.delete('set-cookie'); // Loại bỏ cookie để cache được
      
      ctx.waitUntil(cache.put(cacheKey, finalResponse.clone()));

      return finalResponse;

    } catch (error) {
      console.error('Error:', error);
      return Response.redirect(HOMEPAGE, 302);
    }
  }
};
