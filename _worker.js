export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/|\/$/g, '');

    if (!path) {
      return Response.redirect(
        "https://bibica.net/giai-quyet-telegram-bi-nha-mang-viet-nam-chan-bang-mtproto-socks5-proton-vpn/",
        301
      );
    }

    const cleaned = path.replace(/^@/, '');
    const tgUrl = cleaned.startsWith('+')
      ? `tg://join?invite=${cleaned.slice(1)}`
      : `tg://resolve?domain=${cleaned}`;

    return new Response(`
      <!DOCTYPE html>
      <html><head>
        <meta charset="utf-8" />
        <script>
          location.replace("${tgUrl}");
        </script>
      </head><body></body></html>
    `, {
      headers: {
        "content-type": "text/html",
        "cache-control": "no-store, max-age=0",
      },
    });
  }
};
