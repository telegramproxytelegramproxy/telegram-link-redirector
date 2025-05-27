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

    const tgUrl = cleaned.startsWith('+')
      ? `tg://join?invite=${cleaned.slice(1)}`
      : `tg://resolve?domain=${cleaned}`;

    // Check if the request comes from a device that might have Telegram installed
    const userAgent = request.headers.get('user-agent') || '';
    const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(userAgent);
    
    if (isMobile) {
      // For mobile devices, try to open Telegram and fallback to the article
      return new Response(
        `<!DOCTYPE html>
        <html>
        <head>
          <meta http-equiv="refresh" content="0;url=${tgUrl}">
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.location.href = "https://bibica.net/giai-quyet-telegram-bi-nha-mang-viet-nam-chan-bang-mtproto-proxy-proton-vpn";
              }, 1000);
            };
          </script>
        </head>
        <body></body>
        </html>`,
        { headers: { "content-type": "text/html" } }
      );
    } else {
      // For desktop browsers, redirect directly to the article
      return Response.redirect(
        "https://bibica.net/giai-quyet-telegram-bi-nha-mang-viet-nam-chan-bang-mtproto-proxy-proton-vpn",
        301
      );
    }
  }
};
