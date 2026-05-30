// Configuración
const USERNAME = localStorage.getItem('flow_mini_user');
const WEBHOOK_URL = 'https://automations-n8n.b8vwcm.easypanel.host/webhook/FLOW_mini';

const ICONS = {
    generico: { 
        // El estado vacío sigue siendo el círculo
        empty: `<svg style="transform: scale(0.75)" viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg>`, 
        
        // El estado lleno ahora es un check con un grosor (stroke-width) que lo hace destacar
        filled: `<svg style="transform: scale(0.85)" viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>` 
    },
    agua: { 
        empty: `<svg style="transform: scale(1.35)" viewBox="0 0 64 64" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2">
            <g transform="translate(20, 0) rotate(-45, 12, 32)">
                <path d="M7,6 L7,13 C7,13 0,23.9 0,25 L0,60 C0,61.1 0.9,62 2,62 L20,62 C21.1,62 22,61.1 22,60 L22,25 C22,23.9 15,13 15,13 L15,6"></path>
                <path d="M17,4 C17,5.1 16.1,6 15,6 L7,6 C5.9,6 5,5.1 5,4 L5,2 C5,0.9 5.9,0 7,0 L15,0 C16.1,0 17,0.9 17,2 L17,4 Z"></path>
            </g>
        </svg>`, 
        filled: `<svg style="transform: scale(1.35)" viewBox="0 0 64 64" width="100%" height="100%" fill="currentColor" stroke="currentColor" stroke-width="2">
            <g transform="translate(20, 0) rotate(-45, 12, 32)">
                <path d="M7,6 L7,13 C7,13 0,23.9 0,25 L0,60 C0,61.1 0.9,62 2,62 L20,62 C21.1,62 22,61.1 22,60 L22,25 C22,23.9 15,13 15,13 L15,6"></path>
                <path d="M17,4 C17,5.1 16.1,6 15,6 L7,6 C5.9,6 5,5.1 5,4 L5,2 C5,0.9 5.9,0 7,0 L15,0 C16.1,0 17,0.9 17,2 L17,4 Z"></path>
            </g>
        </svg>` 
    },
    comida: { 
        empty: `<svg viewBox="0 0 64 64" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2">
            <g transform="translate(1, 1)">
                <path d="M36.1,40.2 C36.1,40.2 42.5,46.6 44.3,48.4 C46.1,50.2 45.5,50.9 45.1,51.2 C43.1,53.2 44.4,57.8 46.4,59.8 C48.4,61.8 51.6,61.8 53.6,59.8 C54.8,58.6 55.3,56.9 55,55.3 C56.6,55.6 58.3,55.1 59.6,53.9 C61.6,51.9 61.6,48.6 59.6,46.6 C57.6,44.6 53,43.3 51,45.3 C50.7,45.6 50,46.2 48.5,44.7 C47,43.2 40,36.2 40,36.2"></path>
                <path d="M5.2,5.2 C-0.7,11.1 -3.1,18.2 6.4,27.6 C14.5,35.7 27.8,37.7 36.6,42 L35.2,35.4 L41.8,36.8 C35.7,26.9 35.9,14.7 27.6,6.4 C18.1,-3.1 11,-0.7 5.2,5.2 Z"></path>
                <path d="M11,6 C11,6 16.1,0.3 25.5,9.7"></path>
            </g>
        </svg>`, 
        filled: `<svg viewBox="0 0 64 64" width="100%" height="100%" fill="currentColor" stroke="currentColor" stroke-width="2">
            <g transform="translate(1, 1)">
                <path d="M36.1,40.2 C36.1,40.2 42.5,46.6 44.3,48.4 C46.1,50.2 45.5,50.9 45.1,51.2 C43.1,53.2 44.4,57.8 46.4,59.8 C48.4,61.8 51.6,61.8 53.6,59.8 C54.8,58.6 55.3,56.9 55,55.3 C56.6,55.6 58.3,55.1 59.6,53.9 C61.6,51.9 61.6,48.6 59.6,46.6 C57.6,44.6 53,43.3 51,45.3 C50.7,45.6 50,46.2 48.5,44.7 C47,43.2 40,36.2 40,36.2"></path>
                <path d="M5.2,5.2 C-0.7,11.1 -3.1,18.2 6.4,27.6 C14.5,35.7 27.8,37.7 36.6,42 L35.2,35.4 L41.8,36.8 C35.7,26.9 35.9,14.7 27.6,6.4 C18.1,-3.1 11,-0.7 5.2,5.2 Z"></path>
                <path d="M11,6 C11,6 16.1,0.3 25.5,9.7"></path>
            </g>
        </svg>` 
    },
    estrella: { 
        empty: `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`, 
        filled: `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>` 
    },
    corazon: { 
        empty: `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`, 
        filled: `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>` 
    }
};

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
let state = { library: [], logs: [], currentView: 'day', referenceDate: new Date(), editingHabitId: null };
let currentForm = { nombre: '', color: COLORS[0].replace('#',''), icono: 'generico', slots: 1, freq: '1' };
let previewFilledSlots = 0;

