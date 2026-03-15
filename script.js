```javascript
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
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
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
        max-width: 500px;
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
      .instagram-link {
        margin-top: 40px;
        padding: 15px 30px;
        background: linear-gradient(45deg, #f09433, #d62976, #962fbf, #4f5bd5);
        border-radius: 50px;
        display: inline-block;
      }
      .instagram-link a {
        color: white;
        text-decoration: none;
        font-size: 20px;
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .instagram-link a:hover {
        opacity: 0.9;
      }
      .footer {
        margin-top: 30px;
        font-size: 14px;
        color: #666;
      }
    </style>
  </head>
  <body>
    <div class="box">
      <h1>🔧 ТЕХНИКАЛЫҚ ЖҰМЫСТАР</h1>
      <p>Сайтта техникалық жұмыстар жүргізілуде</p>
      <p>Ашылу уақыты: 07:00</p>
      
      <div class="instagram-link">
        <a href="https://instagram.com/aian_wtkkz" target="_blank">
          <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z'/%3E%3C/svg%3E" alt="Instagram" style="width: 24px; height: 24px;">
          @aian_wtkkz
        </a>
      </div>
      
      <div class="footer">Жаңартуларды Instagram парақшамнан қадағалаңыз</div>
    </div>

    <script>
      // Мәтінді көшіруге тыйым салу
      document.addEventListener('contextmenu', e => e.preventDefault());
      document.addEventListener('copy', e => e.preventDefault());
      document.addEventListener('cut', e => e.preventDefault());
      document.addEventListener('paste', e => e.preventDefault());
      document.addEventListener('keydown', e => {
        if (e.ctrlKey && (e.key === 'c' || e.key === 'x' || e.key === 'v')) {
          e.preventDefault();
        }
        if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
          e.preventDefault();
        }
      });
    </script>
  </body>
  </html>
`;

throw new Error('Техникалық жұмыстар');
```