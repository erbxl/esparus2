# Esparus

Landing estática en ruso orientada al contacto por WhatsApp desde Instagram. Conserva la paleta crema, naranja y gris oscuro de Esparus.

## Vista local

Desde la raíz del repositorio:

```sh
python -m http.server 8765 --bind 127.0.0.1
```

Abre `http://127.0.0.1:8765`. No necesita instalación de paquetes ni compilación.

## Archivos

- `index.html`: contenido, servicios, precios, preguntas y enlaces de contacto. El contenido y WhatsApp funcionan sin JavaScript.
- `styles.css`: paleta, tipografía, diseño responsive y accesibilidad.
- `main.js`: barra contextual en móvil, año y eventos de medición.
- `404.html`: recuperación de enlaces antiguos hacia el inicio o WhatsApp. Usa rutas desde la raíz del dominio.

Las páginas ya no cargan los archivos de la versión anterior en `lib/`. El contenido visible se edita directamente en HTML.

## Contacto y medición

Los enlaces usan el número existente **+34 664 090 985** y un mensaje preparado en ruso. Para cambiarlo, actualiza los enlaces `data-wa-link` de ambas páginas. El mensaje se abre en WhatsApp; el visitante decide si lo envía.

Los parámetros `utm_source`, `utm_medium`, `utm_campaign`, `utm_term` y `utm_content` se conservan durante la sesión. El almacenamiento bloqueado no impide contactar.

Se emiten `esparus:landing_view`, `esparus:whatsapp_click`, `esparus:wa_<ubicacion>_click` y `esparus:faq_open` como eventos del documento. También se añaden a `window.dataLayer` si existe, sin el prefijo `esparus:`. No se carga ningún servicio externo de analítica. Al conectar uno, cuenta `whatsapp_click` como clic de contacto; los eventos por ubicación permiten desglosarlo sin contar dos veces la misma acción. Un clic no confirma el envío del mensaje ni una contratación.

## Comprobaciones del rediseño

Revisión en Chromium a 320, 360, 390, 540, 768, 1024 y 1440 px: sin desbordamiento horizontal ni errores JavaScript. Comprobados enlaces internos, número y mensaje de WhatsApp, atribución UTM, barra contextual, preguntas con teclado, navegación sin JavaScript y página 404. El comportamiento de apertura de la app requiere un dispositivo con WhatsApp.
