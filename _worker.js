export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname.slice(1);
    
    const isMobile = /Mobile|Android|iPhone/i.test(request.headers.get('user-agent') || '');
    const canOpenApp = request.headers.get('accept')?.includes('text/html');
    
    if (isMobile && canOpenApp) {
      const tgUrl = path.startsWith('+') 
        ? `tg://join?invite=${path.slice(1)}` 
        : `tg://resolve?domain=${path.replace(/^@/, '')}`;
      
      return new Response(`
        <!DOCTYPE html>
        <script>
          window.location.href = '${tgUrl}';
          setTimeout(() => {
            window.location.href = 'https://t.me/${path}';
          }, 500);
        </script>
        <a href="${tgUrl}">Mở Telegram App</a>
      `, { headers: { 'content-type': 'text/html' } });
    }
    
    url.hostname = 't.me';
    return fetch(new Request(url, request));
  }
};