function getLocalISODate(date) { const offset = date.getTimezoneOffset(); return new Date(date.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0]; }
function getMonday(d) { d = new Date(d); const day = d.getDay(), diff = d.getDate() - day + (day === 0 ? -6 : 1); return new Date(d.setDate(diff)); }

async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 15000 } = options; 
    const controller = new AbortController(); 
    const id = setTimeout(() => controller.abort(), timeout);
    if (!options.headers) options.headers = { 'Content-Type': 'application/json' };
    const response = await fetch(resource, { ...options, signal: controller.signal }); 
    clearTimeout(id); 
    return response;
}

document.addEventListener('DOMContentLoaded', async () => { 
    setupUIEvents(); 
    renderPicker(); 
    await syncData(); 
    // Cierra el menú al tocar fuera
    document.addEventListener('click', (e) => {
    if(!e.target.closest('.log-actions-menu-container')) {
        document.querySelectorAll('.log-dropdown').forEach(m => m.classList.add('hidden'));
        // ANTES: document.querySelectorAll('.habit-card').forEach(...)
        // AHORA:
        document.querySelectorAll('.habit-card, .library-habit-card').forEach(acc => acc.classList.remove('menu-open'));
    }
});
});

async function syncData() {
    try {
        const response = await fetchWithTimeout(WEBHOOK_URL, { 
            method: 'POST', 
            body: JSON.stringify({ action: "syncro_habitos", user: USERNAME }) 
        });
        const rawData = await response.json(); 
        const payload = rawData[0] || {};

        // --- SOLUCIÓN: Filtrar los hábitos y logs que no tengan las propiedades esenciales ---
        
        // 1. Filtrar librería: Solo aceptamos los que tengan ID_habito y Nombre_habito
        if (payload.lib_habitos && Array.isArray(payload.lib_habitos)) {
            state.library = payload.lib_habitos.filter(item => item.ID_habito && item.Nombre_habito);
            // Si quieres eliminar duplicados (opcional):
            state.library = Array.from(new Map(state.library.map(item => [item.ID_habito, item])).values());
        } else {
            state.library = [];
        }

        // 2. Filtrar logs: Solo aceptamos los que tengan ID_habito
        if (payload.logs_habitos && Array.isArray(payload.logs_habitos)) {
            state.logs = payload.logs_habitos.filter(log => log.ID_habito);
        } else {
            state.logs = [];
        }
        
        renderHabits(); 
        
        if (state.library.length === 0) {
            openLibrary();
        }
    } catch (e) { showToast("Error de conexión al sincronizar."); }
}

function changeView(view) { state.currentView = view; document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active')); document.getElementById(`btn-${view}`).classList.add('active'); renderPicker(); renderHabits(); }
function updateReference(dateStr, el) { state.referenceDate = new Date(dateStr); renderPicker(); renderHabits(); }

function renderPicker() {
    const container = document.getElementById('picker-container'); container.innerHTML = ''; const d = new Date(state.referenceDate);
    if (state.currentView === 'day') {
        const daysNames = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
        for (let i = -14; i <= 0; i++) {
            let tempD = new Date(d); tempD.setDate(new Date().getDate() + i); const dateStr = getLocalISODate(tempD); const isSelected = dateStr === getLocalISODate(state.referenceDate);
            container.innerHTML += `<div class="day-item ${isSelected ? 'active' : ''}" onclick="updateReference('${tempD.toISOString()}', this)"><span class="day-num">${tempD.getDate()}</span><span class="day-name">${daysNames[tempD.getDay()]}</span></div>`;
        }
    } else if (state.currentView === 'week') {
        const currentMonday = getMonday(new Date());
        for (let i = -5; i <= 0; i++) {
            const start = new Date(currentMonday); start.setDate(start.getDate() + (i * 7)); const end = new Date(start); end.setDate(end.getDate() + 6); const isSelected = getLocalISODate(getMonday(state.referenceDate)) === getLocalISODate(start);
            container.innerHTML += `<div class="period-item ${isSelected ? 'active' : ''}" onclick="updateReference('${start.toISOString()}', this)">Semana: ${start.getDate()}/${start.getMonth()+1} al ${end.getDate()}/${end.getMonth()+1}</div>`;
        }
    } else if (state.currentView === 'month') {
        const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        for (let i = -6; i <= 0; i++) {
            const tempD = new Date(); tempD.setDate(1); tempD.setMonth(tempD.getMonth() + i); const isSelected = tempD.getMonth() === state.referenceDate.getMonth() && tempD.getFullYear() === state.referenceDate.getFullYear();
            container.innerHTML += `<div class="period-item ${isSelected ? 'active' : ''}" onclick="updateReference('${tempD.toISOString()}', this)">${monthNames[tempD.getMonth()]} ${tempD.getFullYear()}</div>`;
        }
    }
    setTimeout(() => { const activeEl = container.querySelector('.active'); if(activeEl) activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }); }, 50);
}

