const WEBHOOK_URL = 'https://automations-n8n.b8vwcm.easypanel.host/webhook/FLOW';
let userData = null;
const dayMap = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

// --- VARIABLES GLOBALES ---
let entrenoCargado = false;
let rutinaActual = { nombre: "", color: "", ejercicios: [] };
let dashboardState = { rutinaIndex: 0, ejercicio: "", timeframe: "semanal" };
let rutinasArrayMem = []; 
let userDataLogsCrudos = [];

document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupNavigation();
});

async function initApp() {
    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orden: "SYNCRO_INICIO" })
        });
        const dataArray = await response.json();
        userData = dataArray[0]; 
        renderInicio();
    } catch (error) {
        console.error("ERROR AL CONECTAR:", error);
        document.getElementById('greeting-title').innerText = "Error de conexión";
    }
}

function renderInicio() {
    document.getElementById('greeting-subtitle').classList.remove('hidden');
    const hour = new Date().getHours();
    let saludo = hour >= 13 && hour < 20 ? "Buenas tardes" : (hour >= 20 ? "Buenas noches" : "Buenos días");
    let pregunta = hour >= 20 ? "¿Cómo ha ido tu día?" : "¿Cómo está yendo tu día?";
    
    const titleEl = document.getElementById('greeting-title');
    titleEl.innerText = `${saludo},\n${userData.Name}`;
    titleEl.classList.add('animated-title');

    let jsDay = new Date().getDay(); 
    let currentDayISO = jsDay === 0 ? 7 : jsDay; 
    let keyHoy = `F_0${currentDayISO}`; 

    if (!userData[keyHoy] || userData[keyHoy] === "") {
        document.getElementById('greeting-subtitle').innerText = pregunta;
        document.getElementById('input-zone').classList.remove('hidden');
        document.getElementById('chat-zone').classList.add('hidden');
    } else {
        document.getElementById('greeting-subtitle').innerText = "Tu mood semanal";
        document.getElementById('input-zone').classList.add('hidden');
        renderChatHistory(currentDayISO);
    }
    document.getElementById('btn-send').onclick = () => enviarMensaje(keyHoy, currentDayISO);
}

async function enviarMensaje(keyHoy, currentDayISO) {
    const input = document.getElementById('daily-input');
    const texto = input.value.trim();
    if (!texto) return;

    document.getElementById('btn-icon').classList.add('hidden');
    document.getElementById('btn-spinner').classList.remove('hidden');

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orden: "FRASE_DIARIA", mensaje: texto })
        });
        const resText = await response.text(); 
        if (resText.includes("FRASE_DIARIA=") && resText.includes(texto)) {
            userData[keyHoy] = texto;
            document.getElementById('greeting-subtitle').innerText = "Tu mood semanal"; 
            const inputZone = document.getElementById('input-zone');
            inputZone.style.opacity = '0';
            setTimeout(() => {
                inputZone.classList.add('hidden');
                renderChatHistory(currentDayISO);
            }, 300); 
        }
    } catch (error) {} finally {
        document.getElementById('btn-icon').classList.remove('hidden');
        document.getElementById('btn-spinner').classList.add('hidden');
    }
}

function renderChatHistory(currentDayISO) {
    const chatZone = document.getElementById('chat-zone');
    chatZone.innerHTML = ''; 
    chatZone.classList.remove('hidden');
    let delayIndex = 0; 
    for (let i = 1; i <= currentDayISO; i++) {
        let key = `F_0${i}`;
        if (userData[key] && userData[key] !== "") {
            const html = `
                <div class="chat-day" style="animation-delay: ${delayIndex * 0.3}s">${dayMap[i === 7 ? 0 : i]}</div>
                <div class="chat-bubble" style="animation-delay: ${delayIndex * 0.3 + 0.1}s">
                    <div class="chat-text">${userData[key]}</div>
                    <div class="chat-status">✓✓</div>
                </div>`;
            chatZone.insertAdjacentHTML('beforeend', html);
            delayIndex++;
        }
    }
}

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');
    const navBg = document.getElementById('nav-bg'); 
    const titleEl = document.getElementById('entreno-title');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            const targetId = item.getAttribute('data-target');
            views.forEach(view => view.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');

            if (targetId !== 'view-entreno') {
                if (navBg.classList.contains('expanded')) {
                    const formContainer = document.getElementById('entreno-form');
                    formContainer.classList.add('fade-out-form'); 
                    navBg.classList.remove('expanded');
                    titleEl.classList.remove('blurred-bg');
                    setTimeout(() => {
                        formContainer.classList.add('hidden');
                        formContainer.classList.remove('fade-out-form');
                        limpiarDatosFormulario(); 
                        document.getElementById('entreno-state-0').classList.remove('hidden'); 
                    }, 300);
                }
            } else {
                if (!entrenoCargado) cargarEntrenos();
            }
        });
    });
}

