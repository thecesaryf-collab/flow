// entrenos.js - DISEÑO DISRUPTIVO ULTRA PREMIUM 2026 - V2 (FIXED)
// Configuración
const USERNAME = localStorage.getItem('flow_mini_user');
const WEBHOOK_URL = 'https://automations-n8n.b8vwcm.easypanel.host/webhook/FLOW_mini';
const COLORS = [
  // --- GRUPO 1: Muy Vibrantes y Saturados ---
  '#E06C3E', // 1er Terracota
    '#E88E66', // 2do Terracota
    '#F8D4B7', // 4to Terracota
  '#F25600', // 1er Naranja rojizo
    '#F57833', // 2do Naranja rojizo
    '#FBBD99', // 4to Naranja rojizo
  '#FF9900', // 1er Amarillo anaranjado
 
  '#FCD18F', // 2do Amarillo
  
  
  '#FFF0CC'  // 4to Amarillo anaranjado
];

let state = {
    libExercises: [], libRoutines: [], logs: [], currentView: 'day', referenceDate: new Date(),
    editingRoutineId: null, activeWorkout: null, workoutExercises: [], currentCardIndex: 0,
    logViewMode: 'mosaic' 
};
let currentRoutine = { nombre: '', color: null, ejercicios: [] };
let originalRoutineStr = ""; 

async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 15000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    if (!options.headers) {
        options.headers = { 'Content-Type': 'application/json' };
    }

    const response = await fetch(resource, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
}

function getLocalISODate(date) { const offset = date.getTimezoneOffset(); return new Date(date.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0]; }
function getMonday(d) { d = new Date(d); const day = d.getDay(), diff = d.getDate() - day + (day === 0 ? -6 : 1); return new Date(d.setDate(diff)); }

document.addEventListener('DOMContentLoaded', async () => { 
    setupUIEvents(); 
    renderPicker(); 
    setupDeleteSwitch();
    await syncData(); 
    document.addEventListener('click', (e) => {
        if(!e.target.closest('.log-actions-menu-container')) {
            document.querySelectorAll('.log-dropdown').forEach(m => m.classList.add('hidden'));
            document.querySelectorAll('.library-acc').forEach(acc => acc.classList.remove('menu-open'));
        }
    });
});

async function syncData() {
    try {
        const response = await fetchWithTimeout(WEBHOOK_URL, { 
            method: 'POST', 
            body: JSON.stringify({ action: "syncro_entrenos", user: USERNAME }) 
        });
        const rawData = await response.json(); 
        const payload = rawData[0] || {}; 

        // --- SOLUCIÓN: Filtrar datos vacíos antes de cargarlos al estado ---
        
        // 1. Filtrar ejercicios: Asegurar que tengan ID y nombre
        state.libExercises = Array.isArray(payload.lib_ej) 
            ? payload.lib_ej.filter(e => e.ID_ejercicio && e.Nombre_ejercicio) 
            : [];

        // 2. Filtrar rutinas: Asegurar que tengan ID y nombre
        state.libRoutines = Array.isArray(payload.lib_entrenos) 
            ? payload.lib_entrenos.filter(r => r.ID_entreno && r.Nombre_rutina) 
            : [];

        // 3. Filtrar logs: Asegurar que tengan ID de entreno y fecha
        state.logs = Array.isArray(payload.log_entrenos) 
            ? payload.log_entrenos.filter(l => l.ID_entreno && l.Fecha_log_entreno) 
            : [];

        checkTodayWorkout();
    } catch (e) { showToast("Error sincronizando (Timeout/Red)"); }
}

function toggleFab() {
    document.getElementById('fab-menu').classList.toggle('open');
    document.getElementById('fab-main').classList.toggle('active');
    const overlay = document.getElementById('fab-overlay');
    if (overlay.classList.contains('hidden')) {
        overlay.classList.remove('hidden'); setTimeout(() => overlay.classList.add('show'), 10);
    } else {
        overlay.classList.remove('show'); setTimeout(() => overlay.classList.add('hidden'), 300);
    }
}

function checkTodayWorkout() {
    const todayStr = getLocalISODate(new Date());
    const refStr = getLocalISODate(state.referenceDate);

    const todayLogs = state.logs.filter(l => l.Fecha_log_entreno === todayStr);
    let isWorkoutCompleted = false;

    if (todayLogs.length > 0) {
        const rutinaId = todayLogs[0].ID_entreno;
        const rData = state.libRoutines.find(r => r.ID_entreno === rutinaId);
        let totalEx = 0;
        if (rData) {
            for(let i=1; i<=15; i++) { if(rData[`Ejercicio_${String(i).padStart(2,'0')}`]) totalEx++; }
            if (totalEx === 0 && Array.isArray(rData.ejercicios)) totalEx = rData.ejercicios.length;
        }
        
        const completedEx = todayLogs.filter(l => l.Log_peso_serie_01 !== null || l.Log_repes_serie_01 !== null).length;

        if (completedEx < totalEx) {
            state.activeWorkout = rutinaId;
            state.currentCardIndex = completedEx;
        } else {
            state.activeWorkout = null;
            if (totalEx > 0) isWorkoutCompleted = true;
        }
    }

    const fabItem = document.querySelector('.fab-item[onclick*="forceStartWorkout"]');
    if (fabItem) {
        const fabLabel = fabItem.querySelector('.fab-label');
        
        if (isWorkoutCompleted) {
            if(fabLabel) fabLabel.innerText = "Entreno completado";
            fabItem.style.pointerEvents = 'none';
            fabItem.style.opacity = '0.5';
        } else {
            if(fabLabel) fabLabel.innerText = state.activeWorkout ? "Continuar entrenamiento" : "Iniciar entrenamiento";
            fabItem.style.pointerEvents = 'auto';
            fabItem.style.opacity = '1';
        }
    }

    if (state.currentView === 'day') {
        if (todayStr === refStr && todayLogs.length === 0 && !state.activeWorkout) {
            showStartScreen(false);
        } else { skipToLogs(); }
    } else { skipToLogs(); }
}

function showStartScreen(isPast) {
    document.getElementById('start-screen').classList.remove('hidden');
    document.getElementById('logs-screen').classList.add('hidden');
    document.getElementById('fab-container').classList.add('hidden');
    document.getElementById('view-toggles').classList.add('hidden');
    document.getElementById('picker-container').classList.add('hidden');
    
    const titleEl = document.querySelector('.start-title');
    if(isPast) {
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const dayName = days[state.referenceDate.getDay()];
        titleEl.innerText = `¿Qué entrenaste el ${dayName}?`;
    } else {
        titleEl.innerText = "¿Qué toca hoy?";
    }
    renderStartButtons();
}



function skipToLogs() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('logs-screen').classList.remove('hidden');
    document.getElementById('fab-container').classList.remove('hidden');
    document.getElementById('view-toggles').classList.remove('hidden');
    document.getElementById('picker-container').classList.remove('hidden');
    
    renderPicker(); 
    renderLogs();
}

function openPastWorkout() {
    showStartScreen(true);
}

function forceStartWorkout() {
    if (state.activeWorkout) { 
        const completedCount = state.currentCardIndex || 0;
        continueWorkout(state.activeWorkout, completedCount);
    } else {
        state.referenceDate = new Date(); state.currentView = 'day';
        document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('btn-day').classList.add('active');
        renderPicker();
        showStartScreen(false);
    }
}

async function continueWorkout(routineId, completedCount) {
    state.activeWorkout = routineId;
    const rData = state.libRoutines.find(r => r.ID_entreno === routineId);
    
    if(!rData) {
        showToast("Error: Rutina no encontrada");
        return;
    }
    
    state.workoutExercises = [];
    
    for(let i=1; i<=15; i++) {
        const exId = rData[`Ejercicio_${String(i).padStart(2,'0')}`];
        if(exId && typeof exId === 'string' && exId.trim() !== "") {
            const exInfo = state.libExercises.find(e => e.ID_ejercicio === exId);
            if(exInfo) state.workoutExercises.push(exInfo);
        }
    }
    
    if (state.workoutExercises.length === 0 && Array.isArray(rData.ejercicios)) {
        rData.ejercicios.forEach(ex => {
            const exInfo = state.libExercises.find(e => e.ID_ejercicio === (ex.ID_ejercicio || ex));
            if (exInfo) state.workoutExercises.push(exInfo);
        });
    }
    
    state.currentCardIndex = completedCount; 
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('logs-screen').classList.add('hidden');
    document.getElementById('deck-container').classList.remove('hidden');
    
    renderDeck();
}

function goToDayLog(dateStr) {
    state.referenceDate = new Date(dateStr); state.currentView = 'day';
    document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('btn-day').classList.add('active');
    renderPicker(); checkTodayWorkout();
}

