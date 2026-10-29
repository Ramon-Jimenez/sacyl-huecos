(async () => {
  const ID = "sacyl-huecos-panel";
  const viejo = document.getElementById(ID);
  if (viejo) { viejo.remove(); return; }

  let inj;
  try { inj = angular.element(document.body).injector(); } catch (e) {}
  const root = inj && inj.get("$rootScope");
  if (!root || !/saludcastillayleon/.test(location.host)) {
    alert("Abre primero Cita Previa de SACYL (citaweb.saludcastillayleon.es) y pulsa otra vez este marcador.");
    return;
  }

  const CSS = `
    * { box-sizing: border-box; }
    .p { height: 100%; overflow-y: auto; background: #fff; color: #1d2733; border-left: 1px solid #c9d3df;
         box-shadow: -6px 0 24px rgba(0,0,0,.15); padding: 16px; font: 15px/1.4 system-ui, sans-serif; }
    header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    header b { font-size: 18px; color: #1f5fae; }
    .x { border: 0; background: none; font-size: 26px; cursor: pointer; color: #5b6878; line-height: 1; }
    label { display: block; margin: 0 0 10px; font-weight: 600; font-size: 13px; color: #4a5768; }
    select, input { display: block; width: 100%; margin-top: 4px; padding: 7px 8px; font: inherit; color: inherit;
                    border: 1px solid #b8c4d2; border-radius: 6px; background: #fff; }
    .fechas { display: flex; gap: 10px; } .fechas label { flex: 1; }
    .prim { width: 100%; padding: 10px; font: inherit; font-weight: 600; color: #fff; background: #1f6fd1;
            border: 0; border-radius: 6px; cursor: pointer; margin-top: 4px; }
    .prim.parar { background: #8a3b3b; }
    #estado { min-height: 1.4em; margin: 12px 0; color: #4a5768; }
    #estado.ok { color: #1c7a3e; font-weight: 600; } #estado.mal { color: #a12d2d; font-weight: 600; }
    h3 { font-size: 14px; margin: 16px 0 6px; text-transform: capitalize; color: #1d2733; }
    .horas { display: grid; grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); gap: 6px; }
    .horas button { padding: 7px 0; font: inherit; font-variant-numeric: tabular-nums; border: 1px solid #9fbbe0;
                    background: #eef4fc; color: #174f95; border-radius: 6px; cursor: pointer; }
    .horas button:hover { background: #1f6fd1; color: #fff; }
    .persona { display: flex; gap: 6px; margin-bottom: 8px; }
    .persona .usar { flex: 1; text-align: left; padding: 10px 12px; font: inherit; border: 1px solid #9fbbe0;
                     background: #eef4fc; color: #174f95; border-radius: 6px; cursor: pointer; }
    .persona .usar small { display: block; color: #5b6878; font-size: 12px; }
    .persona .borrar { width: 40px; font-size: 20px; border: 1px solid #d5dde7; background: #fff; color: #8a3b3b;
                       border-radius: 6px; cursor: pointer; }
    .nota { font-size: 12px; color: #6a7685; margin-top: 18px; }
    details { margin-top: 14px; font-size: 12px; color: #4a5768; }
    summary { cursor: pointer; font-weight: 600; }
    details.anadir { font-size: 15px; } details.anadir[open] summary { margin-bottom: 10px; }
    #registro { white-space: pre-wrap; word-break: break-all; max-height: 260px; overflow-y: auto;
                background: #f3f5f8; padding: 8px; border-radius: 6px; user-select: all; }`;

  function crearPanel(titulo, cuerpo) {
    const host = document.createElement("div");
    host.id = ID;
    host.style.cssText = "position:fixed;top:0;right:0;bottom:0;z-index:2147483647;width:min(420px,100vw)";
    const sh = host.attachShadow({ mode: "open" });
    sh.innerHTML = `<style>${CSS}</style><div class="p">
      <header><b>${titulo}</b><button class="x" id="cerrar" title="Cerrar">&times;</button></header>${cuerpo}</div>`;
    document.body.appendChild(host);
    const $ = id => sh.getElementById(id);
    $("cerrar").onclick = () => host.remove();
    return { host, $ };
  }

  if (!root.cip) {
    if (!document.getElementById("cip")) {
      alert("Vuelve a la pantalla de entrada de Cita Previa y pulsa otra vez este marcador.");
      return;
    }
    panelPersonas();
    return;
  }
  await panelHuecos();

  function panelPersonas() {
    const CLAVE = "huecos-sacyl-personas";
    const leer = () => { try { return JSON.parse(localStorage.getItem(CLAVE)) || []; } catch (e) { return []; } };
    const guardar = lista => {
      try { localStorage.setItem(CLAVE, JSON.stringify(lista)); return true; } catch (e) { return false; }
    };

    const { host, $ } = crearPanel("¿Quién pide cita?", `
      <div id="lista"></div>
      <details class="anadir" id="anadir"><summary>Añadir persona</summary>
        <label>Nombre (como quieras verlo)<input id="nNombre" maxlength="30"></label>
        <label>CIPA<input id="nCip" maxlength="20" autocapitalize="characters"></label>
        <label>Primer apellido<input id="nApe" maxlength="40"></label>
        <button class="prim" id="nGuardar">Guardar</button>
        <p id="estado"></p>
      </details>
      <p class="nota">Los datos se guardan solo en este navegador y en este dispositivo.
        Al tocar un nombre se rellenan el CIPA y el apellido; el captcha lo escribes tú.</p>`);

    const poner = (id, valor) => {
      const el = document.getElementById(id);
      el.value = valor;
      el.dispatchEvent(new Event("input", { bubbles: true }));
    };

    function pintar() {
      const personas = leer();
      const lista = $("lista");
      lista.textContent = "";
      personas.forEach((p, i) => {
        const fila = document.createElement("div");
        fila.className = "persona";
        const usar = document.createElement("button");
        usar.className = "usar";
        usar.textContent = p.nombre;
        const det = document.createElement("small");
        det.textContent = p.apellido + " · " + p.cip;
        usar.append(det);
        usar.onclick = () => {
          poner("cip", p.cip);
          poner("apellido", p.apellido);
          host.remove();
          const captcha = document.getElementById("cpatchaTextBox");
          if (captcha) { captcha.scrollIntoView({ block: "center" }); captcha.focus(); }
        };
        const borrar = document.createElement("button");
        borrar.className = "borrar";
        borrar.title = "Borrar";
        borrar.textContent = "×";
        borrar.onclick = () => {
          if (!confirm(`¿Borrar a ${p.nombre} de este navegador?`)) return;
          guardar(leer().filter((_, j) => j !== i));
          pintar();
        };
        fila.append(usar, borrar);
        lista.append(fila);
      });
      $("anadir").open = !personas.length;
    }

    $("nGuardar").onclick = () => {
      const nombre = $("nNombre").value.trim();
      const cip = $("nCip").value.trim().toUpperCase();
      const apellido = $("nApe").value.trim();
      const estado = $("estado");
      if (!nombre || !apellido || cip.length < 10) {
        estado.textContent = "Rellena el nombre, el apellido y un CIPA válido (al menos 10 caracteres).";
        estado.className = "mal";
        return;
      }
      if (!guardar([...leer(), { nombre, cip, apellido }])) {
        estado.textContent = "Este navegador no deja guardar datos (¿modo incógnito?).";
        estado.className = "mal";
        return;
      }
      $("nNombre").value = $("nCip").value = $("nApe").value = "";
      estado.textContent = "";
      pintar();
    };

    pintar();
  }

  async function panelHuecos() {
    const $http = inj.get("$http");
    const api = root.REST_SERVICE_URI;
    const cip = root.cip, centro = root.centroId;
    const PAUSA_MS = 1200, MAX_LLAMADAS = 400;

    const json = o => "{" + Object.entries(o).map(([k, v]) => `"${k}": "${v}"`).join(", ") + "}";
    const get = async url => (await $http.get(api + url)).data;
    const pad = n => String(n).padStart(2, "0");
    const fechaApi = d => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
    const deApi = s => new Date(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8), +s.slice(9, 11), +s.slice(11, 13));
    const hora = d => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    const dia = d => d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
    const isoDia = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const correcto = d => d && d.statusCodeValue == 200 && d.body;

    const registro = [];
    const apuntar = txt => {
      registro.push(txt);
      console.log("[huecos]", txt);
      const pre = document.getElementById(ID) && document.getElementById(ID).shadowRoot.getElementById("registro");
      if (pre) pre.textContent = registro.join("\n");
    };
    const primera = (prof, tipo, desde) => get("ws/primeraCitaDisponible/" + json({
      cip, codCategoria: prof.Cod_Categoria, cias: prof.CIAS == "undefined" ? "" : prof.CIAS,
      tipoCita: "R", fecha: fechaApi(desde), centro, observaciones: null, actividad: tipo,
    }));
    const soltar = async c => {
      try {
        const r = await get("util/liberarCita/" + json({ cip, codCita: String(c.Cod_Cita).split("/")[0], centro }));
        apuntar("  soltar " + c.Cod_Cita + " -> " + JSON.stringify(r).slice(0, 200));
      } catch (e) {
        apuntar("  soltar " + c.Cod_Cita + " -> ERROR " + (e && e.status));
      }
    };

    let profs = [];
    try {
      const d = await get("ws/profesionalesPaciente/" + json({ cip, centro }));
      profs = (correcto(d) && d.body.Profesionales) || [];
    } catch (e) {}
    if (!profs.length) {
      alert("No he podido leer tus profesionales. Recarga la página, vuelve a entrar y pulsa otra vez el marcador.");
      return;
    }

    const paciente = [root.nombre, root.apellido1].filter(Boolean).join(" ");
    const { $ } = crearPanel("Huecos libres", `
      ${paciente ? `<p class="nota" style="margin-top:0">Paciente: <span id="paciente"></span></p>` : ""}
      <label>Profesional<select id="prof"></select></label>
      <label id="lTipo">Lugar<select id="tipo"></select></label>
      <label>Motivo (solo hace falta para reservar)<select id="mot"></select></label>
      <label id="lOtro" hidden>Escribe el motivo<input id="otro" maxlength="35"></label>
      <div class="fechas">
        <label>Desde<input type="date" id="desde"></label>
        <label>Hasta<input type="date" id="hasta"></label>
      </div>
      <button class="prim" id="buscar">Buscar huecos</button>
      <p id="estado"></p>
      <div id="lista"></div>
      <details><summary>Detalle de la búsqueda</summary><pre id="registro"></pre></details>
      <p class="nota">Para ver cada hueco, la web lo aparta un momento y este panel lo suelta enseguida.
        Solo se reserva una cita cuando pulsas una hora y confirmas.</p>`);
    if (paciente) $("paciente").textContent = paciente;

    let motivos = [], huecos = [], buscando = false, parar = false;

    const estado = (txt, clase = "") => { $("estado").textContent = txt; $("estado").className = clase; };
    const profActual = () => profs[$("prof").value];
    const tipoActual = () => $("tipo").value || "U";

    profs.forEach((p, i) => {
      const nombre = [p.Nombre, p.Apellido1, p.Apellido2].filter(x => x && x != "undefined").join(" ");
      $("prof").add(new Option(p.Categoria + (nombre ? " · " + nombre : ""), i));
    });

    const hoy = new Date();
    $("desde").value = $("desde").min = $("hasta").min = isoDia(hoy);
    $("hasta").value = isoDia(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 14));
    $("desde").max = $("hasta").max = isoDia(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 60));

    async function cargarMotivos() {
      const p = profActual();
      let lista = null;
      try {
        const r = await get(`ws/motivosCategoria/${p.Cod_Categoria}?tipoCita=${tipoActual()}`);
        if (r && r.Resultado == "0") lista = r.Motivos;
      } catch (e) {}
      motivos = lista && lista.length ? lista : [{ MOTIVO: "Consulta " + p.Categoria }];
      const sel = $("mot");
      sel.length = 0;
      sel.add(new Option("Elige un motivo", ""));
      motivos.forEach((m, i) => sel.add(new Option(m.MOTIVO, i)));
      $("lOtro").hidden = true;
    }

    function cambiarProf() {
      const tipos = profActual().TipoActividad || [];
      $("tipo").length = 0;
      tipos.forEach(t => $("tipo").add(new Option(t.Descripcion, t.Codigo)));
      $("lTipo").hidden = !tipos.length;
      limpiar();
      cargarMotivos();
    }

    function limpiar() {
      huecos = [];
      pintar();
      estado("");
    }

    function observaciones() {
      const m = motivos[$("mot").value];
      if (!m) return null;
      if (m.MOTIVO_CODE == "06") {
        const t = $("otro").value.trim();
        if (!t || (root.regex && !new RegExp(root.regex).test(t))) return null;
        return "Cita previa: " + t;
      }
      return "Cita previa: " + m.MOTIVO.replace("/", " o ");
    }

    function pintar() {
      const lista = $("lista");
      lista.textContent = "";
      let diaActual = "", fila;
      for (const h of huecos) {
        if (dia(h.cuando) !== diaActual) {
          diaActual = dia(h.cuando);
          const h3 = document.createElement("h3");
          h3.textContent = diaActual;
          fila = document.createElement("div");
          fila.className = "horas";
          lista.append(h3, fila);
        }
        const b = document.createElement("button");
        b.textContent = hora(h.cuando);
        if (h.sala) b.title = "Sala " + h.sala;
        b.onclick = () => reservar(h);
        fila.append(b);
      }
    }

    async function buscar() {
      if (buscando) { parar = true; return; }
      const prof = profActual(), tipo = tipoActual();
      const minimo = new Date(Date.now() + 6 * 60000);
      let desde = new Date($("desde").value + "T00:01");
      if (desde < minimo) desde = minimo;
      const fin = new Date($("hasta").value + "T23:59");
      if (isNaN(desde) || isNaN(fin) || fin < desde) { estado("Revisa las fechas.", "mal"); return; }

      buscando = true; parar = false;
      $("buscar").textContent = "Parar"; $("buscar").classList.add("parar");
      huecos = []; pintar();
      registro.length = 0;
      let ultimoMensaje = "";
      try {
        for (let n = 0; n < MAX_LLAMADAS && !parar && desde <= fin; n++) {
          estado(`Buscando... ${huecos.length} huecos hasta ahora (voy por el ${dia(desde)}, ${hora(desde)}).`);
          const d = await primera(prof, tipo, desde);
          apuntar(fechaApi(desde) + " -> " + JSON.stringify(d).slice(0, 300));
          const r = correcto(d) ? d.body : null;
          if (!r || r.Resultado != "0" || !r.Cita) {
            ultimoMensaje = r && r.Mensaje ? r.Mensaje : "La web no ha dado un hueco a partir del " + dia(desde) + ".";
            if (r && ["23", "99", "111"].includes(String(r.Resultado))) break;
            desde = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate() + 1, 0, 1);
            await sleep(PAUSA_MS);
            continue;
          }
          await soltar(r.Cita);
          const cuando = deApi(r.Cita.Fecha_Hora);
          if (cuando > fin) {
            apuntar("  siguiente hueco fuera del rango: " + dia(cuando) + " " + hora(cuando));
            ultimoMensaje = `Después de estas fechas, el siguiente hueco es el ${dia(cuando)} a las ${hora(cuando)}.`;
            break;
          }
          if (cuando < desde) {
            desde = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate() + 1, 0, 1);
          } else {
            huecos.push({ cuando, sala: r.Cita.Sala, prof, tipo });
            pintar();
            desde = new Date(cuando.getTime() + 60000);
          }
          await sleep(PAUSA_MS);
        }
        if (huecos.length) estado(`${huecos.length} huecos libres${parar ? " (búsqueda parada)" : ""}. Pulsa una hora para reservarla.` +
          (ultimoMensaje ? " " + ultimoMensaje : ""));
        else estado("No hay huecos libres en esas fechas. " + ultimoMensaje, "mal");
      } catch (e) {
        estado("La web ha dado un error: " + (e && e.status ? "HTTP " + e.status : e) + ". Prueba a recargar y entrar de nuevo.", "mal");
      } finally {
        buscando = false;
        $("buscar").textContent = "Buscar huecos"; $("buscar").classList.remove("parar");
      }
    }

    async function reservar(h) {
      if (buscando) { alert("Espera a que termine la búsqueda o pulsa Parar."); return; }
      const obs = observaciones();
      if (!obs) { alert("Elige el motivo de la cita en el panel antes de reservar."); $("mot").focus(); return; }
      if (!confirm(`¿Reservar cita el ${dia(h.cuando)} a las ${hora(h.cuando)}?\n\n${$("prof").selectedOptions[0].text}\n${obs}`)) return;
      estado("Reservando...");
      try {
        const d = await primera(h.prof, h.tipo, h.cuando);
        const c = correcto(d) && d.body.Resultado == "0" ? d.body.Cita : null;
        if (!c || deApi(c.Fecha_Hora).getTime() !== h.cuando.getTime()) {
          if (c) await soltar(c);
          estado("Ese hueco ya no está libre. Vuelve a buscar.", "mal");
          return;
        }
        const r = await get("ws/crearCita/" + json({
          cip, codCita: String(c.Cod_Cita).split("/")[0], centro,
          observaciones: obs.replace("/", "%2F"), actividad: h.tipo,
        }));
        if (correcto(r) && r.body.Resultado == "0") {
          huecos = huecos.filter(x => x !== h);
          pintar();
          estado(`Cita reservada: ${dia(h.cuando)} a las ${hora(h.cuando)}. Recarga la página para verla en tus citas.`, "ok");
        } else {
          estado("No se ha podido reservar. " + (r && r.body && r.body.Mensaje ? r.body.Mensaje : ""), "mal");
        }
      } catch (e) {
        estado("La web ha dado un error al reservar. Revisa tus citas antes de volver a intentarlo.", "mal");
      }
    }

    $("cerrar").onclick = () => { parar = true; document.getElementById(ID).remove(); };
    $("prof").onchange = cambiarProf;
    $("tipo").onchange = () => { limpiar(); cargarMotivos(); };
    $("mot").onchange = () => { const m = motivos[$("mot").value]; $("lOtro").hidden = !(m && m.MOTIVO_CODE == "06"); };
    $("desde").onchange = $("hasta").onchange = limpiar;
    $("buscar").onclick = buscar;
    cambiarProf();
  }
})().catch(e => alert("Error en el marcador de huecos: " + (e && e.message || e)));
void 0;
