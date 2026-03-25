// Жөндеу жұмыстары туралы хабарламаны көрсету
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
    font-size: 24px;
    font-family: Arial, sans-serif;
    z-index: 9999;
    text-align: center;
    padding: 20px;
`;
overlay.innerHTML = 'Сайтта жөндеу жұмыстары жүргізілуде<br><br>Қолайсыздықтар үшін кешірім сұраймыз!';
document.body.appendChild(overlay);

// Егер беттің мазмұнын жасырғыңыз келсе
document.body.style.overflow = 'hidden';