function renderHabits() {
    const container = document.getElementById('habits-container'); container.innerHTML = '';
    if (state.library.length === 0) { container.innerHTML = '<div class="empty-state">No tienes hábitos creados.</div>'; return; }

    if (state.currentView === 'day') {
        const dateStr = getLocalISODate(state.referenceDate);
        state.library.forEach((habit, index) => {
            const log = state.logs.find(l => l.ID_habito === habit.ID_habito && l.Fecha_log_habito === dateStr);
            let filledSlots = 0;
            if (log) { for(let i=1; i<=10; i++) { if(log[`Log_habito_slot_${String(i).padStart(2,'0')}`] === 1) filledSlots++; } }
            const pct = Math.round((filledSlots / habit.Numero_slots_habito) * 100);
            
            const iconKey = (habit.Icono_habito || 'generico').toLowerCase().trim();
            const iconSet = ICONS[iconKey] || ICONS.generico;

            let slotsHtml = '';
            for (let i = 1; i <= habit.Numero_slots_habito; i++) {
                const isFilled = log && log[`Log_habito_slot_${String(i).padStart(2,'0')}`] === 1;
                slotsHtml += `<div id="slot-${habit.ID_habito}-${i}" class="slot ${isFilled ? 'filled' : ''}" onclick="toggleSlot(event, '${habit.ID_habito}', ${i}, ${isFilled})" style="--habit-color: #${habit.Color_habito}">${isFilled ? iconSet.filled : iconSet.empty}</div>`;
            }
            container.innerHTML += `<div id="card-${habit.ID_habito}" class="habit-card entrance" onclick="fillNextSlot('${habit.ID_habito}')" style="--habit-color: #${habit.Color_habito}; --progress: ${pct}%; animation-delay: ${index * 0.08}s"><div class="habit-info"><span class="habit-percent">${pct}%</span><span class="habit-name">${habit.Nombre_habito}</span></div><div class="habit-slots">${slotsHtml}</div></div>`;
        });
    } else {
        // --- VISTAS SEMANAL Y MENSUAL ---
        let targetDates = [], periodName = "";
        
        if (state.currentView === 'week') {
            const start = getMonday(state.referenceDate);
            for(let i=0; i<7; i++) { 
                let d = new Date(start); 
                d.setDate(start.getDate() + i); 
                targetDates.push(getLocalISODate(d)); 
            }
            periodName = "esta semana";
        } else {
            const y = state.referenceDate.getFullYear();
            const m = state.referenceDate.getMonth();
            const lastDay = new Date(y, m + 1, 0).getDate();
            for(let i=1; i<=lastDay; i++) {
                targetDates.push(getLocalISODate(new Date(y, m, i)));
            }
            periodName = "este mes";
        }
        
        state.library.forEach((habit, index) => {
            let daysCompleted100 = 0;
            
            // 1. Calcular el "offset" del primer día (Lunes = 0, Domingo = 6)
            // Esto es crucial para que el calendario empiece en la columna correcta
            const firstDateStr = targetDates[0];
            const parts = firstDateStr.split('-'); 
            const localFirstDate = new Date(parts[0], parts[1] - 1, parts[2]);
            const offset = (localFirstDate.getDay() + 6) % 7; 
                
            
            // Comprobamos si estamos en la vista mensual para aplicar la clase "apretada"
            const isMonthView = state.currentView === 'month';
            
            // 2. Construir el Grid del Mini-Calendario (inyectando la clase si toca)
            let calendarHtml = `<div class="mini-calendar-grid ${isMonthView ? 'month-view' : ''}">`;
            
            // Añadir huecos vacíos para alinear el primer día
            for(let i = 0; i < offset; i++) {
                calendarHtml += `<div class="mini-day placeholder"></div>`;
            }

            // 3. Evaluar cada día y pintar círculo o check
            targetDates.forEach(dateStr => {
                const log = state.logs.find(l => l.ID_habito === habit.ID_habito && l.Fecha_log_habito === dateStr);
                let isFullyCompleted = false;
                
                if (log) { 
                    let filled = 0; 
                    for (let i = 1; i <= habit.Numero_slots_habito; i++) { 
                        if (log[`Log_habito_slot_${String(i).padStart(2, '0')}`] === 1) filled++; 
                    } 
                    if (filled >= habit.Numero_slots_habito) {
                        daysCompleted100++; 
                        isFullyCompleted = true;
                    } 
                }
                
                if(isFullyCompleted) {
                    calendarHtml += `<div class="mini-day completed" style="color: #${habit.Color_habito};">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>`;
                } else {
                    calendarHtml += `<div class="mini-day empty"></div>`;
                }
            });
            calendarHtml += `</div>`; // Cierra el grid

            const pct = Math.round((daysCompleted100 / targetDates.length) * 100);
            
            // 4. Inyectar todo en la tarjeta (Añadimos la clase 'month-card' si es vista mensual)
            container.innerHTML += `
            <div class="habit-card entrance ${isMonthView ? 'month-card' : ''}" style="--habit-color: #${habit.Color_habito}; --progress: ${pct}%; cursor: default; animation-delay: ${index * 0.08}s">
                <div class="habit-info">
                    <span class="habit-percent">${pct}% Completado</span>
                    <span class="habit-name">${habit.Nombre_habito}</span>
                </div>
                <div class="habit-calendar-side">
                    <div class="calendar-text">${daysCompleted100} / ${targetDates.length} ${periodName}</div>
                    ${calendarHtml}
                </div>
            </div>`;
        });
    }
}