function renderStartButtons() {
    const container = document.getElementById('routines-buttons'); container.innerHTML = '';
    if (state.libRoutines.length === 0) { container.innerHTML = `<button class="btn-routine-start" onclick="openCreateForm()" style="justify-content:center;">Nueva rutina</button>`; return; }
    
    const uniqueRoutines = Array.from(new Set(state.libRoutines.map(r => r.ID_entreno))).map(id => state.libRoutines.find(r => r.ID_entreno === id));
    uniqueRoutines.forEach((r, index) => { 
        container.innerHTML += `<button class="btn-routine-start" style="--routine-color: #${r.Color_rutina}; animation-delay: ${index * 0.1}s;" onclick="startWorkout('${r.ID_entreno}')">${r.Nombre_rutina}</button>`; 
    });
}

function changeView(view) { state.currentView = view; document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active')); document.getElementById(`btn-${view}`).classList.add('active'); renderPicker(); checkTodayWorkout(); }
function updateReference(dateStr, el) { state.referenceDate = new Date(dateStr); renderPicker(); checkTodayWorkout(); }

function renderPicker() {
    const container = document.getElementById('picker-container'); container.innerHTML = ''; const d = new Date(state.referenceDate);
    const mNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    if (state.currentView === 'day') {
        const daysNames = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
        for (let i = -14; i <= 0; i++) {
            let tempD = new Date(d); tempD.setDate(new Date().getDate() + i);
            const isSelected = getLocalISODate(tempD) === getLocalISODate(state.referenceDate);
            container.innerHTML += `<div class="day-item ${isSelected ? 'active' : ''}" onclick="updateReference('${tempD.toISOString()}', this)"><span class="day-num">${tempD.getDate()}</span><span class="day-name">${daysNames[tempD.getDay()]}</span></div>`;
        }
    } else if (state.currentView === 'week') {
        const currentMonday = getMonday(new Date());
        for (let i = -5; i <= 0; i++) {
            const start = new Date(currentMonday); start.setDate(start.getDate() + (i * 7)); const end = new Date(start); end.setDate(end.getDate() + 6);
            const isSelected = getLocalISODate(getMonday(state.referenceDate)) === getLocalISODate(start);
            
            let weekLabel = start.getMonth() === end.getMonth() 
                ? `Semana del ${start.getDate()} al ${end.getDate()} de ${mNames[start.getMonth()]}`
                : `Sem del ${start.getDate()} de ${mNames[start.getMonth()].substring(0,3)} al ${end.getDate()} de ${mNames[end.getMonth()].substring(0,3)}`;

            container.innerHTML += `<div class="period-item ${isSelected ? 'active' : ''}" onclick="updateReference('${start.toISOString()}', this)">${weekLabel}</div>`;
        }
    } else if (state.currentView === 'month') {
        for (let i = -6; i <= 0; i++) {
            const tempD = new Date(); tempD.setDate(1); tempD.setMonth(tempD.getMonth() + i);
            const isSelected = tempD.getMonth() === state.referenceDate.getMonth() && tempD.getFullYear() === state.referenceDate.getFullYear();
            container.innerHTML += `<div class="period-item ${isSelected ? 'active' : ''}" onclick="updateReference('${tempD.toISOString()}', this)">${mNames[tempD.getMonth()]} ${tempD.getFullYear()}</div>`;
        }
    }
    setTimeout(() => { const activeEl = container.querySelector('.active'); if(activeEl) activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }); }, 50);
}

function toggleLogMenu(id, event) {
    if(event) event.stopPropagation();
    const menu = document.getElementById(`log-menu-${id}`);
    const isHidden = menu.classList.contains('hidden');
    document.querySelectorAll('.log-dropdown').forEach(m => m.classList.add('hidden')); 
    if(isHidden) menu.classList.remove('hidden');
}


function toggleLogViewMode() {
    state.logViewMode = state.logViewMode === 'mosaic' ? 'list' : 'mosaic';
    renderLogs();
}

function shortenName(name) {
    if(!name) return "";
    let clean = name.replace(/\s*\([^)]*\)/g, '').trim(); 
    let words = clean.split(/\s+/);
    let filtered = words.filter(w => w.length > 3);
    if(filtered.length === 0) return clean; 
    return filtered.join(' ');
}

function calculateRows(totalCount) {
    if (totalCount <= 4) return [totalCount];
    if (totalCount === 5) return [3, 2]; /* <--- NUEVO: Reparto homogéneo para 5 ítems */
    if (totalCount === 6) return [3, 3];
    if (totalCount === 8) return [4, 4];
    if (totalCount === 9) return [3, 3, 3];
    if (totalCount === 10) return [4, 3, 3];
    
    let rows = [];
    let remaining = totalCount;
    while (remaining > 0) {
        if (remaining === 6) { rows.push(3, 3); break; }
        if (remaining === 8) { rows.push(4, 4); break; }
        let take = Math.min(4, remaining);
        rows.push(take);
        remaining -= take;
    }
    return rows;
}

function freezeGif(imgElement) {
    if (!imgElement) return;
    const src = imgElement.src;
    if (!src || src.startsWith('data:')) return;
    
    const img = new Image();
    img.crossOrigin = "anonymous"; 
    img.src = src;
    img.onload = function() {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || img.width;
            canvas.height = img.naturalHeight || img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            imgElement.src = canvas.toDataURL('image/jpeg', 0.85);
        } catch (e) {
            
        }
    };
}

function selectMosaic(rutinaId, overallIndex, rowIndex) {
    const container = document.getElementById(`mosaic-container-${rutinaId}`);
    const clickedThumb = document.getElementById(`m-thumb-${rutinaId}-${overallIndex}`);
    const targetBody = document.getElementById(`m-body-${rutinaId}-${overallIndex}`);
    
    const isActive = clickedThumb.classList.contains('active');

    container.classList.remove('has-active');
    container.querySelectorAll('.mosaic-row').forEach(r => r.classList.remove('row-has-active', 'row-fade-out'));
    container.querySelectorAll('.mosaic-thumb-wrapper').forEach(el => el.classList.remove('active', 'fade-out'));
    container.querySelectorAll(`[id^="m-body-${rutinaId}"]`).forEach(el => el.classList.remove('open'));

    if (!isActive) {
        container.classList.add('has-active');
        const activeRow = document.getElementById(`mosaic-row-${rutinaId}-${rowIndex}`);
        activeRow.classList.add('row-has-active');
        
        container.querySelectorAll('.mosaic-row').forEach(r => {
            if (r.id !== activeRow.id) r.classList.add('row-fade-out');
        });

        clickedThumb.classList.add('active');
        
        activeRow.querySelectorAll('.mosaic-thumb-wrapper').forEach(el => {
            if (el.id !== clickedThumb.id) el.classList.add('fade-out');
        });
        
        setTimeout(() => {
            if (clickedThumb.classList.contains('active')) {
                targetBody.classList.add('open');
            }
        }, 250);
    }
}

