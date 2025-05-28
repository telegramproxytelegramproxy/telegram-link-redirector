export default {
  async fetch(request) {
    const url = new URL(request.url);
    const baseDomain = 't.bibica.net';
    
    // Tách path thành các phần
    const pathParts = url.pathname.split('/').filter(part => part.length > 0);
    
    // Xác định target domain và path gốc
    let targetDomain = 'telegram.org';
    let originalPath = url.pathname;
    
    // Nếu là request tới t.bibica.net/subdomain/... thì proxy tới subdomain.telegram.org/...
    if (pathParts.length > 0) {
      const potentialSubdomain = pathParts[0];
      
      // Danh sách các subdomain đặc biệt cần xử lý riêng
      const specialSubdomains = {
        'web': 'dl/web',  // t.bibica.net/web → telegram.org/dl/web
        'dl': 'dl'        // t.bibica.net/dl → telegram.org/dl
      };
      
      if (specialSubdomains[potentialSubdomain]) {
        // Xử lý các trường hợp đặc biệt
        targetDomain = 'telegram.org';
        originalPath = `/${specialSubdomains[potentialSubdomain]}${url.pathname.slice(potentialSubdomain.length + 1)}`;
      } else if (potentialSubdomain === 't') {
        // Xử lý t.me
        targetDomain = 't.me';
        originalPath = url.pathname.slice(3); // Bỏ '/t/' ở đầu
      } else {
        // Trường hợp chung: t.bibica.net/subdomain → subdomain.telegram.org
        targetDomain = `${potentialSubdomain}.telegram.org`;
        originalPath = url.pathname.slice(potentialSubdomain.length + 1) || '/';
      }
    } else {
      // Trường hợp truy cập root domain (t.bibica.net)
      targetDomain = 'telegram.org';
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
    
    // Xử lý HTML response
    if (response.headers.get('content-type')?.includes('text/html')) {
      let html = await response.text();
      
      // Hàm thay thế URL tổng quát
      html = html.replace(/(https?:)?\/\/([a-zA-Z0-9.-]+\.)?telegram\.org(\/[a-zA-Z0-9._~-]*)*/g, (match, p1, p2, p3) => {
        const protocol = p1 || 'https:';
        const subdomain = p2 ? p2.slice(0, -1) : ''; // Bỏ dấu chấm cuối
        const path = p3 || '';
        
        // Xử lý các trường hợp đặc biệt
        if (path.startsWith('/dl/web')) return `${protocol}//${baseDomain}/web${path.slice(6)}`;
        if (path.startsWith('/dl/')) return `${protocol}//${baseDomain}/dl${path.slice(3)}`;
        if (path.startsWith('/blog')) return `${protocol}//${baseDomain}/blog${path.slice(5)}`;
        
        // Trường hợp chung
        if (subdomain) return `${protocol}//${baseDomain}/${subdomain}${path}`;
        return `${protocol}//${baseDomain}${path}`;
      });
      
      // Thay thế t.me
      html = html.replace(/(https?:)?\/\/t\.me/g, 'https://t.bibica.net/t');
      
      // Tạo response đã sửa đổi
      const modifiedResponse = new Response(html, response);
      
      // Sửa đổi CSP header
      const csp = modifiedResponse.headers.get('content-security-policy') || '';
      modifiedResponse.headers.set(
        'content-security-policy',
        csp.replace(/([a-zA-Z0-9.-]+\.)?telegram\.org/g, (match, p1) => {
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
        const newLocation = location
          .replace(/https:\/\/([a-zA-Z0-9.-]+)\.telegram\.org(\/[a-zA-Z0-9._~-]*)*/g, (match, p1, p2) => {
            const path = p2 || '';
            if (p1 === 'telegram') return `https://${baseDomain}${path}`;
            return `https://${baseDomain}/${p1}${path}`;
          })
          .replace(/https:\/\/telegram\.org(\/(dl\/web))/, 'https://t.bibica.net/web')
          .replace(/https:\/\/telegram\.org(\/(dl\/[a-zA-Z0-9._~-]+))/, 'https://t.bibica.net/dl$2')
          .replace(/https:\/\/telegram\.org(\/blog[a-zA-Z0-9._~-]*)/, 'https://t.bibica.net/blog$1')
          .replace(/https:\/\/t\.me/, `https://${baseDomain}/t`);
        
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
