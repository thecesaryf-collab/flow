const WEBHOOK_URL = 'https://automations-n8n.b8vwcm.easypanel.host/webhook/FLOW_mini';
const USERNAME = 'cesaryf';
const COLORS = ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#5AC8FA', '#007AFF', '#5856D6', '#AF52DE', '#FF2D55', '#8E8E93'];

let state = {
    libExercises: [], libRoutines: [], logs: [], currentView: 'day', referenceDate: new Date(),
    editingRoutineId: null, activeWorkout: null, workoutExercises: [], currentCardIndex: 0
};
let currentRoutine = { nombre: '', color: null, ejercicios: [] };
let originalRoutineStr = ""; 

async function fetchWithTimeout(resource, options = {}) {
    // Subimos a 15 segundos para dar margen al webhook
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
    await syncData(); 
    document.addEventListener('click', (e) => {
        if(!e.target.closest('.log-actions-menu-container')) {
            document.querySelectorAll('.log-dropdown').forEach(m => m.classList.add('hidden'));
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
        const payload = rawData[0];
        state.libExercises = payload.lib_ej || [];
        state.libRoutines = payload.lib_entrenos || [];
        state.logs = payload.log_entrenos || [];
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
    if (state.currentView === 'day') {
        if (todayStr === refStr && !state.logs.some(l => l.Fecha_log_entreno === refStr)) {
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
        document.getElementById('deck-container').classList.remove('hidden'); renderDeck(); 
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
    
    // Cargar los ejercicios de la rutina
    for(let i=1; i<=15; i++) {
        const exId = rData[`Ejercicio_${String(i).padStart(2,'0')}`];
        if(exId && typeof exId === 'string' && exId.trim() !== "") {
            const exInfo = state.libExercises.find(e => e.ID_ejercicio === exId);
            if(exInfo) state.workoutExercises.push(exInfo);
        }
    }
    
    // Fallback por si usan array local
    if (state.workoutExercises.length === 0 && Array.isArray(rData.ejercicios)) {
        rData.ejercicios.forEach(ex => {
            const exInfo = state.libExercises.find(e => e.ID_ejercicio === (ex.ID_ejercicio || ex));
            if (exInfo) state.workoutExercises.push(exInfo);
        });
    }
    
    // Asignamos el índice para saltarnos las cartas ya swipeadas
    state.currentCardIndex = completedCount; 
    
    // Ocultamos las pantallas y mostramos el deck de Tinder
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
        
        // --- NUEVA LÓGICA: Calcular si el entrenamiento está en proceso ---
        let totalEx = 0;
        if (rData) {
            for(let i=1; i<=15; i++) { if(rData[`Ejercicio_${String(i).padStart(2,'0')}`]) totalEx++; }
            if (totalEx === 0 && Array.isArray(rData.ejercicios)) totalEx = rData.ejercicios.length;
        }

        const isCompleted = dayLogs.length >= totalEx;

        // Si NO está completado y es el día de hoy, mostramos la carta de "En proceso"
        if (!isCompleted && getLocalISODate(state.referenceDate) === getLocalISODate(new Date())) {
            container.innerHTML = `
            <div class="routine-group" style="--routine-color: #${rColor}; text-align: center; padding: 40px 20px;">
                <div style="font-size: 26px; font-weight: 800; margin-bottom: 15px; color: var(--text-primary);">${rData ? rData.Nombre_rutina : "Entrenamiento"}</div>
                
                <div style="display: flex; align-items: center; justify-content: center; gap: 10px; color: var(--text-secondary); font-size: 18px; font-weight: 700; margin-bottom: 30px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    En proceso... (${dayLogs.length}/${totalEx})
                </div>
                
                <button class="btn-primary" onclick="continueWorkout('${rutinaId}', ${dayLogs.length})">Continuar entrenamiento</button>
            </div>`;
            return; // Salimos para que no renderice el historial de ejercicios completados aún
        }
        // --- FIN NUEVA LÓGICA ---

        let html = `
        <div class="routine-group" data-id="${rutinaId}" style="--routine-color: #${rColor};">
            <div class="log-header-top">
                <div class="log-routine-title">${rData ? rData.Nombre_rutina : "Entrenamiento"}</div>
                
                <div id="log-actions-${rutinaId}" class="log-actions-menu-container">
                    <button class="log-action-btn" onclick="toggleLogMenu('${rutinaId}', event)">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"></circle><circle cx="12" cy="5" r="2"></circle><circle cx="12" cy="19" r="2"></circle></svg>
                    </button>
                    <div id="log-menu-${rutinaId}" class="log-dropdown hidden">
                        <div class="log-dropdown-item" onclick="enableEditLog('${rutinaId}'); toggleLogMenu('${rutinaId}')">Editar entrenamiento</div>
                        <div class="log-dropdown-item delete" onclick="deleteLogEntry('${rutinaId}'); toggleLogMenu('${rutinaId}')">Eliminar entrenamiento</div>
                    </div>
                </div>
            </div>`;
        
        dayLogs.forEach((log, index) => {
            let setsHtml = ''; let validSets = 0;
            let exName = `Ejercicio ${index+1}`;
            if(rData) {
                const exId = rData[`Ejercicio_${String(index+1).padStart(2,'0')}`];
                const exInfo = state.libExercises.find(e => e.ID_ejercicio === exId);
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
                html += `
                <div class="exercise-acc" onclick="this.classList.toggle('open')">
                    <div class="exercise-acc-header">${exName} 
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                    <div class="exercise-acc-body" onclick="event.stopPropagation()"><div class="modern-set-list">${setsHtml}</div></div>
                </div>`;
            }
        });
        
        html += `
            <div id="edit-actions-${rutinaId}" class="edit-actions hidden">
                <button type="button" class="btn-cancel" onclick="cancelEditLog()">Cancelar</button>
                <button type="button" class="btn-save" onclick="saveEditLog('${rutinaId}')">Guardar</button>
            </div>
        </div>`;
        container.innerHTML += html;
        
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

// LOGS - Editar & Eliminar
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
        // CÁLCULO INTELIGENTE DEL ID SECUENCIAL
        let finalId = state.editingRoutineId;
        
        if (!finalId) {
            let maxNum = 0;
            state.libRoutines.forEach(r => {
                if (r.ID_entreno && typeof r.ID_entreno === 'string') {
                    // Busca coincidencias tipo "train001_"
                    const match = r.ID_entreno.match(/train(\d+)_/i);
                    if (match && match[1]) {
                        const num = parseInt(match[1], 10);
                        if (num > maxNum) maxNum = num;
                    }
                }
            });
            // Sumamos 1 al mayor encontrado y rellenamos con ceros
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
        
        // Actualización local de la librería para que se vea reflejado al instante
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
        closeModals(); 
        checkTodayWorkout();

    } catch(e) { 
        console.error(e);
        showToast("Error al guardar la rutina"); 
    } finally {
        btn.innerText = originalText;
        validateFormChanges(); // Vuelve a evaluar si debe estar activo o bloqueado
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
        // 1. Extraer los ejercicios de la rutina actual
        let loadedExercises = [];
        for(let i=1; i<=15; i++) {
            const exId = r[`Ejercicio_${String(i).padStart(2,'0')}`];
            if(exId) { 
                const exInfo = state.libExercises.find(e => e.ID_ejercicio === exId); 
                if(exInfo) loadedExercises.push(exInfo); 
            }
        }
        // Fallback por si están guardados en un array 'ejercicios' localmente antes de sincronizar
        if (loadedExercises.length === 0 && Array.isArray(r.ejercicios)) { 
            r.ejercicios.forEach(ex => { 
                const exInfo = state.libExercises.find(e => e.ID_ejercicio === (ex.ID_ejercicio || ex)); 
                if (exInfo) loadedExercises.push(exInfo); 
            }); 
        }

        // 2. Construir el HTML de la lista de ejercicios con sus GIFs
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

        // 3. Imprimir la tarjeta acordeón (Cuidado con el event.stopPropagation() en el botón)
        list.innerHTML += `
        <div class="library-acc" style="--routine-color: #${r.Color_rutina};" onclick="this.classList.toggle('open')">
            <div class="library-acc-header">
                <span style="font-size:18px; font-weight:900; color:var(--text-primary);">${r.Nombre_rutina}</span>
                <button class="btn-icon" onclick="event.stopPropagation(); editRoutine('${r.ID_entreno}')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
            </div>
            <div class="library-acc-body">
                ${exHtml}
            </div>
        </div>`;
    });
    
    // Imprimir el botón final de añadir
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
    
    // Seguro Anti-Caídas: si rData no existe, salimos
    if(!rData) {
        showToast("Error: Rutina no encontrada");
        return;
    }
    
    state.workoutExercises = [];
    
    try {
        fetchWithTimeout(WEBHOOK_URL, { 
            method: 'POST', 
            body: JSON.stringify({ 
                action: "iniciar_entreno", 
                user: USERNAME, 
                entreno_id: routineId,
                entreno_nombre: rData.Nombre_rutina,
                date: getLocalISODate(state.referenceDate) 
            }) 
        });
    } catch(e) { console.log("Post inicio error", e); }
    
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
    if(!confirm("¿Deseas resetear el entreno de hoy?")) return;
    try {
        showToast("Reseteando...");
        const res = await fetchWithTimeout(WEBHOOK_URL, { 
            method: 'POST', 
            body: JSON.stringify({ 
                action: "reset_entreno", 
                user: USERNAME, 
                entreno_id: state.activeWorkout, 
                date: getLocalISODate(state.referenceDate) 
            }) 
        });
        if(!res.ok) throw new Error();
        state.currentCardIndex = 0; document.getElementById('deck-container').classList.add('hidden'); checkTodayWorkout();
    } catch(e) { showToast("Error al resetear."); }
}

function renderDeck() {
    const wrapper = document.getElementById('cards-wrapper'); wrapper.innerHTML = '';
    document.getElementById('edge-right').style.opacity = 0; document.getElementById('edge-left').style.opacity = 0;

    if (state.currentCardIndex < state.workoutExercises.length) {
        if (state.currentCardIndex + 1 < state.workoutExercises.length) { wrapper.appendChild(createCardHtml(state.workoutExercises[state.currentCardIndex + 1], 'behind', state.currentCardIndex + 1)); }
        
        const activeCard = createCardHtml(state.workoutExercises[state.currentCardIndex], 'active entrance-anim', state.currentCardIndex);
        wrapper.appendChild(activeCard);
        
        setTimeout(() => activeCard.classList.remove('entrance-anim'), 1000);
        
        setupDynamicSets(state.currentCardIndex); setupSwipeTouch(activeCard);
    } else {
        wrapper.innerHTML = `<div class="swipe-card active animate entrance-anim" style="justify-content:center; align-items:center; text-align:center;"><svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:20px;"><polyline points="20 6 9 17 4 12"></polyline></svg><h2 class="card-title" style="color:var(--text-primary);">¡Entreno completado!</h2><button class="btn-primary" onclick="closeDeck()" style="margin-top:40px; width:80%;">Ver resultados</button></div>`;
        state.activeWorkout = null;
    }
}

async function finishAndSync() {
    closeDeck();
    showToast("Sincronizando entrenamiento...");
    await syncData(); // Lanzamos la sincronización al spot de n8n
}

function editRoutine(routineId) {
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
        setsHtml += `<div class="serie-row ${i > 1 ? 'hidden-set' : ''}" id="row-${index}-${i}"><div class="serie-num">${i}</div><div class="inputs-group"><input type="number" id="reps-${index}-${i}" class="serie-input input-reps" placeholder="Reps"><input type="number" id="kg-${index}-${i}" class="serie-input input-kg" placeholder="Kg"></div></div>`;
    }
    
    // AQUÍ ESTÁ LA MAGIA: 
    // Usamos el GIF de la base de datos. Si viene nulo o vacío, usamos la imagen por defecto.
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
        const repsIn = document.getElementById(`reps-${cardIndex}-${i}`), kgIn = document.getElementById(`kg-${cardIndex}-${i}`), row = document.getElementById(`row-${cardIndex}-${i}`);
        const makeActive = () => { document.querySelectorAll('.serie-row').forEach(r => r.classList.remove('active-input')); if(row) row.classList.add('active-input'); };
        if(repsIn) repsIn.addEventListener('focus', makeActive); if(kgIn) kgIn.addEventListener('focus', makeActive);
        
        const checkNext = () => {
            if(i < 5 && repsIn.value !== "" && kgIn.value !== "") {
                const nextRow = document.getElementById(`row-${cardIndex}-${i+1}`);
                if(nextRow && nextRow.classList.contains('hidden-set')) { nextRow.classList.remove('hidden-set'); }
            }
        };
        if(repsIn) repsIn.addEventListener('input', checkNext); if(kgIn) kgIn.addEventListener('input', checkNext);
    }
}

let startX = 0, currentX = 0, isDragging = false;
function setupSwipeTouch(card) {
    const rightEdge = document.getElementById('edge-right'), leftEdge = document.getElementById('edge-left'), threshold = window.innerWidth * 0.15; 
    card.addEventListener('touchstart', (e) => { if(e.target.tagName.toLowerCase() === 'input') return; startX = e.touches[0].clientX; isDragging = true; card.classList.remove('animate'); });
    card.addEventListener('touchmove', (e) => {
        if(!isDragging) return; currentX = e.touches[0].clientX - startX;
        card.style.transform = `translateX(${currentX}px) rotate(${currentX * 0.05}deg)`;
        if(currentX > 0) { let pct = Math.min(currentX / threshold, 1); rightEdge.style.transform = `translateX(-${pct * 100}px)`; rightEdge.style.opacity = pct; leftEdge.style.opacity = 0; } 
        else { let pct = Math.min(Math.abs(currentX) / threshold, 1); leftEdge.style.transform = `translateX(${pct * 100}px)`; leftEdge.style.opacity = pct; rightEdge.style.opacity = 0; }
    });
    card.addEventListener('touchend', () => {
        if(!isDragging) return; isDragging = false; card.classList.add('animate');
        if (currentX > threshold) { 
            card.style.transform = `translateX(${currentX}px) rotate(${currentX * 0.05}deg)`; 
            handleSaveSwipe(card, state.currentCardIndex);
        } 
        else if (currentX < -threshold) { 
            card.style.transform = `translateX(-${window.innerWidth * 1.5}px) rotate(-30deg)`; setTimeout(() => skipCardAndRequeue(), 300); 
        } 
        else { card.style.transform = `translateX(0px) rotate(0deg)`; rightEdge.style.opacity = 0; leftEdge.style.opacity = 0; }
        currentX = 0;
    });
}

async function handleSaveSwipe(card, index) {
    const exId = state.workoutExercises[index].ID_ejercicio;
    const seriesData = [];
    for(let i=1; i<=5; i++){ 
        const r = document.getElementById(`reps-${index}-${i}`)?.value; const k = document.getElementById(`kg-${index}-${i}`)?.value;
        if(r || k) seriesData.push({ reps: r || 0, kg: k || 0 }); 
    }
    
    const payload = { 
        action: "guardar_ejercicio", 
        user: USERNAME, 
        date: getLocalISODate(state.referenceDate), 
        entreno_id: state.activeWorkout, 
        ejercicio_id: exId, 
        series: seriesData 
    };
    
    try {
        card.style.opacity = "0.6"; 
        const res = await fetchWithTimeout(WEBHOOK_URL, { method: 'POST', body: JSON.stringify(payload) });
        if(!res.ok) throw new Error();
        card.style.transform = `translateX(${window.innerWidth * 1.5}px) rotate(30deg)`; card.style.opacity = "1";
        setTimeout(() => { state.currentCardIndex++; renderDeck(); }, 250);
    } catch(e) {
        card.style.opacity = "1"; card.style.transform = `translateX(0px) rotate(0deg)`;
        document.getElementById('edge-right').style.opacity = 0;
        showToast("Error de conexión. Vuelve a intentarlo.");
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