// --- PESTAÑA ENTRENAMIENTOS ---
async function cargarEntrenos() {
    const titleEl = document.getElementById('entreno-title');
    titleEl.innerText = `Rendimiento\nde ${userData.Name}`;
    titleEl.classList.remove('animated-title');
    void titleEl.offsetWidth; 
    titleEl.classList.add('animated-title');

    document.getElementById('loading-entreno').classList.remove('hidden');
    document.getElementById('content-entreno').classList.add('hidden');

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orden: "SYNCRO_ENTRENO" })
        });
        const dataArray = await response.json();
        const dataEntreno = dataArray[0];
        
        // Guardamos los logs globalmente para Chart.js
        userDataLogsCrudos = dataEntreno.log_entrenos;
        entrenoCargado = true;
        
        document.getElementById('loading-entreno').classList.add('hidden');
        document.getElementById('content-entreno').classList.remove('hidden');

        procesarCatalogoParaCrear(dataEntreno.lista_ejercicios);

        const lib = dataEntreno.lib_entrenos;
        const tieneRutinas = Array.isArray(lib) ? lib.length > 0 : (Object.keys(lib).length > 0 && !lib.aviso);

        if (!tieneRutinas) {
            document.getElementById('entreno-state-1').classList.add('hidden');
            document.getElementById('entreno-state-0').classList.remove('hidden');
            prepararFormularioCreacion();
        } else {
            renderEstado1(dataEntreno);
        }
    } catch (error) { 
        console.error(error); 
        document.getElementById('loading-entreno').classList.add('hidden');
    }
}