function renderLogs() {
    const container = document.getElementById('logs-container'); container.innerHTML = '';
    if (state.currentView === 'day') {
        const dayLogs = state.logs.filter(l => l.Fecha_log_entreno === getLocalISODate(state.referenceDate));
        if(dayLogs.length === 0) { 
            const todayStr = getLocalISODate(new Date());
            const refStr = getLocalISODate(state.referenceDate);
            if(todayStr === refStr) {
                container.innerHTML = '<div class="empty-state">No hay registros hoy.</div>'; 
            } else {
                container.innerHTML = `
                <div class="empty-state" style="margin-top: 40px;">
                    <div style="font-size: 20px; color: var(--text-secondary); margin-bottom: 20px;">No hay registros</div>
                    <button class="btn-primary" style="max-width: 250px;" onclick="openPastWorkout()">Añadir entreno</button>
                </div>`;
            }
            return; 
        }
        
        const validLog = dayLogs.find(l => state.libRoutines.some(r => r.ID_entreno === l.ID_entreno)) || dayLogs[0];
        const rutinaId = validLog.ID_entreno;
        const rData = state.libRoutines.find(r => r.ID_entreno === rutinaId);
        const rColor = rData ? rData.Color_rutina : "FF9500";
        
        let totalEx = 0;
        if (rData) {
            for(let i=1; i<=15; i++) { if(rData[`Ejercicio_${String(i).padStart(2,'0')}`]) totalEx++; }
            if (totalEx === 0 && Array.isArray(rData.ejercicios)) totalEx = rData.ejercicios.length;
        }

        const completedEx = dayLogs.filter(l => l.Log_peso_serie_01 !== null || l.Log_repes_serie_01 !== null).length;
        const isCompleted = (completedEx >= totalEx) && (totalEx > 0);

        if (!isCompleted && getLocalISODate(state.referenceDate) === getLocalISODate(new Date())) {
            container.innerHTML = `
            <div class="routine-group" style="--routine-color: #${rColor}; text-align: center; padding: 40px 20px;">
                <div style="font-size: 26px; font-weight: 800; margin-bottom: 15px; color: var(--text-primary);">${rData ? rData.Nombre_rutina : "Entrenamiento"}</div>
                <div style="display: flex; align-items: center; justify-content: center; gap: 10px; color: var(--text-secondary); font-size: 18px; font-weight: 700; margin-bottom: 30px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    En proceso... (${completedEx}/${totalEx})
                </div>
                <button class="btn-primary" onclick="continueWorkout('${rutinaId}', ${completedEx})">Continuar entrenamiento</button>
            </div>`;
            return; 
        }

        let html = `
        <div class="routine-group" data-id="${rutinaId}" style="--routine-color: #${rColor};">
            <div class="log-header-top">
                <div class="log-routine-title">${rData ? rData.Nombre_rutina : "Entrenamiento"}</div>
                
                <div style="display: flex; align-items: center; gap: 10px;">
                    <button class="log-action-btn" onclick="toggleLogViewMode()" style="color: var(--text-primary); opacity: 0.85;">
                        ${state.logViewMode === 'mosaic' 
                            ? `<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="21" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>`
                            : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="3" width="7" height="7" rx="1.5"></rect><rect x="3" y="14" width="7" height="7" rx="1.5"></rect><rect x="14" y="14" width="7" height="7" rx="1.5"></rect></svg>`
                        }
                    </button>
                    
                    <div id="log-actions-${rutinaId}" class="log-actions-menu-container">
                        <button class="log-action-btn" onclick="toggleLogMenu('${rutinaId}', event)">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"></circle><circle cx="12" cy="5" r="2"></circle><circle cx="12" cy="19" r="2"></circle></svg>
                        </button>
                        <div id="log-menu-${rutinaId}" class="log-dropdown hidden">
                            <div class="log-dropdown-item" onclick="enableEditLog('${rutinaId}'); toggleLogMenu('${rutinaId}')">Editar entrenamiento</div>
                            <div class="log-dropdown-item delete" onclick="deleteLogEntry('${rutinaId}'); toggleLogMenu('${rutinaId}')">Eliminar entrenamiento</div>
                        </div>
                    </div>
                </div>
            </div>`;
        
        let listHtml = '';
        let validLogsList = [];

        dayLogs.forEach((log, index) => {
            let setsHtml = ''; let validSets = 0;
            let exName = `Ejercicio ${index+1}`;
            let exInfo = null;
            if(rData) {
                const exId = rData[`Ejercicio_${String(index+1).padStart(2,'0')}`];
                exInfo = state.libExercises.find(e => e.ID_ejercicio === exId);
                if(exInfo) exName = exInfo.Nombre_ejercicio;
            }

            for(let i=1; i<=5; i++) {
                const kg = parseInt(log[`Log_peso_serie_0${i}`] || 0), reps = parseInt(log[`Log_repes_serie_0${i}`] || 0);
                if(kg > 0 || reps > 0) { 
                    validSets++; 
                    setsHtml += `
                    <div class="modern-set-item">
                        <span class="ms-num">${validSets}</span>
                        <div class="ms-metrics">
                            <div class="ms-metric"><input type="number" class="log-edit-input edit-reps" data-logidx="${index}" data-set="${i}" value="${reps}" disabled> <span class="ms-lbl">reps</span></div>
                            <span class="ms-divider">/</span>
                            <div class="ms-metric"><input type="number" class="log-edit-input edit-kg" data-logidx="${index}" data-set="${i}" value="${kg}" disabled> <span class="ms-lbl">kg</span></div>
                        </div>
                    </div>`; 
                }
            }

            if(validSets > 0) {
                validLogsList.push({ exName, exInfo, setsHtml, index });
                
                listHtml += `
                <div class="exercise-acc" onclick="this.classList.toggle('open')">
                    <div class="exercise-acc-header">${exName} 
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                    <div class="exercise-acc-body" onclick="event.stopPropagation()"><div class="modern-set-list">${setsHtml}</div></div>
                </div>`;
            }
        });

        let mosaicGridRowsHtml = '';
        let mosaicBodiesHtml = '';
        const totalCount = validLogsList.length;
        const rowLayout = calculateRows(totalCount);
        
        // Calculamos el número máximo de columnas en esta rutina concreta.
        // Forzamos un mínimo de 2 para que si hay 1 solo ejercicio, ocupe como si hubieran 2.
        const maxCols = Math.max(2, ...rowLayout);
                
        let overallIndex = 0;
        rowLayout.forEach((count, rowIndex) => {
            let rowThumbsHtml = '';
            for(let i = 0; i < count; i++) {
                if (overallIndex >= totalCount) break;
                const item = validLogsList[overallIndex];
                const gifUrl = item.exInfo && item.exInfo.gif_url_completa ? item.exInfo.gif_url_completa : "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=150&auto=format&fit=crop";
                const shortName = shortenName(item.exName);

                rowThumbsHtml += `
                <div class="mosaic-thumb-wrapper cascade-anim" id="m-thumb-${rutinaId}-${overallIndex}" onclick="selectMosaic('${rutinaId}', ${overallIndex}, ${rowIndex})" style="animation-delay: ${overallIndex * 0.08}s;">
                    <img src="${gifUrl}" alt="${shortName}">
                    <span class="m-short">${shortName}</span>
                    <span class="m-full">${item.exName}</span>
                </div>`;

                mosaicBodiesHtml += `
                <div class="m-body" id="m-body-${rutinaId}-${overallIndex}">
                    <div class="modern-set-list">${item.setsHtml}</div>
                </div>`;
                
                overallIndex++;
            }
            mosaicGridRowsHtml += `<div class="mosaic-row" id="mosaic-row-${rutinaId}-${rowIndex}">${rowThumbsHtml}</div>`;
        });
        
        html += `
            <div class="view-mode-wrapper">
                <div class="list-view-container ${state.logViewMode === 'list' ? '' : 'hidden'}">
                    ${listHtml}
                </div>
                <div id="mosaic-container-${rutinaId}" class="mosaic-view-container ${state.logViewMode === 'mosaic' ? '' : 'hidden'}" style="--max-cols: ${maxCols};">
                    ${mosaicGridRowsHtml}
                    <div class="mosaic-bodies-container">
                        ${mosaicBodiesHtml}
                    </div>
                </div>
            </div>

            <div id="edit-actions-${rutinaId}" class="edit-actions hidden">
                <button type="button" class="btn-cancel" onclick="cancelEditLog()">Cancelar</button>
                <button type="button" class="btn-save" onclick="saveEditLog('${rutinaId}')">Guardar</button>
            </div>`; 
        
        // --- BOTÓN DE CONTINUAR CON COLOR DINÁMICO DE LA RUTINA ---
        if (!isCompleted) {
            html += `
            <div style="margin-top: 30px; position: relative; clear: both; width: 100%;">
                <button class="btn-primary" style="background: linear-gradient(135deg, color-mix(in srgb, var(--routine-color) 60%, white), var(--routine-color)); box-shadow: 0 10px 25px color-mix(in srgb, var(--routine-color) 35%, transparent);" onclick="continueWorkout('${rutinaId}', ${completedEx})">
                    Continuar entrenamiento (${completedEx}/${totalEx})
                </button>
            </div>`;
        }

        html += `</div>`; // Cierra la etiqueta .routine-group
        
        container.innerHTML += html;
        
        if (state.logViewMode === 'mosaic') {
            document.querySelectorAll('.mosaic-thumb-wrapper img').forEach(img => freezeGif(img));
        }
        
    } else if (state.currentView === 'week') {
        const start = getMonday(state.referenceDate), daysNames = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
        for(let i=0; i<7; i++) {
            const d = new Date(start); d.setDate(start.getDate()+i); const logsToday = state.logs.filter(l => l.Fecha_log_entreno === getLocalISODate(d));
            if(logsToday.length > 0) {
                const validLog = logsToday.find(l => state.libRoutines.some(r => r.ID_entreno === l.ID_entreno)) || logsToday[0];
                const rData = state.libRoutines.find(r => r.ID_entreno === validLog.ID_entreno);
                container.innerHTML += `<div class="week-day-card trained" style="--routine-color: #${rData ? rData.Color_rutina : '000'}; animation-delay: ${i*0.05}s;" onclick="goToDayLog('${d.toISOString()}')"><div style="font-size:14px; font-weight:900; color:var(--text-secondary); margin-bottom:4px;">${daysNames[i]} ${d.getDate()}</div><div style="font-size:22px; font-weight:900; color:var(--text-primary); letter-spacing:-0.5px;">${rData ? rData.Nombre_rutina : 'Entreno'}</div></div>`;
            } else {
                container.innerHTML += `<div class="week-day-card" style="animation-delay: ${i*0.05}s;"><div style="font-size:14px; font-weight:900; color:var(--text-secondary); margin-bottom:4px;">${daysNames[i]} ${d.getDate()}</div><div style="font-size:16px; font-weight:700; color:#d1d1d6;">Descanso</div></div>`;
            }
        }
    } else if (state.currentView === 'month') {
        const y = state.referenceDate.getFullYear(), m = state.referenceDate.getMonth(), lastDay = new Date(y, m + 1, 0).getDate();
        let startDow = new Date(y, m, 1).getDay() - 1; if(startDow === -1) startDow = 6; 
        let html = '<div class="calendar-grid">';
        ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'].forEach(n => html += `<div class="cal-header">${n}</div>`);
        for(let i=0; i<startDow; i++) html += `<div></div>`; 
        for(let i=1; i<=lastDay; i++) {
            const d = new Date(y, m, i); const logsToday = state.logs.filter(l => l.Fecha_log_entreno === getLocalISODate(d));
            let extraClass = getLocalISODate(d) === getLocalISODate(new Date()) ? 'active' : '';
            if(logsToday.length > 0) {
                const validLog = logsToday.find(l => state.libRoutines.some(r => r.ID_entreno === l.ID_entreno)) || logsToday[0];
                const rData = state.libRoutines.find(r => r.ID_entreno === validLog.ID_entreno);
                html += `<div class="cal-day trained ${extraClass}" style="--routine-color: #${rData ? rData.Color_rutina : '000'};" onclick="goToDayLog('${d.toISOString()}')">${i}<div class="cal-dot"></div></div>`;
            } else {
                html += `<div class="cal-day ${extraClass}" onclick="goToDayLog('${d.toISOString()}')">${i}</div>`;
            }
        }
        container.innerHTML = html + '</div>';
    }
}

async function deleteLogEntry(rutinaId) {
    if(!confirm("¿Seguro que quieres borrar este registro de entreno?")) return;
    try {
        showToast("Eliminando...");
        const res = await fetchWithTimeout(WEBHOOK_URL, { 
            method: 'POST', 
            body: JSON.stringify({ 
                action: "eliminar_registro", 
                user: USERNAME, 
                entreno_id: rutinaId, 
                date: getLocalISODate(state.referenceDate) 
            }) 
        });
        if(!res.ok) throw new Error();
        state.logs = state.logs.filter(l => l.ID_entreno !== rutinaId || l.Fecha_log_entreno !== getLocalISODate(state.referenceDate));
        showToast("Registro eliminado"); renderLogs(); checkTodayWorkout();
    } catch(e) { showToast("Error de conexión. Intenta de nuevo."); }
}

function enableEditLog(rutinaId) {
    if (state.logViewMode === 'mosaic') {
        state.logViewMode = 'list';
        renderLogs();
    }
    document.querySelectorAll(`.routine-group[data-id="${rutinaId}"] .log-edit-input`).forEach(inp => inp.disabled = false);
    document.getElementById(`log-actions-${rutinaId}`).classList.add('hidden');
    document.getElementById(`edit-actions-${rutinaId}`).classList.remove('hidden');
    document.querySelectorAll(`.routine-group[data-id="${rutinaId}"] .exercise-acc`).forEach(acc => acc.classList.add('open'));
}

function cancelEditLog() { 
    renderLogs(); 
} 

async function saveEditLog(rutinaId) {
    const dayLogsCopy = JSON.parse(JSON.stringify(state.logs.filter(l => l.Fecha_log_entreno === getLocalISODate(state.referenceDate) && l.ID_entreno === rutinaId)));
    
    document.querySelectorAll(`.routine-group[data-id="${rutinaId}"] .log-edit-input`).forEach(inp => {
        const logIdx = parseInt(inp.dataset.logidx);
        const setNum = inp.dataset.set;
        if(inp.classList.contains('edit-reps')) dayLogsCopy[logIdx][`Log_repes_serie_0${setNum}`] = inp.value;
        if(inp.classList.contains('edit-kg')) dayLogsCopy[logIdx][`Log_peso_serie_0${setNum}`] = inp.value;
    });

    try {
        showToast("Guardando cambios...");
        const res = await fetchWithTimeout(WEBHOOK_URL, { 
            method: 'POST', 
            body: JSON.stringify({ 
                action: "editar_registro", 
                user: USERNAME, 
                date: getLocalISODate(state.referenceDate), 
                entreno_id: rutinaId, 
                registros_actualizados: dayLogsCopy 
            }) 
        });
        if(!res.ok) throw new Error();
        
        const currentStr = getLocalISODate(state.referenceDate);
        state.logs = state.logs.filter(l => !(l.Fecha_log_entreno === currentStr && l.ID_entreno === rutinaId));
        state.logs.push(...dayLogsCopy);
        showToast("Actualizado correctamente"); renderLogs();
    } catch(e) { showToast("Error al guardar. Verifica la conexión."); renderLogs(); }
}

function validateFormChanges() {
    const btn = document.getElementById('btn-save-routine');
    const hasBasicData = currentRoutine.nombre.length >= 3 && currentRoutine.color && currentRoutine.ejercicios.length > 0;
    if (!hasBasicData) { btn.disabled = true; return; }
    const currentComp = JSON.stringify({ n: currentRoutine.nombre, c: currentRoutine.color, e: currentRoutine.ejercicios.map(ex => ex.ID_ejercicio).join(',') });
    btn.disabled = (currentComp === originalRoutineStr);
}

function setupUIEvents() {
    const searchInput = document.getElementById('exercise-search');
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        const resultsBox = document.getElementById('search-results');
        if(term.length < 2) { resultsBox.classList.add('hidden'); return; }
        
        const matches = state.libExercises.filter(ex => {
            const muscleGroup = (ex.ID_ejercicio.split('_')[1] || '').toLowerCase();
            const searchString = `${ex.Nombre_ejercicio || ''} ${ex.Nombre_ejercicio_alt_1 || ''} ${ex.Nombre_ejercicio_alt_2 || ''} ${ex.Nombre_ejercicio_alt_3 || ''} ${ex.Nombre_ejercicio_alt_4 || ''} ${ex.Nombre_ejercicio_alt_5 || ''} ${muscleGroup}`.toLowerCase();
            return searchString.includes(term);
        });

        resultsBox.innerHTML = '';
        if (matches.length === 0) { resultsBox.innerHTML = '<div class="search-item" style="color: var(--text-secondary);">No hay resultados</div>'; } 
        else {
            matches.forEach(ex => {
                const div = document.createElement('div'); div.className = 'search-item'; div.innerHTML = `<strong>${ex.Nombre_ejercicio}</strong>`;
                div.onclick = () => { addExerciseToRoutine(ex); searchInput.value = ''; resultsBox.classList.add('hidden'); };
                resultsBox.appendChild(div);
            });
        }
        resultsBox.classList.remove('hidden');
    });

    document.getElementById('routine-name').addEventListener('input', (e) => {
        currentRoutine.nombre = e.target.value;
        if(currentRoutine.nombre.length >= 3) document.getElementById('step-r-color').classList.add('active');
        else { document.getElementById('step-r-color').classList.remove('active'); document.getElementById('step-r-exercises').classList.remove('active'); }
        validateFormChanges();
    });

    const cp = document.getElementById('routine-color-picker'); cp.innerHTML = '';
    COLORS.forEach(c => {
        const div = document.createElement('div'); div.className = 'color-circle'; div.style.background = c;
        div.dataset.hex = c.replace('#', '').toLowerCase(); 
        div.onclick = () => {
            currentRoutine.color = div.dataset.hex;
            document.querySelectorAll('.color-circle').forEach(el => el.classList.remove('selected'));
            div.classList.add('selected'); document.getElementById('step-r-exercises').classList.add('active');
            validateFormChanges();
        };
        cp.appendChild(div);
    });
}

function addExerciseToRoutine(ex) { currentRoutine.ejercicios.push(ex); renderSelectedExercises(); validateFormChanges(); }

function renderSelectedExercises() {
    const ul = document.getElementById('selected-exercises'); ul.innerHTML = '';
    currentRoutine.ejercicios.forEach((ex, index) => {
        ul.innerHTML += `
        <li class="ex-chip">
            <div class="ex-chip-name"><span class="ex-chip-num">${index + 1}</span> ${ex.Nombre_ejercicio}</div>
            <span class="remove" onclick="removeEx(${index})"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></span>
        </li>`;
    });
}

function removeEx(index) { currentRoutine.ejercicios.splice(index, 1); renderSelectedExercises(); validateFormChanges(); }

async function saveRoutine() {
    const btn = document.getElementById('btn-save-routine');
    if(btn.disabled) return;

    const originalText = btn.innerText;
    btn.innerText = "Guardando...";
    btn.disabled = true;

    try {
        let finalId = state.editingRoutineId;
        
        if (!finalId) {
            let maxNum = 0;
            state.libRoutines.forEach(r => {
                if (r.ID_entreno && typeof r.ID_entreno === 'string') {
                    const match = r.ID_entreno.match(/train(\d+)_/i);
                    if (match && match[1]) {
                        const num = parseInt(match[1], 10);
                        if (num > maxNum) maxNum = num;
                    }
                }
            });
            const nextNum = String(maxNum + 1).padStart(3, '0');
            finalId = `train${nextNum}_${USERNAME}`;
        }
        
        const res = await fetchWithTimeout(WEBHOOK_URL, { 
            method: 'POST', 
            body: JSON.stringify({ 
                action: "crear_entreno", 
                user: USERNAME,
                entreno_id: finalId,
                entreno_nombre: currentRoutine.nombre,
                entreno_color: currentRoutine.color,
                ejercicios_ids: currentRoutine.ejercicios.map(ex => ex.ID_ejercicio)
            }) 
        });

        if(!res.ok) throw new Error("Error en respuesta del servidor");
        
        const localRoutineObj = { 
            ID_entreno: finalId, 
            Nombre_rutina: currentRoutine.nombre, 
            Color_rutina: currentRoutine.color, 
            ejercicios: [...currentRoutine.ejercicios] 
        };
        
        const existingIndex = state.libRoutines.findIndex(r => r.ID_entreno === finalId);
        if(existingIndex > -1) state.libRoutines[existingIndex] = localRoutineObj;
        else state.libRoutines.push(localRoutineObj);
        
        showToast("Rutina guardada"); 
        
        // 1. Ocultamos el formulario y abrimos la librería al instante
        document.getElementById('form-panel').classList.add('hidden');
        openLibrary(); 
        
        // 2. La pausa y la sincronización ocurren por detrás silenciosamente
        await new Promise(resolve => setTimeout(resolve, 1000));
        await syncData(); 
        
        // ¡Y LISTO! Ya NO ponemos otro openLibrary() aquí abajo.
        // Así evitamos que la lista se redibuje y repita la animación de cascada.

    } catch(e) { 
        console.error(e);
        showToast("Error al guardar la rutina"); 
    } finally {
        btn.innerText = originalText;
        validateFormChanges();
    }
}

function openLibrary() {
    const list = document.getElementById('library-list'); 
    list.innerHTML = '';
    
    if (state.libRoutines.length === 0) { 
        list.innerHTML = '<p class="empty-state" style="margin-bottom:0;">No tienes rutinas.</p>'; 
    }
    
    const uniqueRoutines = Array.from(new Set(state.libRoutines.map(r => r.ID_entreno))).map(id => state.libRoutines.find(r => r.ID_entreno === id));
    
    uniqueRoutines.forEach(r => {
        let loadedExercises = [];
        for(let i=1; i<=15; i++) {
            const exId = r[`Ejercicio_${String(i).padStart(2,'0')}`];
            if(exId) { 
                const exInfo = state.libExercises.find(e => e.ID_ejercicio === exId); 
                if(exInfo) loadedExercises.push(exInfo); 
            }
        }
        if (loadedExercises.length === 0 && Array.isArray(r.ejercicios)) { 
            r.ejercicios.forEach(ex => { 
                const exInfo = state.libExercises.find(e => e.ID_ejercicio === (ex.ID_ejercicio || ex)); 
                if (exInfo) loadedExercises.push(exInfo); 
            }); 
        }

        let exHtml = '';
        loadedExercises.forEach((ex, index) => {
            const gifUrl = ex.gif_url_completa || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=150&auto=format&fit=crop";
            exHtml += `
            <div class="lib-ex-item">
                <span class="lib-ex-num">${index + 1}</span>
                <img src="${gifUrl}" class="lib-ex-gif" alt="GIF del ejercicio">
                <span class="lib-ex-name">${ex.Nombre_ejercicio}</span>
            </div>`;
        });

        if(loadedExercises.length === 0) {
            exHtml = '<div class="lib-ex-item"><span class="lib-ex-name" style="color:var(--text-secondary)">Aún no hay ejercicios</span></div>';
        }

        list.innerHTML += `
        <div class="library-acc" data-id="${r.ID_entreno}" style="--routine-color: #${r.Color_rutina};" onclick="this.classList.toggle('open')">
            <div class="delete-progress-bar" id="del-prog-${r.ID_entreno}"></div>
            <div class="library-acc-header" style="position:relative; z-index:2;">
                <span style="font-size:18px; font-weight:900; color:var(--text-primary);">${r.Nombre_rutina}</span>
                
                <div class="log-actions-menu-container" style="position: relative;">
                    <button class="log-action-btn" onclick="toggleLibMenu('${r.ID_entreno}', event)">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"></circle><circle cx="12" cy="5" r="2"></circle><circle cx="12" cy="19" r="2"></circle></svg>
                    </button>
                    <div id="lib-menu-${r.ID_entreno}" class="log-dropdown hidden" style="top: 100%; right: 0;">
                        <div class="log-dropdown-item" onclick="editRoutine('${r.ID_entreno}', event); toggleLibMenu('${r.ID_entreno}', event)">Editar rutina</div>
                        <div class="log-dropdown-item delete" onclick="deleteRoutine('${r.ID_entreno}', event); toggleLibMenu('${r.ID_entreno}', event)">Eliminar rutina</div>
                    </div>
                </div>
            </div>
            <div class="library-acc-body">
                ${exHtml}
            </div>
        </div>`;
    });
    
    list.innerHTML += `<div class="week-day-card add-routine-card" onclick="openCreateForm()"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Añadir rutina</div>`;
    document.getElementById('library-panel').classList.remove('hidden');
}

function openCreateForm() {
    state.editingRoutineId = null; currentRoutine = { nombre: '', color: null, ejercicios: [] }; originalRoutineStr = JSON.stringify({ n: '', c: null, e: '' });
    document.getElementById('routine-name').value = ''; 
    document.querySelectorAll('.color-circle').forEach(el => el.classList.remove('selected'));
    renderSelectedExercises();
    document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
    document.getElementById('step-r-name').classList.add('active');
    
    validateFormChanges(); 
    document.getElementById('library-panel').classList.add('hidden'); document.getElementById('form-panel').classList.remove('hidden');
}

function closeModals() { document.querySelectorAll('.modal-panel').forEach(m => m.classList.add('hidden')); }

async function startWorkout(routineId) {
    state.activeWorkout = routineId;
    const rData = state.libRoutines.find(r => r.ID_entreno === routineId);
    
    if(!rData) {
        showToast("Error: Rutina no encontrada");
        return;
    }
    
    state.workoutExercises = [];
    
    try {
        const res = await fetchWithTimeout(WEBHOOK_URL, { 
            method: 'POST', 
            body: JSON.stringify({ 
                action: "iniciar_entreno", 
                user: USERNAME, 
                entreno_id: routineId,
                entreno_nombre: rData.Nombre_rutina,
                date: getLocalISODate(state.referenceDate) 
            }) 
        });
        
        const newLogs = await res.json();
        const todayStr = getLocalISODate(state.referenceDate);
        state.logs = state.logs.filter(l => !(l.Fecha_log_entreno === todayStr && l.ID_entreno === routineId));
        if (Array.isArray(newLogs)) {
            state.logs.push(...newLogs);
        }
        
    } catch(e) { console.log("Post inicio error", e); showToast("Error al iniciar en el servidor"); }
    
    for(let i=1; i<=15; i++) {
        const exId = rData[`Ejercicio_${String(i).padStart(2,'0')}`];
        if(exId && typeof exId === 'string' && exId.trim() !== "") {
            const exInfo = state.libExercises.find(e => e.ID_ejercicio === exId);
            if(exInfo) state.workoutExercises.push(exInfo);
        }
    }
    
    if (state.workoutExercises.length === 0 && Array.isArray(rData.ejercicios)) {
        rData.ejercicios.forEach(ex => {
            const exInfo = state.libExercises.find(e => e.ID_ejercicio === (ex.ID_ejercicio || ex));
            if (exInfo) state.workoutExercises.push(exInfo);
        });
    }
    
    state.currentCardIndex = 0;
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('deck-container').classList.remove('hidden');
    renderDeck();
}

function closeDeck() { document.getElementById('deck-container').classList.add('hidden'); checkTodayWorkout(); }

async function resetWorkout() {
    try {
        showToast("Eliminando...");
        const res = await fetchWithTimeout(WEBHOOK_URL, { 
            method: 'POST', 
            body: JSON.stringify({ 
                action: "eliminar_registro", 
                user: USERNAME, 
                entreno_id: state.activeWorkout, 
                date: getLocalISODate(state.referenceDate) 
            }) 
        });
        if(!res.ok) throw new Error();
        
        // --- 1. ELIMINAR LOS REGISTROS DEL ESTADO LOCAL ---
        const todayStr = getLocalISODate(state.referenceDate);
        state.logs = state.logs.filter(l => !(l.ID_entreno === state.activeWorkout && l.Fecha_log_entreno === todayStr));
        
        // --- 2. LIMPIAR EL ENTRENAMIENTO ACTIVO ---
        state.activeWorkout = null;
        state.currentCardIndex = 0; 
        
        // 3. Ocultar la pantalla de ejecución (deck)
        document.getElementById('deck-container').classList.add('hidden'); 
        
        // 4. Recargar la interfaz (te llevará a "Qué toca hoy" o dejará la lista vacía)
        checkTodayWorkout();

    } catch(e) { 
        showToast("Error al resetear/eliminar."); 
    }
}

function renderDeck() {
    const wrapper = document.getElementById('cards-wrapper'); wrapper.innerHTML = '';
    document.getElementById('edge-right').style.opacity = 0; document.getElementById('edge-left').style.opacity = 0;

    if (state.currentCardIndex < state.workoutExercises.length) {
        if (state.currentCardIndex + 1 < state.workoutExercises.length) { wrapper.appendChild(createCardHtml(state.workoutExercises[state.currentCardIndex + 1], 'behind', state.currentCardIndex + 1)); }
        
        const activeCard = createCardHtml(state.workoutExercises[state.currentCardIndex], 'active entrance-anim', state.currentCardIndex);
        wrapper.appendChild(activeCard);
        
        setTimeout(() => activeCard.classList.remove('entrance-anim'), 1000);
        
        setupDynamicSets(state.currentCardIndex); 
        setupVerticalSwipeForInputs(state.currentCardIndex);
        setupSwipeTouch(activeCard);
    } else {
        wrapper.innerHTML = `<div class="swipe-card active animate entrance-anim" style="justify-content:center; align-items:center; text-align:center;"><svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:20px;"><polyline points="20 6 9 17 4 12"></polyline></svg><h2 class="card-title" style="color:var(--text-primary);">¡Entreno completado!</h2><button class="btn-primary" onclick="closeDeck()" style="margin-top:40px; width:80%;">Ver resultados</button></div>`;
        state.activeWorkout = null;
    }
}