function fillNextSlot(habitId) {
    if (state.currentView !== 'day') return;
    const habit = state.library.find(h => h.ID_habito === habitId);
    const log = state.logs.find(l => l.ID_habito === habitId && l.Fecha_log_habito === getLocalISODate(state.referenceDate));
    let nextEmptySlot = 0;
    for (let i = 1; i <= habit.Numero_slots_habito; i++) { if (!log || log[`Log_habito_slot_${String(i).padStart(2,'0')}`] === 0) { nextEmptySlot = i; break; } }
    if (nextEmptySlot > 0) toggleSlot({ stopPropagation: () => {} }, habitId, nextEmptySlot, false);
}

async function toggleSlot(e, habitId, slotIndex, isFilled) {
    e.stopPropagation(); if(state.currentView !== 'day') return;
    const card = document.getElementById(`card-${habitId}`);
    
    card.classList.remove('entrance'); 
    card.style.animation = 'none';

    const slotEl = document.getElementById(`slot-${habitId}-${slotIndex}`);
    const pctEl = card.querySelector('.habit-percent');
    const habit = state.library.find(h => h.ID_habito === habitId);
    const dateStr = getLocalISODate(state.referenceDate);
    const originalLog = state.logs.find(l => l.ID_habito === habitId && l.Fecha_log_habito === dateStr);
    const originalLogClone = originalLog ? { ...originalLog } : null;

    const cleanHabitId = habitId.replace(`_${USERNAME}`, '');
    let logToUpdate = originalLog ? { ...originalLog } : { ID_log_habito: `log${dateStr.replace(/-/g, '')}_${USERNAME}_${cleanHabitId}`, Usuario: USERNAME, Fecha_log_habito: dateStr, ID_habito: habitId, Log_habito_slot_01: 0, Log_habito_slot_02: 0, Log_habito_slot_03: 0, Log_habito_slot_04: 0, Log_habito_slot_05: 0, Log_habito_slot_06: 0, Log_habito_slot_07: 0, Log_habito_slot_08: 0, Log_habito_slot_09: 0, Log_habito_slot_10: 0 };
    const slotKey = `Log_habito_slot_${String(slotIndex).padStart(2, '0')}`; logToUpdate[slotKey] = isFilled ? 0 : 1; const willBeFilled = !isFilled;

    const logIndex = state.logs.findIndex(l => l.ID_habito === habitId && l.Fecha_log_habito === dateStr);
    if (logIndex >= 0) state.logs[logIndex] = logToUpdate; else state.logs.push(logToUpdate);

    let filledSlots = 0; for(let i=1; i<=habit.Numero_slots_habito; i++) { if(logToUpdate[`Log_habito_slot_${String(i).padStart(2,'0')}`] === 1) filledSlots++; }
    const pct = Math.round((filledSlots / habit.Numero_slots_habito) * 100);

    card.style.setProperty('--progress', `${pct}%`); pctEl.innerText = `${pct}%`;
    const iconKey = (habit.Icono_habito || 'generico').toLowerCase().trim();
    const iconSet = ICONS[iconKey] || ICONS.generico;

    if (willBeFilled) { slotEl.classList.add('filled'); slotEl.innerHTML = iconSet.filled; slotEl.setAttribute('onclick', `toggleSlot(event, '${habitId}', ${slotIndex}, true)`); } 
    else { slotEl.classList.remove('filled'); slotEl.innerHTML = iconSet.empty; slotEl.setAttribute('onclick', `toggleSlot(event, '${habitId}', ${slotIndex}, false)`); }

    try {
        const res = await fetchWithTimeout(WEBHOOK_URL, { method: 'POST', body: JSON.stringify({ action: "actualizar_log_habito", user: USERNAME, log: logToUpdate }) });
        if (!res.ok) throw new Error();
        card.classList.remove('success-pop'); void card.offsetWidth; card.classList.add('success-pop');
    } catch(err) {
        showToast("Error de servidor. Cambios revertidos.");
        if (originalLogClone) state.logs[logIndex] = originalLogClone; else state.logs = state.logs.filter(l => !(l.ID_habito === habitId && l.Fecha_log_habito === dateStr));
        let oldFilled = 0; if (originalLogClone) { for(let i=1; i<=habit.Numero_slots_habito; i++) { if(originalLogClone[`Log_habito_slot_${String(i).padStart(2,'0')}`] === 1) oldFilled++; } }
        const oldPct = Math.round((oldFilled / habit.Numero_slots_habito) * 100);
        card.style.setProperty('--progress', `${oldPct}%`); pctEl.innerText = `${oldPct}%`;
        if (isFilled) { slotEl.classList.add('filled'); slotEl.innerHTML = iconSet.filled; slotEl.setAttribute('onclick', `toggleSlot(event, '${habitId}', ${slotIndex}, true)`); } 
        else { slotEl.classList.remove('filled'); slotEl.innerHTML = iconSet.empty; slotEl.setAttribute('onclick', `toggleSlot(event, '${habitId}', ${slotIndex}, false)`); }
    }
}