// --- ESTADO 1: DASHBOARD ---
function renderEstado1(data) {
    document.getElementById('entreno-state-0').classList.add('hidden');
    const state1 = document.getElementById('entreno-state-1');
    state1.classList.remove('hidden');
    state1.style.animation = "slideUp 0.5s ease forwards";

    generarCalendarioScrollable();

    rutinasArrayMem = [];
    if (data.lib_entrenos) {
        rutinasArrayMem = Array.isArray(data.lib_entrenos) ? data.lib_entrenos : [data.lib_entrenos];
    }

    iniciarGrafico();
    configurarDropdownsReales();
    
    // ESCUDO 1: Si los logs vienen vacíos como objeto, los forzamos a ser un Array para que no pete luego
    if (!Array.isArray(userDataLogsCrudos)) {
        userDataLogsCrudos = [];
    }

    actualizarTextoBotonPrincipal();

    const botonPrincipal = document.getElementById('btn-main-action');
    botonPrincipal.onclick = () => {
        // ESCUDO 2: Comprobamos la fecha con y sin el "0" inicial por si acaso
        const hoyObj = new Date();
        const str1 = `${String(hoyObj.getDate()).padStart(2, '0')}/${String(hoyObj.getMonth() + 1).padStart(2, '0')}/${hoyObj.getFullYear()}`;
        const str2 = `${hoyObj.getDate()}/${hoyObj.getMonth() + 1}/${hoyObj.getFullYear()}`;
        
        let indexParaReanudar = -1;
        
        const logsHoy = userDataLogsCrudos.filter(l => l.Date && (l.Date.trim() === str1 || l.Date.trim() === str2));
        
        if (logsHoy.length > 0) {
            const logValido = logsHoy.find(l => l.Train_ID && l.Train_ID.trim() !== "");
            if (logValido) {
                const nombreBusc = logValido.Train_ID.trim().toLowerCase();
                indexParaReanudar = rutinasArrayMem.findIndex(r => r.Train_ID && r.Train_ID.trim().toLowerCase() === nombreBusc);
            }
            // Si por algún motivo el nombre de la rutina tiene espacios raros, forzamos abrir la primera
            if (indexParaReanudar === -1) indexParaReanudar = 0; 
        }

        // Si detecta que hay un índice de hoy, corta la función y salta a editar
        if (indexParaReanudar !== -1) {
            if (typeof reanudarEntrenamiento === 'function') {
                reanudarEntrenamiento(indexParaReanudar);
            }
            return; 
        }

        // --- FLUJO NORMAL DE SELECCIONAR RUTINA ---
        document.getElementById('entreno-state-1').classList.add('hidden');
        document.getElementById('entreno-state-selector').classList.remove('hidden');
        
        const containerBotones = document.getElementById('routine-buttons-cascade');
        containerBotones.innerHTML = '';
        
        rutinasArrayMem.forEach((r, idx) => {
            const btn = document.createElement('div');
            btn.className = 'btn-routine-cascade';
            btn.style.animationDelay = `${idx * 0.1}s`;
            btn.innerText = r.Train_ID || `Rutina ${idx + 1}`;
            
            btn.onclick = () => {
                // Post Silencioso
                fetch(WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orden: "crear_rutina", Train_ID: r.Train_ID })
                })
                .then(res => res.json())
                .then(data => {
                    // ESCUDO 3: Aquí estaba el crash. Si userDataLogsCrudos no era array, petaba y el botón se rompía.
                    const logsPrevios = Array.isArray(userDataLogsCrudos) ? userDataLogsCrudos : [];
                    
                    if (Array.isArray(data) && data.length > 0 && data[0].row_number) {
                        userDataLogsCrudos = [...logsPrevios, ...data];
                    } else if (data && data[0] && data[0].log_entrenos) {
                        userDataLogsCrudos = data[0].log_entrenos;
                    }
                    actualizarTextoBotonPrincipal(); // Refrescamos el texto de inmediato
                }).catch(e => console.log("Post silencioso falló."));

                iniciarModoCartas(idx);
            };
            containerBotones.appendChild(btn);
        });
    };
}
// --- DROPDOWNS REALES ---
function configurarDropdownsReales() {
    const btnRoutine = document.getElementById('btn-select-routine');
    const menuRoutine = document.getElementById('menu-routine');
    const btnExercise = document.getElementById('btn-select-exercise');
    const menuExercise = document.getElementById('menu-exercise');
    const btnTimeframe = document.getElementById('btn-select-timeframe');
    const menuTimeframe = document.getElementById('menu-timeframe');

    function toggleMenu(btn, menu) {
        document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.add('hidden'));
        document.querySelectorAll('.custom-select-btn').forEach(b => b.classList.remove('open'));
        if (menu.classList.contains('hidden')) {
            menu.classList.remove('hidden');
            btn.classList.add('open');
        }
    }

    menuRoutine.innerHTML = '';
    if(rutinasArrayMem.length === 0) {
        btnRoutine.querySelector('.sel-text').innerText = "Sin rutinas";
    } else {
        rutinasArrayMem.forEach((r, i) => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.innerText = r.Train_ID || `Rutina ${i+1}`;
            item.onclick = () => {
                dashboardState.rutinaIndex = i;
                btnRoutine.querySelector('.sel-text').innerText = item.innerText;
                menuRoutine.classList.add('hidden');
                btnRoutine.classList.remove('open');
                actualizarMenuEjercicios();
            };
            menuRoutine.appendChild(item);
        });
    }

    btnRoutine.onclick = (e) => { e.stopPropagation(); toggleMenu(btnRoutine, menuRoutine); };
    btnExercise.onclick = (e) => { e.stopPropagation(); toggleMenu(btnExercise, menuExercise); };

    function actualizarMenuEjercicios() {
        menuExercise.innerHTML = '';
        const rutina = rutinasArrayMem[dashboardState.rutinaIndex];
        let primerEjercicioSeteado = false;

        if (rutina) {
            for (let i = 1; i <= 8; i++) {
                const nombreEj = rutina[`E_0${i}`];
                if (nombreEj && nombreEj.trim() !== "") {
                    if(!primerEjercicioSeteado) {
                        dashboardState.ejercicio = `E_0${i}`;
                        btnExercise.querySelector('.sel-text').innerText = nombreEj;
                        primerEjercicioSeteado = true;
                    }
                    const item = document.createElement('div');
                    item.className = 'dropdown-item';
                    item.innerText = nombreEj;
                    item.onclick = () => {
                        dashboardState.ejercicio = `E_0${i}`;
                        btnExercise.querySelector('.sel-text').innerText = nombreEj;
                        menuExercise.classList.add('hidden');
                        btnExercise.classList.remove('open');
                        actualizarGrafico();
                    };
                    menuExercise.appendChild(item);
                }
            }
        }
        if(!primerEjercicioSeteado) btnExercise.querySelector('.sel-text').innerText = "Sin ejercicios";
        actualizarGrafico();
    }

    document.querySelectorAll('#menu-timeframe .dropdown-item').forEach(item => {
        item.onclick = () => {
            dashboardState.timeframe = item.getAttribute('data-val');
            btnTimeframe.querySelector('.sel-text').innerText = item.innerText;
            menuTimeframe.classList.add('hidden');
            btnTimeframe.classList.remove('open');
            actualizarGrafico();
        };
    });

    btnTimeframe.onclick = (e) => { e.stopPropagation(); toggleMenu(btnTimeframe, menuTimeframe); };

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown-container')) {
            document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.add('hidden'));
            document.querySelectorAll('.custom-select-btn').forEach(b => b.classList.remove('open'));
        }
    });

    if (rutinasArrayMem.length > 0) {
        dashboardState.rutinaIndex = 0;
        btnRoutine.querySelector('.sel-text').innerText = rutinasArrayMem[0].Train_ID || "Rutina 1";
        actualizarMenuEjercicios();
    }
}


