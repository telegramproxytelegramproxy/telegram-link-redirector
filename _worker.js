export default {
  async fetch(request) {
    const url = new URL(request.url);
    const baseDomain = 't.bibica.net';
    
    // Danh sách các path đặc biệt cần xử lý riêng
    const specialPaths = {
      '/web': { target: 'web.telegram.org', path: '/' },
      '/dl/web': { target: 'web.telegram.org', path: '/' },
      '/blog': { target: 'telegram.org', path: '/blog' },
      '/faq': { target: 'telegram.org', path: '/faq' },
      '/file': { target: 'telegram.org', path: '/file' },
      '/mtproto': { target: 'core.telegram.org', path: '/mtproto' },
      '/schema': { target: 'core.telegram.org', path: '/schema' }
    };
    
    // Xác định target domain và path gốc
    let targetDomain = 'telegram.org';
    let originalPath = url.pathname;
    
    // Kiểm tra các path đặc biệt
    for (const [pathPrefix, config] of Object.entries(specialPaths)) {
      if (url.pathname.startsWith(pathPrefix)) {
        targetDomain = config.target;
        originalPath = config.path + url.pathname.slice(pathPrefix.length);
        break;
      }
    }
    
    // Nếu không phải path đặc biệt, xử lý theo subdomain
    if (targetDomain === 'telegram.org' && url.pathname.split('/').length > 1) {
      const potentialSubdomain = url.pathname.split('/')[1];
      if (potentialSubdomain) {
        targetDomain = `${potentialSubdomain}.telegram.org`;
        originalPath = url.pathname.slice(potentialSubdomain.length + 1) || '/';
      }
    }
    
    // Xử lý t.me
    if (url.hostname === baseDomain && url.pathname.startsWith('/t/')) {
      targetDomain = 't.me';
      originalPath = url.pathname.slice(2); // Giữ lại '/' sau 't'
    }
    
    // Xây dựng target URL
    const targetUrl = `https://${targetDomain}${originalPath}${url.search}`;
    
    // Sửa đổi headers
    const headers = new Headers(request.headers);
    headers.set('Host', targetDomain);
    headers.delete('Referer');
    
    // Fetch response từ Telegram
    const response = await fetch(targetUrl, {
      headers: headers,
      redirect: 'follow'
    });
    
    // Hàm thay thế URL tổng quát
    const replaceUrls = (text) => {
      return text
        // Thay thế các subdomain.telegram.org
        .replace(/(https?:)?\/\/([a-zA-Z0-9.-]+\.)?telegram\.org(\/[a-zA-Z0-9._~%-]*)*/g, (match, p1, p2, p3) => {
          const protocol = p1 || 'https:';
          const subdomain = p2 ? p2.slice(0, -1) : '';
          const path = p3 || '';
          
          // Xử lý các trường hợp đặc biệt
          if (path.startsWith('/dl/web')) return `${protocol}//${baseDomain}/web${path.slice(6)}`;
          if (path.startsWith('/dl/')) return `${protocol}//${baseDomain}/dl${path.slice(3)}`;
          if (path.startsWith('/blog')) return `${protocol}//${baseDomain}/blog${path.slice(5)}`;
          if (path.startsWith('/faq')) return `${protocol}//${baseDomain}/faq${path.slice(3)}`;
          if (path.startsWith('/file')) return `${protocol}//${baseDomain}/file${path.slice(5)}`;
          
          // Trường hợp chung
          if (subdomain === 'web') return `${protocol}//${baseDomain}/web${path}`;
          if (subdomain) return `${protocol}//${baseDomain}/${subdomain}${path}`;
          return `${protocol}//${baseDomain}${path}`;
        })
        // Thay thế t.me
        .replace(/(https?:)?\/\/t\.me/g, 'https://t.bibica.net/t');
    };
    
    // Xử lý HTML response
    if (response.headers.get('content-type')?.includes('text/html')) {
      let html = await response.text();
      html = replaceUrls(html);
      
      // Tạo response đã sửa đổi
      const modifiedResponse = new Response(html, response);
      
      // Sửa đổi CSP header
      const csp = modifiedResponse.headers.get('content-security-policy') || '';
      modifiedResponse.headers.set(
        'content-security-policy',
        csp.replace(/([a-zA-Z0-9.-]+\.)?telegram\.org/g, (match, p1) => {
          if (p1 === 'web.') return `${baseDomain}/web`;
          if (p1) return `${baseDomain}/${p1.slice(0, -1)}`;
          return baseDomain;
        })
        .replace(/t\.me/g, `${baseDomain}/t`)
      );
      
      return modifiedResponse;
    }
    
    // Xử lý redirects
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location');
      if (location && (location.includes('telegram.org') || location.includes('t.me'))) {
        const newLocation = replaceUrls(location);
        const newHeaders = new Headers(response.headers);
        newHeaders.set('location', newLocation);
        return new Response(response.body, {
          status: response.status,
          headers: newHeaders
        });
      }
    }
    
    // Trả về response nguyên bản cho các loại nội dung khác (ảnh, css, js,...)
    return response;
  }
};