async function finishAndSync() {
    closeDeck();
    showToast("Sincronizando entrenamiento...");
    await syncData();
}

function editRoutine(routineId, event) {
    if(event) { event.stopPropagation(); event.preventDefault(); }
    const rData = state.libRoutines.find(r => r.ID_entreno === routineId); if (!rData) return;
    state.editingRoutineId = routineId; let loadedExercises = [];
    
    for(let i=1; i<=15; i++) {
        const exId = rData[`Ejercicio_${String(i).padStart(2,'0')}`];
        if(exId) { const exInfo = state.libExercises.find(e => e.ID_ejercicio === exId); if(exInfo) loadedExercises.push(exInfo); }
    }
    if (loadedExercises.length === 0 && Array.isArray(rData.ejercicios)) { rData.ejercicios.forEach(ex => { const exInfo = state.libExercises.find(e => e.ID_ejercicio === (ex.ID_ejercicio || ex)); if (exInfo) loadedExercises.push(exInfo); }); }

    const targetColor = (rData.Color_rutina || "").toLowerCase().replace('#', '');
    let colorMatched = false;
    document.querySelectorAll('.color-circle').forEach(el => { el.classList.remove('selected'); if(el.dataset.hex === targetColor) { el.classList.add('selected'); colorMatched = true; } });
    if(!colorMatched && document.querySelector('.color-circle')) { document.querySelector('.color-circle').classList.add('selected'); currentRoutine.color = document.querySelector('.color-circle').dataset.hex; } else { currentRoutine.color = targetColor; }

    currentRoutine.nombre = rData.Nombre_rutina; currentRoutine.ejercicios = loadedExercises;
    originalRoutineStr = JSON.stringify({ n: currentRoutine.nombre, c: currentRoutine.color, e: loadedExercises.map(ex => ex.ID_ejercicio).join(',') });

    document.getElementById('form-title').innerText = "Editar Rutina"; document.getElementById('routine-name').value = currentRoutine.nombre;
    document.getElementById('step-r-color').classList.add('active'); document.getElementById('step-r-exercises').classList.add('active');
    
    renderSelectedExercises(); validateFormChanges(); 
    document.getElementById('library-panel').classList.add('hidden'); document.getElementById('form-panel').classList.remove('hidden');
}

