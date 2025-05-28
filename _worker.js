export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname.slice(1);

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

    return new Response(
      `<!DOCTYPE html>
       <meta http-equiv="cache-control" content="no-cache, no-store, must-revalidate">
       <meta http-equiv="refresh" content="0;url=${tgUrl}">`,
      {
        headers: {
          "content-type": "text/html",
          "cache-control": "no-store, max-age=0",
        },
      }
    );
  }
};