// ----------------------------------------------------
// UI Y FORMULARIO PROGRESIVO
// ----------------------------------------------------
function setupUIEvents() {
    document.getElementById('fab-add').addEventListener('click', openLibrary);
    
    document.getElementById('habit-name').addEventListener('input', (e) => { 
    currentForm.nombre = e.target.value; 
    
    // Cambiar la etiqueta de título
    const label = document.getElementById('preview-label');
    if(currentForm.nombre.trim().length > 0) {
        label.innerText = "Vista previa";
    } else {
        label.innerText = "1. Nombra tu hábito";
    }

    // Desplegar el siguiente paso
    if(currentForm.nombre.length >= 3) {
        document.getElementById('step-color').classList.add('active');
    } else {
        document.getElementById('step-color').classList.remove('active');
        document.getElementById('step-icon').classList.remove('active');
        document.getElementById('step-slots').classList.remove('active');
    }
    
    validateFormChanges();
});
    
    const cp = document.getElementById('color-picker'); 
    cp.innerHTML = ''; // Limpiamos por si acaso
    COLORS.forEach(c => {
        // Guardamos el HEX limpio en un atributo data-hex
        const cleanHex = c.replace('#', '');
        cp.innerHTML += `<div class="color-circle" data-hex="${cleanHex}" style="background: ${c}" onclick="selectColor('${c}', this)"></div>`;
    });
    
    const ip = document.getElementById('icon-picker'); 
    ip.innerHTML = '';
    Object.keys(ICONS).forEach(k => ip.innerHTML += `<div class="icon-box" onclick="selectIcon('${k}', this)">${ICONS[k].empty}</div>`);
}

function selectColor(color, element) { 
    currentForm.color = color.replace('#', ''); 
    document.querySelectorAll('.color-circle').forEach(el => el.classList.remove('selected'));
    if(element) element.classList.add('selected');
    
    document.getElementById('step-icon').classList.add('active'); 
    updatePreview(); 
    validateFormChanges();
}

function selectIcon(iconKey, element) { 
    currentForm.icono = iconKey; 
    document.querySelectorAll('.icon-box').forEach(el => el.classList.remove('selected')); 
    if(element) element.classList.add('selected');
    
    document.getElementById('step-slots').classList.add('active'); 
    updatePreview(); 
    validateFormChanges();
}

function validateFormChanges() {
    const btn = document.getElementById('btn-save-habit');
    const isValid = currentForm.nombre.length >= 3 && currentForm.color && currentForm.icono;
    btn.disabled = !isValid;
}

