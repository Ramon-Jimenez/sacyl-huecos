"""Regenera instalar-marcador.html y movil.html con el marcador corto.

El marcador solo carga huecos-sacyl.js desde jsDelivr (este repositorio en GitHub),
así que no hace falta regenerarlo cuando cambia el código: basta con hacer push.
"""
import html, pathlib

d = pathlib.Path(__file__).resolve().parent
url = ("javascript:(function(){var s=document.createElement('script');"
       "s.src='https://cdn.jsdelivr.net/gh/Ramon-Jimenez/sacyl-huecos@main/huecos-sacyl.min.js?t='+Date.now();"
       "s.onerror=function(){alert('No se ha podido cargar el marcador de huecos.')};"
       "document.body.appendChild(s)})()")

tpl = (d / "plantilla-instalar.html").read_text()
(d / "instalar-marcador.html").write_text(tpl.replace("{{MARCADOR}}", html.escape(url, quote=True)))
movil = (d / "plantilla-movil.html").read_text()
(d / "movil.html").write_text(movil.replace("{{MARCADOR}}", html.escape(url, quote=False)))
(d / "marcador.txt").write_text(url)
print(len(url), "caracteres en el marcador")
