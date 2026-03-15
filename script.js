// ============ ТЕХНИКАЛЫҚ ЖҰМЫСТАР ============
(function() {
  // Тексеру: қазіргі уақыт 22:00 - 07:00 аралығында ма?
  const now = new Date();
  const hours = now.getHours();
  
  // Техникалық жұмыс уақыты: 22:00 - 07:00
  if (hours >= 22 || hours < 7) {
    // Барлық бетті өшіру
    document.documentElement.innerHTML = '';
    
    // Жаңа бет жасау
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
            font-family: Arial, sans-serif;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
          }
          .container {
            padding: 20px;
          }
          h1 {
            font-size: 32px;
            margin-bottom: 15px;
            color: #ffd700;
            font-weight: 300;
            letter-spacing: 2px;
          }
          p {
            font-size: 18px;
            opacity: 0.8;
            margin-bottom: 10px;
          }
          .time {
            color: #ffd700;
            font-size: 16px;
            margin-top: 30px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🔧 ТЕХНИКАЛЫҚ ЖҰМЫСТАР</h1>
          <p>Сайтта техникалық жұмыстар жүргізілуде</p>
          <p>Ашылу уақыты: 07:00</p>
          <div class="time">© 2026</div>
        </div>
      </body>
      </html>
    `;
    
    // Барлық скрипттерді тоқтату
    throw new Error('Техникалық жұмыстар');
  }
})();