function createCardHtml(exercise, statusClass, index) {
    const card = document.createElement('div'); 
    card.className = `swipe-card animate ${statusClass}`; 
    card.id = `card-${index}`;
    
    let setsHtml = '';
    for(let i=1; i<=5; i++) {
        setsHtml += `
        <div class="serie-row ${i > 1 ? 'hidden-set' : ''}" id="row-${index}-${i}">
            <div class="serie-num">${i}</div>
            <div class="inputs-group">
                <div class="input-wrapper">
                    <input type="number" id="reps-${index}-${i}" class="serie-input input-reps" placeholder="0">
                    <span class="unit-label">reps</span>
                </div>
                <div class="input-wrapper">
                    <input type="number" id="kg-${index}-${i}" class="serie-input input-kg" placeholder="0">
                    <span class="unit-label">kg</span>
                </div>
            </div>
        </div>`;
    }
    
    const bgImage = exercise.gif_url_completa || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop";

    card.innerHTML = `
        <div class="card-visual" style="background-image: url('${bgImage}')">
            <div class="card-visual-text">
                <div class="card-progress">EJERCICIO ${index + 1} DE ${state.workoutExercises.length}</div>
                <div class="card-title">${exercise.Nombre_ejercicio}</div>
            </div>
        </div>
        <div class="series-container">${setsHtml}</div>
    `;
    return card;
}

