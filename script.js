const banner = document.createElement('div');
banner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background: #ff9800;
    color: #000;
    text-align: center;
    padding: 12px;
    font-family: Arial, sans-serif;
    z-index: 9999;
    font-size: 14px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
`;
banner.innerHTML = '⚠️ Сайтта жөндеу жұмыстары жүргізілуде / На сайте проводятся технические работы ⚠️';
document.body.appendChild(banner);
document.body.style.paddingTop = '40px';