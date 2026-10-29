# Huecos SACYL

Marcador de navegador para la web de Cita Previa de SACYL (https://citaweb.saludcastillayleon.es/CitaPreviaWeb/).

La web oficial solo muestra el primer hueco libre a partir de una hora. Este marcador muestra todos los huecos libres de un rango de fechas y permite reservar uno.

## Qué hace

- En la pantalla de entrada, guarda el CIPA y el primer apellido de varias personas y los rellena al tocar un nombre. El captcha lo escribe la persona.
- Ya dentro, busca todos los huecos libres del profesional elegido. Para eso pide el primer hueco, lo libera enseguida y vuelve a pedir desde el minuto siguiente.
- Solo reserva una cita cuando el usuario toca una hora y confirma.

Los datos de las personas se guardan solo en el navegador (`localStorage` de la web de SACYL). No se envían a ningún otro sitio.

## Instalar

Crear un marcador con esta URL:

```
javascript:(function(){var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/Ramon-Jimenez/sacyl-huecos@main/huecos-sacyl.min.js?t='+Date.now();s.onerror=function(){alert('No se ha podido cargar el marcador de huecos.')};document.body.appendChild(s)})()
```

En Chrome para Android, el marcador se ejecuta escribiendo su nombre en la barra de direcciones y tocando la sugerencia. Desde el menú de Marcadores no funciona.

## Archivos

- `huecos-sacyl.js`: el código del marcador.
- `huecos-sacyl.min.js`: lo genera jsDelivr automáticamente a partir del anterior.

Proyecto personal, sin relación con SACYL ni con la Junta de Castilla y León.