function setupDynamicSets(cardIndex) {
    for(let i=1; i<=5; i++) { 
        const repsIn = document.getElementById(`reps-${cardIndex}-${i}`), 
              kgIn = document.getElementById(`kg-${cardIndex}-${i}`), 
              row = document.getElementById(`row-${cardIndex}-${i}`);
        
        const makeActive = () => { 
            document.querySelectorAll('.serie-row').forEach(r => r.classList.remove('active-input')); 
            if(row) row.classList.add('active-input'); 
        };
        
        if(repsIn) repsIn.addEventListener('focus', makeActive); 
        if(kgIn) kgIn.addEventListener('focus', makeActive);
        
        const checkNext = () => {
            if(i < 5 && repsIn.value !== "" && kgIn.value !== "") {
                const nextRow = document.getElementById(`row-${cardIndex}-${i+1}`);
                if(nextRow && nextRow.classList.contains('hidden-set')) { 
                    nextRow.classList.remove('hidden-set');
                    nextRow.classList.add('show-anim');
                }
            }
        };
        
        if(repsIn) repsIn.addEventListener('input', checkNext); 
        if(kgIn) kgIn.addEventListener('input', checkNext);

        // --- NUEVO: ATAJOS DE TECLADO (ESPACIO Y ENTER) ---
        const handleKeyDown = (e, type) => {
            if (e.key === ' ' || e.code === 'Space') {
                e.preventDefault(); // Evita que se escriba el espacio en blanco
                if (type === 'reps' && kgIn) {
                    kgIn.focus();
                } else if (type === 'kg' && i < 5) {
                    const nextReps = document.getElementById(`reps-${cardIndex}-${i+1}`);
                    const nextRow = document.getElementById(`row-${cardIndex}-${i+1}`);
                    if (nextRow && nextRow.classList.contains('hidden-set')) {
                        nextRow.classList.remove('hidden-set');
                        nextRow.classList.add('show-anim');
                    }
                    if (nextReps) nextReps.focus();
                }
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (i < 5) {
                    const nextReps = document.getElementById(`reps-${cardIndex}-${i+1}`);
                    const nextKg = document.getElementById(`kg-${cardIndex}-${i+1}`);
                    const nextRow = document.getElementById(`row-${cardIndex}-${i+1}`);

                    // Desbloquea la siguiente serie
                    if (nextRow && nextRow.classList.contains('hidden-set')) {
                        nextRow.classList.remove('hidden-set');
                        nextRow.classList.add('show-anim');
                    }

                    // Copia y pega los valores
                    if (nextReps && repsIn.value !== "") nextReps.value = repsIn.value;
                    if (nextKg && kgIn.value !== "") nextKg.value = kgIn.value;

                    // Fuerza la actualización para la validación visual si la tienes
                    if (nextReps) nextReps.dispatchEvent(new Event('input'));
                    if (nextKg) nextKg.dispatchEvent(new Event('input'));

                    // Mueve el foco a la misma columna de la fila de abajo
                    if (type === 'reps' && nextReps) nextReps.focus();
                    else if (type === 'kg' && nextKg) nextKg.focus();
                }
            }
        };

        if(repsIn) repsIn.addEventListener('keydown', (e) => handleKeyDown(e, 'reps'));
        if(kgIn) kgIn.addEventListener('keydown', (e) => handleKeyDown(e, 'kg'));
    }
}