// --- CALENDARIO TEXTO DINÁMICO Y CENTRADO EN LUNES ---
function actualizarHeaderCalendario(fechaSeleccionada) {
    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const dias = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const seleccion = new Date(fechaSeleccionada);
    seleccion.setHours(0, 0, 0, 0);

    const diffTime = seleccion.getTime() - hoy.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    let prefijo = "";
    if (diffDays === 0) prefijo = "Hoy, ";
    else if (diffDays === -1) prefijo = "Ayer, ";
    else if (diffDays === 1) prefijo = "Mañana, ";

    const nombreDia = dias[seleccion.getDay()];
    const numeroDia = seleccion.getDate();
    const nombreMes = meses[seleccion.getMonth()];

    document.getElementById('calendar-header').innerText = `${prefijo}${nombreDia} ${numeroDia} de ${nombreMes}`;
}

function generarCalendarioScrollable() {
    const calendarEl = document.getElementById('week-calendar');
    calendarEl.innerHTML = '';
    
    const hoy = new Date();
    const nombresDias = ["D", "L", "M", "X", "J", "V", "S"];

    let elementoLunesActual = null;

    for (let i = -30; i <= 15; i++) {
        let fechaDia = new Date();
        fechaDia.setDate(hoy.getDate() + i);
        let esHoy = i === 0;
        
        // Comprobamos si existe algún log para este día exacto
        const dStr = String(fechaDia.getDate()).padStart(2, '0');
        const mStr = String(fechaDia.getMonth() + 1).padStart(2, '0');
        const yStr = fechaDia.getFullYear();
        const fechaString = `${dStr}/${mStr}/${yStr}`;
        
        let entrenado = false;
        if (userDataLogsCrudos && Array.isArray(userDataLogsCrudos)) {
            entrenado = userDataLogsCrudos.some(log => log.Date === fechaString);
        }
        
        const dayDiv = document.createElement('div');
        // Si ha entrenado, le añadimos la clase 'trained'
        dayDiv.className = `cal-day ${esHoy ? 'active today-marker' : ''} ${entrenado ? 'trained' : ''}`;
        dayDiv.innerHTML = `
            <span class="cal-name">${nombresDias[fechaDia.getDay()]}</span>
            <div class="cal-num">${fechaDia.getDate()}</div>
            <div class="cal-check">✓</div>
        `;

        if (i <= 0 && i >= -6 && fechaDia.getDay() === 1) {
            elementoLunesActual = dayDiv;
        }

        if (esHoy) {
            actualizarHeaderCalendario(fechaDia);
        }

        dayDiv.onclick = () => {
            document.querySelectorAll('.cal-day').forEach(el => el.classList.remove('active'));
            dayDiv.classList.add('active');
            actualizarHeaderCalendario(fechaDia);
        };

        calendarEl.appendChild(dayDiv);
    }

    setTimeout(() => {
        if (elementoLunesActual) {
            calendarEl.scrollLeft = elementoLunesActual.offsetLeft - 15;
        }
    }, 100);
}


// --- LÓGICA DE CHART.JS ---
function iniciarGrafico() {
    if (typeof Chart === 'undefined') {
        console.error("Chart.js no ha cargado. Revisa la conexión o etiqueta <script>.");
        return;
    }

    const ctx = document.getElementById('progress-chart').getContext('2d');
    if(progressChart) progressChart.destroy();

    progressChart = new Chart(ctx, {
        type: 'line',
        data: { labels: [], datasets: [] },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { display: false }, border: { display: false } },
                x: { grid: { display: false }, border: { display: false } }
            }
        }
    });
}

