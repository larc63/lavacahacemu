
(function() {
    let cookieNotice;
    const createCookie = () => {
        document.cookie = 'COOKIE_MONSTER=true;secure=true';
        cookieNotice.classList.replace('appear', 'disappear');
    }

    const showCookieDialog = () => {
        const a = document.createElement('button');
        a.innerText = 'OK';
        // border:  none;font-size: 2rem;background-color: lightsteelblue;
        a.style.border = 'none';
        a.style.fontSize = '2rem';
        a.style.backgroundColor = 'lightsteelblue';
        a.onclick = createCookie;

        cookieNotice = document.createElement('div');
        cookieNotice.innerText = 'AVISO: En este sitio usamos cookies para mejorar tu experiencia. '; 
        cookieNotice.style.zIndex = 1000;
        cookieNotice.style.width = '100%';
        cookieNotice.style.fontSize = '2rem';
        cookieNotice.style.backgroundColor = 'greenyellow';
        cookieNotice.style.textAlign = 'center';
        cookieNotice.classList.add('appear');
        cookieNotice.appendChild(a);
        const b = document.getElementsByTagName('footer')[0];
        b.appendChild(cookieNotice);
    }
    document.addEventListener('DOMContentLoaded', () => {
        if (!document.cookie.includes('COOKIE_MONSTER=true')) {
            showCookieDialog();
        }
    })
    
})()