let startX = 0, currentX = 0, isDragging = false;
function setupSwipeTouch(card) {
    const rightEdge = document.getElementById('edge-right'), leftEdge = document.getElementById('edge-left'), threshold = window.innerWidth * 0.15; 
    
    card.addEventListener('touchstart', (e) => { 
        if(e.target.closest('.inputs-group')) return; 
        startX = e.touches[0].clientX; 
        isDragging = true; 
        card.style.transition = 'none'; 
        card.classList.remove('animate'); 
    });
    
    card.addEventListener('touchmove', (e) => {
        if(!isDragging) return; 
        currentX = e.touches[0].clientX - startX;
        card.style.transform = `translateX(${currentX}px) rotate(${currentX * 0.05}deg)`;
        
        if(currentX > 0) { 
            let pct = Math.min(currentX / threshold, 1); 
            rightEdge.style.transform = `translateX(-${pct * 100}px)`; rightEdge.style.opacity = pct; leftEdge.style.opacity = 0; 
        } else { 
            let pct = Math.min(Math.abs(currentX) / threshold, 1); 
            leftEdge.style.transform = `translateX(${pct * 100}px)`; leftEdge.style.opacity = pct; rightEdge.style.opacity = 0; 
        }
    });
    
    card.addEventListener('touchend', () => {
        if(!isDragging) return; 
        isDragging = false; 
        
        if (currentX > threshold) { 
            let hasValidSet = false;
            for(let i=1; i<=5; i++){
                const r = document.getElementById(`reps-${state.currentCardIndex}-${i}`)?.value;
                const k = document.getElementById(`kg-${state.currentCardIndex}-${i}`)?.value;
                if(r || k) {
                    hasValidSet = true;
                    break;
                }
            }

            if (hasValidSet) {
                card.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.05), box-shadow 0.3s ease, opacity 0.4s ease';
                card.style.boxShadow = '0 0 60px rgba(52, 199, 89, 0.8)'; 
                card.style.transform = `translateX(${window.innerWidth * 1.2}px) translateY(-50px) rotate(25deg) scale(1.05)`; 
                card.style.opacity = '0';
                
                handleSaveSwipe(card, state.currentCardIndex);
            } else {
                card.style.transition = 'transform 0.4s cubic-bezier(0.19, 1, 0.22, 1)';
                card.style.transform = `translateX(0px) rotate(0deg)`; 
                rightEdge.style.opacity = 0; 
                leftEdge.style.opacity = 0; 
                showToast("Añade al menos una serie para guardar");
            }

        } else if (currentX < -threshold) { 
            card.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.05), box-shadow 0.3s ease, opacity 0.4s ease';
            card.style.boxShadow = '0 0 60px rgba(255, 59, 48, 0.8)'; 
            card.style.transform = `translateX(-${window.innerWidth * 1.2}px) translateY(-50px) rotate(-25deg) scale(1.05)`; 
            card.style.opacity = '0';
            
            setTimeout(() => skipCardAndRequeue(), 400); 
        } else { 
            card.style.transition = 'transform 0.4s cubic-bezier(0.19, 1, 0.22, 1)';
            card.style.transform = `translateX(0px) rotate(0deg)`; 
            rightEdge.style.opacity = 0; 
            leftEdge.style.opacity = 0; 
        }
        currentX = 0;
    });
}

function setupVerticalSwipeForInputs(cardIndex) {
    for(let i=1; i<=5; i++) {
        ['reps', 'kg'].forEach(type => {
            const inp = document.getElementById(`${type}-${cardIndex}-${i}`);
            if(!inp) return;
            
            let startY = 0;
            let startVal = 0;
            let isDraggingNum = false;

            inp.addEventListener('touchstart', (e) => {
                startY = e.touches[0].clientY;
                startVal = parseFloat(inp.value) || 0;
                isDraggingNum = false;
            }, { passive: true });

            inp.addEventListener('touchmove', (e) => {
                const currentY = e.touches[0].clientY;
                const deltaY = startY - currentY;

                if (Math.abs(deltaY) > 10) {
                    isDraggingNum = true;
                    if(e.cancelable) e.preventDefault();
                    inp.blur();
                    
                    let increment = Math.floor(deltaY / 8); 
                    let newVal = startVal + increment;
                    
                    if(newVal < 0) newVal = 0;
                    if(newVal > 999) newVal = 999;
                    
                    inp.value = newVal;
                    inp.dispatchEvent(new Event('input'));
                }
            }, { passive: false });

            inp.addEventListener('touchend', (e) => {
                if(isDraggingNum && e.cancelable) {
                    e.preventDefault(); 
                }
            });
        });
    }
}

async function handleSaveSwipe(card, index) {
    const exId = state.workoutExercises[index].ID_ejercicio;
    const seriesData = [];
    for(let i=1; i<=5; i++){ 
        const r = document.getElementById(`reps-${index}-${i}`)?.value; const k = document.getElementById(`kg-${index}-${i}`)?.value;
        if(r || k) seriesData.push({ reps: r || 0, kg: k || 0 }); 
    }
    
    const todayStr = getLocalISODate(state.referenceDate);
    let currentLogs = state.logs.filter(l => l.Fecha_log_entreno === todayStr && l.ID_entreno === state.activeWorkout);
    if(currentLogs[index]) {
        seriesData.forEach((s, i) => {
            currentLogs[index][`Log_repes_serie_0${i+1}`] = s.reps;
            currentLogs[index][`Log_peso_serie_0${i+1}`] = s.kg;
        });
    }

    const payload = { 
        action: "guardar_ejercicio", 
        user: USERNAME, 
        date: todayStr, 
        entreno_id: state.activeWorkout, 
        ejercicio_id: exId, 
        series: seriesData 
    };
    
    setTimeout(() => { state.currentCardIndex++; renderDeck(); }, 400);

    try {
        const res = await fetchWithTimeout(WEBHOOK_URL, { method: 'POST', body: JSON.stringify(payload) });
        if(!res.ok) throw new Error();
    } catch(e) {
        showToast("Error de conexión al guardar el ejercicio. Se actualizará en segundo plano.");
    }
}
function skipCardAndRequeue() { state.workoutExercises.push(state.workoutExercises.splice(state.currentCardIndex, 1)[0]); renderDeck(); }