function actualizarGrafico() {
    const nombreRutina = rutinasArrayMem[dashboardState.rutinaIndex]?.Train_ID;
    
    // Llamada al motor gráfico externo
    renderizarGrafico(
        userDataLogsCrudos, 
        nombreRutina, 
        dashboardState.ejercicio, 
        dashboardState.timeframe
    );
}

// Eventos de los botones KG / %
document.getElementById('btn-mode-kg').onclick = (e) => {
    document.querySelectorAll('.chart-toggle').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    currentChartMode = 'kg';
    actualizarGrafico();
};
document.getElementById('btn-mode-int').onclick = (e) => {
    document.querySelectorAll('.chart-toggle').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    currentChartMode = 'int';
    actualizarGrafico();
};

// --- FORMULARIO Y CATÁLOGO DE CREACIÓN ---
function limpiarDatosFormulario() {
    rutinaActual = { nombre: "", color: "", ejercicios: [] };
    document.getElementById('routine-name').value = '';
    document.querySelectorAll('.color-circle').forEach(c => c.classList.remove('active'));
    const container = document.getElementById('exercise-pills-container');
    container.querySelectorAll('.exercise-pill:not(#btn-add-exercise)').forEach(p => p.remove());
    document.getElementById('exercise-counter').innerText = '0/8';
    document.getElementById('btn-add-exercise').classList.remove('hidden');
    document.getElementById('step-color').classList.add('hidden');
    document.getElementById('step-exercises').classList.add('hidden');
    document.getElementById('btn-save-routine').classList.add('hidden');
}

function prepararFormularioCreacion() {
    const btnStart = document.getElementById('btn-start-routine');
    const state0 = document.getElementById('entreno-state-0');
    const formContainer = document.getElementById('entreno-form');
    const navBg = document.getElementById('nav-bg'); 
    
    btnStart.onclick = () => {
        state0.classList.add('hidden'); 
        navBg.classList.add('expanded'); 
        setTimeout(() => formContainer.classList.remove('hidden'), 150);
    };

    document.getElementById('btn-close-form').onclick = () => {
        formContainer.classList.add('fade-out-form'); 
        navBg.classList.remove('expanded');
        setTimeout(() => {
            formContainer.classList.add('hidden');
            formContainer.classList.remove('fade-out-form');
            limpiarDatosFormulario();
            state0.classList.remove('hidden'); 
        }, 300); 
    };

    document.getElementById('routine-name').addEventListener('input', (e) => {
        rutinaActual.nombre = e.target.value;
        if (e.target.value.length >= 3) { document.getElementById('step-color').classList.remove('hidden'); }
    });

    document.querySelectorAll('.color-circle').forEach(circle => {
        circle.onclick = (e) => {
            document.querySelectorAll('.color-circle').forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            rutinaActual.color = e.target.getAttribute('data-color');
            document.getElementById('step-exercises').classList.remove('hidden');
        };
    });

    document.getElementById('btn-add-exercise').onclick = abrirCatalogoParaCrear;
    
    document.getElementById('sheet-overlay').onclick = () => {
        document.getElementById('bottom-sheet').classList.add('hidden');
    };

    document.getElementById('btn-save-routine').onclick = guardarRutina;
}

async function guardarRutina() {
    const btnSave = document.getElementById('btn-save-routine');
    btnSave.innerText = "GUARDANDO...";
    btnSave.disabled = true;

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orden: "CREAR_RUTINA", rutina: { nombre: rutinaActual.nombre, color: rutinaActual.color, ejercicios: rutinaActual.ejercicios } })
        });
        const resData = await response.json();

        if (resData && resData[0] && resData[0].Train_ID) {
            btnSave.style.backgroundColor = "#34C759"; 
            btnSave.style.color = "#FFF";
            btnSave.innerText = "¡RUTINA CREADA!";

            setTimeout(() => {
                document.getElementById('entreno-form').classList.add('fade-out-form'); 
                document.getElementById('nav-bg').classList.remove('expanded'); 
                
                setTimeout(() => {
                    document.getElementById('entreno-form').classList.add('hidden');
                    document.getElementById('entreno-form').classList.remove('fade-out-form');
                    limpiarDatosFormulario();
                    document.getElementById('entreno-state-0').classList.add('hidden'); 
                    renderEstado1({ lib_entrenos: resData[0], log_entrenos: {} });

                    btnSave.style = ""; btnSave.innerText = "GUARDAR RUTINA"; btnSave.disabled = false;
                }, 300);
            }, 1000);
        }
    } catch(error) {
        btnSave.innerText = "ERROR - REINTENTAR";
        btnSave.disabled = false;
    }
}