function updatePreview() {
    currentForm.slots = document.getElementById('habit-slots').value; 
    document.getElementById('slots-value').innerText = `${currentForm.slots} paso(s)`; 
    
    document.getElementById('live-preview').style.setProperty('--habit-color', `#${currentForm.color}`); 
    document.getElementById('live-preview').style.setProperty('--progress', '0%');
    document.getElementById('preview-percent').innerText = '0%';
    previewFilledSlots = 0; // Resetear simulación al cambiar configuración
    
    const iconKey = (currentForm.icono || 'generico').toLowerCase().trim(); 
    const iconSet = ICONS[iconKey] || ICONS.generico; 
    
    let slotsHtml = '';
    for(let i = 0; i < currentForm.slots; i++) { 
        slotsHtml += `<div class="slot" id="prev-slot-${i}" style="color: #${currentForm.color}">${iconSet.empty}</div>`; 
    }
    document.getElementById('preview-slots').innerHTML = slotsHtml;
}

// ----------------------------------------------------
// MODALES Y LIBRERÍA
// ----------------------------------------------------
function openLibrary() { 
    const list = document.getElementById('library-list'); 
    list.innerHTML = ''; 
    
    if (state.library.length === 0) {
        list.innerHTML = '<div class="empty-state">No tienes hábitos creados.</div>';
    } else {
        state.library.forEach(h => { 
            list.innerHTML += `
            <div class="library-habit-card" data-id="${h.ID_habito}" style="border-left: 5px solid #${h.Color_habito};">
                <div class="delete-progress-bar" id="del-prog-${h.ID_habito}"></div>
                <div class="habit-info" style="display: flex; justify-content: space-between; align-items: center; width: 100%; pointer-events: auto; position: relative; z-index: 2;">
                    <span class="habit-name" style="margin:0;">${h.Nombre_habito}</span>
                    
                    <div class="log-actions-menu-container" style="position: relative;">
                        <button class="log-action-btn" onclick="toggleLibMenu('${h.ID_habito}', event)">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"></circle><circle cx="12" cy="5" r="2"></circle><circle cx="12" cy="19" r="2"></circle></svg>
                        </button>
                        <div id="lib-menu-${h.ID_habito}" class="log-dropdown hidden" style="top: 100%; right: 0;">
                            <div class="log-dropdown-item" onclick="openEditForm('${h.ID_habito}'); toggleLibMenu('${h.ID_habito}', event)">Editar hábito</div>
                            <div class="log-dropdown-item delete" onclick="deleteHabit('${h.ID_habito}', event); toggleLibMenu('${h.ID_habito}', event)">Eliminar hábito</div>
                        </div>
                    </div>
                </div>
            </div>`; 
        });
    }
    
    list.innerHTML += `<div class="add-habit-card" onclick="openCreateForm()"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Añadir hábito</div>`;
    
    document.getElementById('library-panel').classList.remove('hidden'); 
}

function openCreateForm() { 
    state.editingHabitId = null; 
    currentForm = { nombre: '', color: COLORS[0].replace('#',''), icono: 'generico', slots: 1, freq: '1' };
    
    document.getElementById('form-title').innerText = "Nuevo Hábito"; 
    document.getElementById('habit-name').value = '';
    document.getElementById('habit-slots').value = 1;
    
    // Ocultamos todos los pasos extra al principio
    document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
    
    // Actualizamos la etiqueta superior de la vista previa
    const label = document.getElementById('preview-label');
    if (label) label.innerText = "1. Nombra tu hábito";
    
    document.querySelectorAll('.color-circle, .icon-box').forEach(el => el.classList.remove('selected'));
    
    updatePreview();
    validateFormChanges();
    document.getElementById('library-panel').classList.add('hidden');
    document.getElementById('form-panel').classList.remove('hidden'); 
}

