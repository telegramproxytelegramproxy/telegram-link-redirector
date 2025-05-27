export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname.slice(1);

    if (!path) {
      return Response.redirect(
        "https://bibica.net/giai-quyet-telegram-bi-nha-mang-viet-nam-chan-bang-mtproto-proxy-proton-vpn",
        301
      );
    }

    const cleaned = path.replace(/^@/, '');
    
    // Web proxy URL for when Telegram app is not available
    const webProxyUrl = `https://web.telegram.org/k/#${cleaned}`;
    
    // Alternative web proxy in case the main one is blocked
    const alternativeProxyUrl = `https://tgweb.vercel.app/#${cleaned}`;
    
    const tgUrl = cleaned.startsWith('+')
      ? `tg://join?invite=${cleaned.slice(1)}`
      : `tg://resolve?domain=${cleaned}`;

    // HTML with JavaScript to try Telegram app first, then fall back to web proxies
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting to Telegram...</title>
  <script>
    function isTelegramInstalled() {
      return new Promise(resolve => {
        const iframe = document.createElement('iframe');
        iframe.src = 'tg://';
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        
        setTimeout(() => {
          document.body.removeChild(iframe);
          resolve(false);
        }, 1000);
        
        window.addEventListener('blur', function handler() {
          window.removeEventListener('blur', handler);
          resolve(true);
        });
      });
    }
    
    async function redirect() {
      const isInstalled = await isTelegramInstalled();
      
      if (isInstalled) {
        window.location = '${tgUrl}';
      } else {
        // Try main web proxy first
        try {
          const response = await fetch('${webProxyUrl}', {method: 'HEAD', mode: 'no-cors'});
          window.location = '${webProxyUrl}';
        } catch (e) {
          // If main proxy is blocked, try alternative
          window.location = '${alternativeProxyUrl}';
        }
      }
    }
    
    // Start the redirect process
    redirect();
  </script>
  <noscript>
    <meta http-equiv="refresh" content="0;url=${webProxyUrl}">
  </noscript>
</head>
<body>
  <p>Redirecting to Telegram...</p>
  <p>If you're not redirected automatically, <a href="${webProxyUrl}">click here</a>.</p>
</body>
</html>
    `;

    return new Response(html, {
      headers: {
        "content-type": "text/html",
        "cache-control": "no-cache, no-store, must-revalidate"
      }
    });
  }
};
