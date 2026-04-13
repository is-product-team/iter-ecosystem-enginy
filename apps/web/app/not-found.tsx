// This root not-found page is a fallback for routes outside of the [locale] segment.
// It uses pure static HTML to avoid any React hook errors (like useContext null)
// during the Next.js static prerendering process.

import Link from 'next/link';

export default function GlobalNotFound() {
  return (
    <html lang="es">
      <head>
        <title>404 - Not Found</title>
      </head>
      <body style={{ 
        margin: 0, 
        padding: 0, 
        fontFamily: 'sans-serif', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '72px', fontWeight: 'bold', margin: '0', color: '#111827' }}>404</h1>
          <p style={{ fontSize: '18px', color: '#4b5563', marginTop: '10px' }}>Página no encontrada</p>
          <Link href="/es" style={{ 
            marginTop: '20px', 
            display: 'inline-block', 
            textDecoration: 'none', 
            backgroundColor: '#2563eb', 
            color: 'white', 
            padding: '10px 20px', 
            borderRadius: '4px' 
          }}>
            Volver al inicio
          </Link>
        </div>
      </body>
    </html>
  );
}