function openEditForm(id) { 
    state.editingHabitId = id; 
    const h = state.library.find(x => x.ID_habito === id); 
    
    document.getElementById('form-title').innerText = "Editar Hábito"; 
    document.getElementById('habit-name').value = h.Nombre_habito; 
    currentForm.nombre = h.Nombre_habito; 
    currentForm.color = h.Color_habito; 
    currentForm.icono = h.Icono_habito; 
    currentForm.slots = h.Numero_slots_habito;
    document.getElementById('habit-slots').value = h.Numero_slots_habito;
    
    // Al editar, mostramos todos los pasos directamente
    document.querySelectorAll('.form-step').forEach(s => s.classList.add('active'));
    
    // Como ya tiene nombre, la etiqueta siempre es "Vista previa"
    const label = document.getElementById('preview-label');
    if (label) label.innerText = "Vista previa";
    
    // Seleccionar el color correcto usando data-hex
    document.querySelectorAll('.color-circle').forEach(el => { 
        el.classList.remove('selected'); 
        if(el.dataset.hex === h.Color_habito) {
            el.classList.add('selected'); 
        }
    });
    
    // Seleccionar el icono correcto
    document.querySelectorAll('.icon-box').forEach(el => {
        el.classList.remove('selected');
        const hIcon = ICONS[h.Icono_habito || 'generico'].empty;
        if(el.innerHTML.includes(hIcon)) el.classList.add('selected');
    });

    updatePreview(); 
    validateFormChanges();
    document.getElementById('library-panel').classList.add('hidden');
    document.getElementById('form-panel').classList.remove('hidden'); 
}
async function saveHabit() { 
    if(document.getElementById('btn-save-habit').disabled) return;
    
    const isEdit = state.editingHabitId !== null; 
    
    // 1. CÁLCULO DEL ID SECUENCIAL (Solo si es nuevo)
    let finalId = state.editingHabitId;
    if (!isEdit) {
        let maxNum = 0;
        state.library.forEach(h => {
            if (h.ID_habito && typeof h.ID_habito === 'string') {
                const match = h.ID_habito.match(/habit(\d+)_/i);
                if (match && match[1]) {
                    const num = parseInt(match[1], 10);
                    if (num > maxNum) maxNum = num;
                }
            }
        });
        const nextNum = String(maxNum + 1).padStart(3, '0');
        finalId = `habit${nextNum}_${USERNAME}`;
    }

    // 2. PAYLOAD PLANO
    const freqEl = document.getElementById('habit-freq');
    const slotsEl = document.getElementById('habit-slots');

    const payloadPlano = {
        action: "guardar_habito", 
        user: USERNAME,
        id_habito: finalId,
        nombre: currentForm.nombre,
        color: currentForm.color,
        icono: currentForm.icono,
        slots: parseInt(slotsEl ? slotsEl.value : currentForm.slots, 10),
        frecuencia: freqEl ? freqEl.value : "1"
    };

    // 3. FETCH SENCILLO (Estilo Entrenos)
    const btn = document.getElementById('btn-save-habit');
    const originalText = btn.innerText;
    
    try { 
        btn.innerText = "Guardando...";
        btn.disabled = true;

        const res = await fetchWithTimeout(WEBHOOK_URL, { 
            method: 'POST', 
            body: JSON.stringify(payloadPlano) 
        }); 
        
        if(!res.ok) throw new Error();

        showToast("Hábito guardado"); 
        
        // --- ACTUALIZACIÓN INSTANTÁNEA LOCAL EN MEMORIA ---
        const localHabitObj = {
            ID_habito: finalId,
            Nombre_habito: currentForm.nombre,
            Color_habito: currentForm.color,
            Icono_habito: currentForm.icono,
            Numero_slots_habito: parseInt(slotsEl ? slotsEl.value : currentForm.slots, 10),
            Frecuencia_habito: freqEl ? freqEl.value : "1"
        };
        const existingIndex = state.library.findIndex(h => h.ID_habito === finalId);
        if(existingIndex > -1) state.library[existingIndex] = localHabitObj;
        else state.library.push(localHabitObj);

        // --- TRUCO CERO PARPADEOS ---
        // Ocultamos solo el formulario y cargamos la librería al milisegundo
        document.getElementById('form-panel').classList.add('hidden');
        openLibrary(); 

        // La sincronización real con n8n ocurre de fondo en absoluto secreto
        await new Promise(resolve => setTimeout(resolve, 1000));
        await syncData();

    } catch(e) { 
        showToast("Error al guardar en el servidor"); 
    } finally {
        btn.innerText = originalText;
        validateFormChanges();
    }
}

function closeModals() { document.querySelectorAll('.modal-panel').forEach(m => m.classList.add('hidden')); }

