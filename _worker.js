export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const query = url.search;

  // Chuyển path từ kiểu /@bibica_net → bibica_net
  let tgPath = path.replace(/^\/@?/, '');

  // Xử lý invite link nếu có joinchat hoặc dấu +
  let tgLink = '';
  if (tgPath.startsWith('joinchat/') || tgPath.startsWith('+')) {
    const inviteCode = tgPath.replace(/^joinchat\//, '');
    tgLink = `tg://join?invite=${inviteCode}`;
  } else {
    tgLink = `tg://resolve?domain=${tgPath}`;
  }

  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Đang mở Telegram...</title>
    <meta http-equiv="refresh" content="0; url='${tgLink}'" />
    <script>
      window.location.href = '${tgLink}';
      setTimeout(() => {
        window.location.href = 'https://telegram.org/';
      }, 3000);
    </script>
  </head>
  <body>
    <p>Nếu không tự mở được Telegram, hãy <a href="${tgLink}">bấm vào đây</a>.</p>
  </body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html;charset=UTF-8" }
  });
}
