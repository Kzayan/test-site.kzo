// ============ ТЕХНИКАЛЫҚ ЖҰМЫСТАР ============
// САЙТ ТОЛЫҒЫМЕН ЖАБЫҚ
document.documentElement.innerHTML = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Техникалық жұмыстар</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        background: #000;
        color: #fff;
        font-family: system-ui, -apple-system, sans-serif;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
      }
      .box {
        padding: 20px;
      }
      h1 {
        font-size: 48px;
        margin-bottom: 20px;
        color: #ffd700;
        font-weight: 400;
      }
      p {
        font-size: 24px;
        margin-bottom: 15px;
        opacity: 0.9;
      }
    </style>
  </head>
  <body>
    <div class="box">
      <h1>🔧 ТЕХНИКАЛЫҚ ЖҰМЫСТАР</h1>
      <p>Сайтта техникалық жұмыстар жүргізілуде</p>
      <p>Ашылу уақыты: 07:00</p>
    </div>
  </body>
  </html>
`;

throw new Error('Техникалық жұмыстар');