function showToast(msg) { 
    const toast = document.createElement('div'); toast.className = 'toast'; 
    toast.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> ${msg}`; 
    document.getElementById('toast-container').appendChild(toast); 
    setTimeout(() => toast.remove(), 4000); 
}

// ----------------------------------------------------
// NAVEGACIÓN Y SIDEBAR
// ----------------------------------------------------
const menuBtn = document.getElementById('menu-btn'), closeMenuBtn = document.getElementById('close-menu'), sidebar = document.getElementById('sidebar'), overlay = document.getElementById('overlay');
menuBtn.addEventListener('click', () => { sidebar.classList.add('open'); overlay.classList.add('show'); }); 
const closeMenu = () => { sidebar.classList.remove('open'); overlay.classList.remove('show'); };
closeMenuBtn.addEventListener('click', closeMenu); overlay.addEventListener('click', closeMenu);

// ----------------------------------------------------
// FUNCIONES DE MENÚ Y BORRADO DE HÁBITOS
// ----------------------------------------------------
function toggleLibMenu(id, event) {
    if(event) event.stopPropagation();
    const menu = document.getElementById(`lib-menu-${id}`);
    const isHidden = menu.classList.contains('hidden');
    
    document.querySelectorAll('.log-dropdown').forEach(m => m.classList.add('hidden')); 
    
    // 1. Limpiar la clase de TODAS las tarjetas
    document.querySelectorAll('.habit-card, .library-habit-card').forEach(acc => acc.classList.remove('menu-open'));
    
    if(isHidden) {
        menu.classList.remove('hidden');
        // 2. CORRECCIÓN: Buscar específicamente en la librería
        const acc = document.querySelector(`.library-habit-card[data-id="${id}"]`);
        if(acc) acc.classList.add('menu-open');
    }
}

async function deleteHabit(habitId, event) {
    if(event) { event.stopPropagation(); event.preventDefault(); }
    if(!confirm("¿Seguro que quieres eliminar este hábito?")) return;

    // --- AQUÍ ESTABA EL ERROR: Ya está corregido a .library-habit-card ---
    const accElement = document.querySelector(`.library-habit-card[data-id="${habitId}"]`);
    if (!accElement) return;

    const habitToDelete = state.library.find(h => h.ID_habito === habitId);
    let deletedNum = 0;
    const matchDeleted = habitId.match(/habit(\d+)_/i);
    if(matchDeleted) deletedNum = parseInt(matchDeleted[1], 10);
    
    let reagrupacion = [];
    state.library.forEach(h => {
        const numMatch = h.ID_habito.match(/habit(\d+)_/i);
        if (numMatch) {
            const num = parseInt(numMatch[1], 10);
            if (num > deletedNum) {
                const newNumStr = String(num - 1).padStart(3, '0');
                const newId = `habit${newNumStr}_${USERNAME}`;
                reagrupacion.push({
                    ...h,
                    ID_habito_origen: h.ID_habito,
                    ID_habito_destino: newId
                });
            }
        }
    });

    const payload = {
        action: "eliminar_habito", 
        user: USERNAME,
        eliminado: habitToDelete,
        reagrupacion: reagrupacion
    };

    const progBar = document.getElementById(`del-prog-${habitId}`);
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
                state.library = state.library.filter(h => h.ID_habito !== habitId);
                reagrupacion.forEach(reag => {
                    const localH = state.library.find(h => h.ID_habito === reag.ID_habito_origen);
                    if(localH) localH.ID_habito = reag.ID_habito_destino;
                    
                    // --- AQUÍ TAMBIÉN CORREGIMOS EL SELECTOR ---
                    const domEl = document.querySelector(`.library-habit-card[data-id="${reag.ID_habito_origen}"]`);
                    if(domEl) {
                        domEl.dataset.id = reag.ID_habito_destino;
                        domEl.innerHTML = domEl.innerHTML.replaceAll(reag.ID_habito_origen, reag.ID_habito_destino);
                    }
                });
                
                if(accElement) accElement.remove();
                
                renderHabits(); // Recarga la vista principal
                showToast("Hábito eliminado correctamente");
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
// Simula rellenar los slots de la vista previa al clickar
function simulatePreviewSlot() {
    const totalSlots = parseInt(currentForm.slots) || 1;
    const iconKey = (currentForm.icono || 'generico').toLowerCase().trim(); 
    const iconSet = ICONS[iconKey] || ICONS.generico; 
    
    // Lógica: Si ya están todos llenos, reseteamos. Si no, llenamos uno más.
    if (previewFilledSlots >= totalSlots) {
        previewFilledSlots = 0;
    } else {
        previewFilledSlots++;
    }

    // Calcular progreso
    const pct = Math.round((previewFilledSlots / totalSlots) * 100);
    document.getElementById('live-preview').style.setProperty('--progress', `${pct}%`);
    document.getElementById('preview-percent').innerText = `${pct}%`;

    // Actualizar iconos HTML
    for(let i = 0; i < totalSlots; i++) {
        const slotEl = document.getElementById(`prev-slot-${i}`);
        if (i < previewFilledSlots) {
            slotEl.classList.add('filled');
            slotEl.innerHTML = iconSet.filled;
        } else {
            slotEl.classList.remove('filled');
            slotEl.innerHTML = iconSet.empty;
        }
    }
    
    // Rebote sutil animado
    const card = document.getElementById('live-preview');
    card.classList.remove('success-pop');
    void card.offsetWidth; // Reflow para reiniciar la animación
    card.classList.add('success-pop');
}
// --- FUNCIÓN CERRAR SESIÓN ---
function cerrarSesion() {
    // 1. Borramos el usuario guardado
    localStorage.removeItem('flow_mini_user');
    // 2. Redirigimos al login
    window.location.replace('logchapuzaprovisional.html');
}
