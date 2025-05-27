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

    const fallbackUrl = "https://bibica.net/giai-quyet-telegram-bi-nha-mang-viet-nam-chan-bang-mtproto-proxy-proton-vpn";

    // Kiểm tra User-Agent để xác định thiết bị di động
    const userAgent = request.headers.get('user-agent') || '';
    const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(userAgent);

    if (!isMobile) {
      return Response.redirect(fallbackUrl, 302);
    }

    // Tạo trang trung gian với nút mở Telegram
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mở trong Telegram</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 500px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .btn {
            display: inline-block;
            padding: 12px 24px;
            background: #0088cc;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 15px 0;
          }
          .fallback {
            margin-top: 20px;
            font-size: 14px;
            color: #666;
          }
          .fallback a {
            color: #0088cc;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Mở trong Telegram</h2>
          <p>Nhấn nút bên dưới để mở liên kết trong ứng dụng Telegram</p>
          
          <a href="${tgUrl}" class="btn">Mở Telegram</a>
          
          <div class="fallback">
            Nếu ứng dụng không mở được, <a href="${fallbackUrl}">bấm vào đây</a>
          </div>
        </div>

        <script>
          // Thử mở Telegram tự động nhưng không chuyển hướng ngay
          setTimeout(function() {
            window.location.href = "${tgUrl}";
          }, 25);
          
          // Nếu sau 3 giây vẫn chưa rời khỏi trang thì ẩn nút và hiển thị thông báo
          setTimeout(function() {
            document.body.innerHTML += `
              <div class="container" style="margin-top: 20px;">
                <p>Ứng dụng Telegram không được phát hiện trên thiết bị của bạn.</p>
                <p><a href="${fallbackUrl}" class="btn">Xem hướng dẫn cài đặt</a></p>
              </div>
            `;
          }, 3000);
        </script>
      </body>
      </html>
    `, {
      headers: {
        "content-type": "text/html",
        "cache-control": "no-cache"
      }
    });
  }
};