function showToast(msg) { 
    const toast = document.createElement('div'); toast.className = 'toast'; 
    toast.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> ${msg}`;
    document.getElementById('toast-container').appendChild(toast); setTimeout(() => toast.remove(), 3000); 
}
const menuBtn = document.getElementById('menu-btn'), closeMenuBtn = document.getElementById('close-menu'), sidebar = document.getElementById('sidebar'), overlay = document.getElementById('overlay');
const closeMenu = () => { sidebar.classList.remove('open'); overlay.classList.remove('show'); };
menuBtn.addEventListener('click', () => { sidebar.classList.add('open'); overlay.classList.add('show'); }); closeMenuBtn.addEventListener('click', closeMenu); overlay.addEventListener('click', closeMenu);

function toggleLibMenu(id, event) {
    if(event) event.stopPropagation();
    const menu = document.getElementById(`lib-menu-${id}`);
    const isHidden = menu.classList.contains('hidden');
    
    document.querySelectorAll('.log-dropdown').forEach(m => m.classList.add('hidden')); 
    document.querySelectorAll('.library-acc').forEach(acc => acc.classList.remove('menu-open'));
    
    if(isHidden) {
        menu.classList.remove('hidden');
        const acc = document.querySelector(`.library-acc[data-id="${id}"]`);
        if(acc) acc.classList.add('menu-open');
    }
}

async function deleteRoutine(routineId, event) {
    if(event) { event.stopPropagation(); event.preventDefault(); }
    if(!confirm("¿Seguro que quieres eliminar esta rutina?")) return;

    const accElement = document.querySelector(`.library-acc[data-id="${routineId}"]`);
    if (!accElement) return;

    const routineToDelete = state.libRoutines.find(r => r.ID_entreno === routineId);
    let deletedNum = 0;
    const matchDeleted = routineId.match(/train(\d+)_/i);
    if(matchDeleted) deletedNum = parseInt(matchDeleted[1], 10);
    
    let reagrupacion = [];
    state.libRoutines.forEach(r => {
        const numMatch = r.ID_entreno.match(/train(\d+)_/i);
        if (numMatch) {
            const num = parseInt(numMatch[1], 10);
            if (num > deletedNum) {
                const newNumStr = String(num - 1).padStart(3, '0');
                const newId = `train${newNumStr}_${USERNAME}`;
                reagrupacion.push({
                    ...r,
                    ID_entreno_origen: r.ID_entreno,
                    ID_entreno_destino: newId
                });
            }
        }
    });

    const payload = {
        action: "eliminar_rutina",
        user: USERNAME,
        eliminada: routineToDelete,
        reagrupacion: reagrupacion
    };

    const progBar = document.getElementById(`del-prog-${routineId}`);
    if(progBar) progBar.style.width = '100%';

    try {
        const res = await fetchWithTimeout(WEBHOOK_URL, {
            method: 'POST',
            body: JSON.stringify(payload),
            timeout: 5000 
        });

        if(!res.ok) throw new Error("Fallo en la respuesta del back");

        if(progBar) {
            progBar.style.transition = 'width 0.2s ease-out';
            progBar.style.width = '100%';
        }

        setTimeout(() => {
            if(accElement) accElement.classList.add('pop-out');
            
            setTimeout(() => {
                state.libRoutines = state.libRoutines.filter(r => r.ID_entreno !== routineId);
                reagrupacion.forEach(reag => {
                    const localR = state.libRoutines.find(r => r.ID_entreno === reag.ID_entreno_origen);
                    if(localR) localR.ID_entreno = reag.ID_entreno_destino;
                    
                    // Actualizamos los IDs de las rutinas de abajo directamente en el HTML
                    const domEl = document.querySelector(`.library-acc[data-id="${reag.ID_entreno_origen}"]`);
                    if(domEl) {
                        domEl.dataset.id = reag.ID_entreno_destino;
                        domEl.innerHTML = domEl.innerHTML.replaceAll(reag.ID_entreno_origen, reag.ID_entreno_destino);
                    }
                });
                
                // Eliminamos la tarjeta físicamente sin recargar la lista
                if(accElement) accElement.remove();
                
                checkTodayWorkout(); 
                showToast("Rutina eliminada correctamente");
            }, 500);
        }, 200);

    } catch(e) {
        if(progBar) {
            progBar.style.transition = 'width 0.4s ease';
            progBar.style.width = '0%';
        }
        showToast("Error de conexión. Se ha cancelado el borrado.");
    }
}

// NUEVA FUNCIÓN: Lógica del botón X -> Slide to Delete
function setupDeleteSwitch() {
    let preSwitchTimer;
    let holdTimer;
    let isPreSwitch = false; // Estado a los 0.4s
    let isSwitchMode = false; // Estado al 1.0s
    let switchStartX = 0;
    let thumbPos = 0;
    let hasStartedDrag = false;

    const mainBtn = document.getElementById('deck-main-btn');
    const track = document.getElementById('delete-switch-track');
    const wrapper = document.getElementById('delete-switch-wrapper');
    const iconX = mainBtn.querySelector('.icon-x');
    const iconTrash = mainBtn.querySelector('.icon-trash');
    const deckContainer = document.getElementById('deck-container'); 

    if(!mainBtn) return;

    mainBtn.addEventListener('contextmenu', (e) => e.preventDefault());

    function resetSwitch() {
        clearTimeout(preSwitchTimer);
        clearTimeout(holdTimer);
        isPreSwitch = false;
        isSwitchMode = false;
        hasStartedDrag = false;
        thumbPos = 0;
        
        // Quitamos ambas fases
        wrapper.classList.remove('pre-switch', 'active-switch');
        
        mainBtn.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        mainBtn.style.transform = `translateX(0px)`;
        iconX.style.opacity = 1;
        iconTrash.style.opacity = 0;
        iconTrash.style.color = '#000'; 
        
        if(deckContainer) {
            deckContainer.style.transition = 'background-color 0.4s ease';
            deckContainer.style.backgroundColor = ''; 
        }
    }

    mainBtn.addEventListener('touchstart', (e) => {
        if (isPreSwitch || isSwitchMode) return;
        switchStartX = e.touches[0].clientX;
        
        // FASE 1: A los 0.4s sale el Pop y la Papelera
        preSwitchTimer = setTimeout(() => {
            isPreSwitch = true;
            wrapper.classList.add('pre-switch');
            iconX.style.opacity = 0;
            iconTrash.style.opacity = 1;
            
            // Micro-vibración para confirmar que "ha enganchado"
            if(navigator.vibrate) navigator.vibrate(15); 
        }, 400);

        // FASE 2: Al 1.0s sale la pastilla entera
        holdTimer = setTimeout(() => {
            isSwitchMode = true;
            wrapper.classList.add('active-switch');
            
            // Segunda vibración indicando que ya puedes deslizar
            if(navigator.vibrate) navigator.vibrate(40); 
        }, 1000); 
    }, { passive: true });

    mainBtn.addEventListener('touchmove', (e) => {
        if (!isSwitchMode) {
            // Si el usuario mueve el dedo antes de que salga la pastilla (1.0s), cancelamos todo
            if (Math.abs(e.touches[0].clientX - switchStartX) > 10) {
                resetSwitch(); 
            }
            return;
        }
        
        e.preventDefault(); 
        
        if (!hasStartedDrag) {
            switchStartX = e.touches[0].clientX;
            hasStartedDrag = true;
        }
        
        let currentX = e.touches[0].clientX;
        let deltaX = currentX - switchStartX; 
        
        const maxSlide = track.offsetWidth - mainBtn.offsetWidth;

        if (deltaX > 0) deltaX = 0; 
        if (deltaX < -maxSlide) deltaX = -maxSlide; 

        thumbPos = deltaX;
        mainBtn.style.transition = 'none';
        mainBtn.style.transform = `translateX(${deltaX}px)`;

        const progress = Math.abs(deltaX) / maxSlide;
        
        const r = Math.floor(progress * 255);
        const g = Math.floor(progress * 59);
        const b = Math.floor(progress * 48);
        iconTrash.style.color = `rgb(${r}, ${g}, ${b})`;

        if (deckContainer) {
            deckContainer.style.transition = 'none'; 
            const bgRed = Math.floor(progress * 180);
            deckContainer.style.backgroundColor = `rgba(${bgRed}, 0, 0, 0.85)`;
        }

    }, { passive: false });

    const handleEnd = (e) => {
        clearTimeout(preSwitchTimer);
        clearTimeout(holdTimer);
        
        if (!isSwitchMode) {
            // Si soltó ANTES de los 0.4s (un tap rápido normal) -> Cerramos el Deck
            if (!isPreSwitch && !hasStartedDrag) {
                closeDeck(); 
            } else {
                // Si soltó entre los 0.4s y 1.0s (salió el Pop pero se arrepintió) -> Solo revertimos visuales
                resetSwitch();
            }
        } else {
            // Si la pastilla ya había salido, evaluamos si llegó al final
            const maxSlide = track.offsetWidth - mainBtn.offsetWidth;
            
            if (Math.abs(thumbPos) >= maxSlide * 0.95) {
                resetWorkout(); 
                setTimeout(resetSwitch, 500);
            } else {
                mainBtn.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                mainBtn.style.transform = `translateX(0px)`;
                iconTrash.style.color = '#000';
                
                if(deckContainer) {
                    deckContainer.style.transition = 'background-color 0.4s ease';
                    deckContainer.style.backgroundColor = ''; 
                }
                
                setTimeout(resetSwitch, 400);
            }
        }
        hasStartedDrag = false;
    };

    mainBtn.addEventListener('touchend', handleEnd);
    mainBtn.addEventListener('touchcancel', handleEnd);
}
// --- FUNCIÓN CERRAR SESIÓN ---
function cerrarSesion() {
    // 1. Borramos el usuario guardado
    localStorage.removeItem('flow_mini_user');
    // 2. Redirigimos al login
    window.location.replace('logchapuzaprovisional.html');
}
