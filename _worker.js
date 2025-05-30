export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // Xử lý các deep link đặc biệt (dl?tme=...)
    if (url.pathname === '/dl' && url.searchParams.has('tme')) {
      return Response.redirect(`tg://t.me?tme=${url.searchParams.get('tme')}`, 302);
    }

    // Xử lý các link thông thường
    const path = url.pathname.startsWith('/@') 
      ? url.pathname.replace('/@', '/') 
      : url.pathname;

    const targetUrl = `https://t.me${path}${url.search}`;
    
    try {
      const response = await fetch(targetUrl, {
        headers: { 'Host': 't.me' },
        redirect: 'manual' // Không tự động redirect
      });

      // Nếu là redirect (302) -> chuyển thẳng sang app
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get('location');
        if (location?.includes('t.me')) {
          return Response.redirect(location.replace('https://t.me', 'tg://t.me'), 302);
        }
      }

      // Nếu nội dung HTML -> chuyển sang app
      if (response.headers.get('content-type')?.includes('text/html')) {
        return Response.redirect(`tg://t.me${path}${url.search}`, 302);
      }

      return response;
    } catch {
      // Mặc định mở app khi có lỗi
      return Response.redirect(`tg://t.me${path}${url.search}`, 302);
    }
  }
};