function procesarCatalogoParaCrear(textoCrudo) {
    window.catalogoCrudo = textoCrudo; 
    
    document.getElementById('search-exercise').addEventListener('input', (e) => {
        const text = e.target.value.toLowerCase();
        document.querySelectorAll('.cat-item').forEach(item => {
            if (item.innerText.toLowerCase().includes(text)) item.style.display = 'block';
            else item.style.display = 'none';
        });
        document.querySelectorAll('.cat-header').forEach(header => {
            let next = header.nextElementSibling;
            let hasVisible = false;
            while(next && next.classList.contains('cat-item')) {
                if(next.style.display !== 'none') hasVisible = true;
                next = next.nextElementSibling;
            }
            header.style.display = hasVisible ? 'block' : 'none';
        });
    });
}

function abrirCatalogoParaCrear() {
    document.getElementById('sheet-title').innerText = "Catálogo";
    document.getElementById('search-exercise').classList.remove('hidden'); 
    document.getElementById('search-exercise').value = '';

    const bloques = window.catalogoCrudo.split('\n\n');
    const listaHtml = document.getElementById('catalog-list');
    listaHtml.innerHTML = '';
    bloques.forEach(bloque => {
        const lineas = bloque.split('\n');
        listaHtml.insertAdjacentHTML('beforeend', `<div class="cat-header">${lineas[0]}</div>`);
        for (let i = 1; i < lineas.length; i++) {
            const nombreEjercicio = lineas[i].split('|')[0].trim();
            const div = document.createElement('div');
            div.className = 'cat-item';
            div.innerText = nombreEjercicio;
            div.onclick = () => añadirEjercicio(nombreEjercicio);
            listaHtml.appendChild(div);
        }
    });

    document.getElementById('bottom-sheet').classList.remove('hidden');
}

function añadirEjercicio(nombre) {
    if (rutinaActual.ejercicios.length >= 8) return; 
    rutinaActual.ejercicios.push(nombre);
    document.getElementById('bottom-sheet').classList.add('hidden');
    
    const container = document.getElementById('exercise-pills-container');
    const btnAdd = document.getElementById('btn-add-exercise');
    const pill = document.createElement('div');
    pill.className = 'exercise-pill';
    pill.innerHTML = `<span>${nombre}</span> <button class="btn-delete-pill">✕</button>`;
    
    pill.onclick = (e) => {
        if (e.target.closest('.btn-delete-pill')) {
            rutinaActual.ejercicios.splice(rutinaActual.ejercicios.indexOf(nombre), 1);
            pill.remove();
            document.getElementById('exercise-counter').innerText = `${rutinaActual.ejercicios.length}/8`;
            if (rutinaActual.ejercicios.length === 0) document.getElementById('btn-save-routine').classList.add('hidden');
            if (rutinaActual.ejercicios.length < 8) btnAdd.classList.remove('hidden');
            return;
        }
        document.querySelectorAll('.exercise-pill:not(.dotted)').forEach(p => p.classList.remove('delete-mode'));
        pill.classList.add('delete-mode');
    };
    container.insertBefore(pill, btnAdd);
    document.getElementById('exercise-counter').innerText = `${rutinaActual.ejercicios.length}/8`;
    if (rutinaActual.ejercicios.length >= 8) btnAdd.classList.add('hidden');
    document.getElementById('btn-save-routine').classList.remove('hidden');
}
function actualizarTextoBotonPrincipal() {
    const hoyObj = new Date();
    const hoyStr = `${String(hoyObj.getDate()).padStart(2, '0')}/${String(hoyObj.getMonth() + 1).padStart(2, '0')}/${hoyObj.getFullYear()}`; 
    
    let entrenadoHoy = false;
    
    if (userDataLogsCrudos && Array.isArray(userDataLogsCrudos)) {
        const logsHoy = userDataLogsCrudos.filter(log => log.Date === hoyStr);
        // Si hay al menos un registro hoy con una rutina válida, cambiamos el texto
        const logValido = logsHoy.find(l => l.Train_ID && l.Train_ID.trim() !== "");
        if (logValido) entrenadoHoy = true;
    }
    
    const btn = document.getElementById('btn-main-action');
    if (btn) {
        btn.innerText = entrenadoHoy ? "EDITAR ENTRENAMIENTO" : "COMENZAR ENTRENAMIENTO";
    }
}