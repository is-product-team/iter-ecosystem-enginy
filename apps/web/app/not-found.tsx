// This root not-found page is a fallback for routes outside of the [locale] segment.
// It uses pure static HTML to avoid any React hook errors (like useContext null)
// during the Next.js static prerendering process.

import Link from 'next/link';

export default function GlobalNotFound() {
  const GIF_SRC = "/404.gif";

  return (
    <html lang="es">
      <head>
        <title>404 - Página no encontrada</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `
          body { 
            margin: 0; padding: 0; font-family: 'Inter', sans-serif; 
            background-color: #f7f8f9; color: #111827; 
            display: flex; align-items: center; justify-content: center; height: 100vh;
            -webkit-font-smoothing: antialiased;
          }
          .container { max-width: 400px; width: 100%; padding: 0 40px; text-align: center; }
          .gif-wrapper { 
            width: 200px; margin: 0 auto 32px;
          }
          h1 { font-size: 36px; font-weight: 500; margin: 0 0 16px; letter-spacing: -0.05em; color: #111827; }
          p { font-size: 14px; font-weight: 500; color: #6b7280; line-height: 1.6; margin-bottom: 48px; }
          .btn {
            display: inline-block; background: #00426b; color: white; padding: 16px 40px;
            text-decoration: none; font-weight: 500; transition: all 0.2s;
          }
          .brand { display: none; }
          .lang-fallback { margin-top: 64px; display: flex; justify-content: center; gap: 24px; }
          .lang-link { font-size: 12px; color: #9ca3af; text-decoration: none; font-weight: 500; }
          .lang-link:hover { color: #4197cb; }

          @media (prefers-color-scheme: dark) {
            body { background-color: #171717; color: #ececec; }
            h1 { color: #ececec; }
            p { color: #b4b4b4; }
            .btn { background: #4197cb; }
            .lang-link { color: #4b5563; }
          }
        `}} />
      </head>
      <body>
        <div className="container">
          <h1>Página no encontrada</h1>
          <p>Lo sentimos, pero la página que estás buscando no existe o ha sido movida temporalmente.</p>
          <div className="gif-wrapper">
            <img src={GIF_SRC} style={{ width: '100%', display: 'block' }} alt="404" />
          </div>
          <Link href="/es" className="btn">Volver al inicio</Link>

          <div className="lang-fallback">
            <Link href="/ca" className="lang-link">Català</Link>
            <Link href="/en" className="lang-link">English</Link>
          </div>
        </div>
      </body>
    </html>
  );
}

