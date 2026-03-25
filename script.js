const overlay = document.createElement('div');
overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.9);
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 22px;
    font-family: Arial, sans-serif;
    z-index: 9999;
    text-align: center;
    padding: 20px;
    line-height: 1.5;
`;
overlay.innerHTML = `
    <div>
        <div>Сайтта жөндеу жұмыстары жүргізілуде.</div>
        <div>Қолайсыздықтар үшін кешірім сұраймыз!</div>
        <br>
        <div>На сайте проводятся технические работы.</div>
        <div>Приносим извинения за временные неудобства!</div>
    </div>
`;
document.body.appendChild(overlay);
document.body.style.overflow = 'hidden';