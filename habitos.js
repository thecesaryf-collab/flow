const WEBHOOK_URL = 'https://automations-n8n.b8vwcm.easypanel.host/webhook/FLOW_mini';
const USERNAME = 'cesaryf';

const ICONS = {
    generico: { 
        empty: `<svg style="transform: scale(0.75)" viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg>`, 
        filled: `<svg style="transform: scale(0.75)" viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg>` 
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

const COLORS = ['#3b82f6', '#22c55e', '#8b5cf6', '#06b6d4', '#f59e0b', '#64748b', '#ef4444', '#eab308', '#ec4899', '#14b8a6'];
let state = { library: [], logs: [], currentView: 'day', referenceDate: new Date(), editingHabitId: null };
let currentForm = { nombre: '', color: COLORS[0].replace('#',''), icono: 'generico', slots: 1, freq: '1' };

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

document.addEventListener('DOMContentLoaded', async () => { setupUIEvents(); renderPicker(); await syncData(); });

async function syncData() {
    try {
        const response = await fetchWithTimeout(WEBHOOK_URL, { method: 'POST', body: JSON.stringify({ action: "syncro_habitos", user: USERNAME }) });
        const rawData = await response.json(); const payload = rawData[0];
        if (payload && payload.lib_habitos && payload.lib_habitos.length > 0) {
            state.library = Array.from(new Map(payload.lib_habitos.map(item => [item.ID_habito, item])).values());
            state.logs = payload.logs_habitos || []; renderHabits();
        } else {
            openCreateForm();
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
        let targetDates = [], periodName = "";
        if (state.currentView === 'week') {
            const start = getMonday(state.referenceDate);
            for(let i=0; i<7; i++) { let d = new Date(start); d.setDate(start.getDate() + i); targetDates.push(getLocalISODate(d)); }
            periodName = "días esta semana";
        } else {
            const y = state.referenceDate.getFullYear(), m = state.referenceDate.getMonth(), lastDay = new Date(y, m + 1, 0).getDate();
            for(let i=1; i<=lastDay; i++) targetDates.push(getLocalISODate(new Date(y, m, i)));
            periodName = "días este mes";
        }
        state.library.forEach((habit, index) => {
            let daysCompleted100 = 0;
            targetDates.forEach(dateStr => {
                const log = state.logs.find(l => l.ID_habito === habit.ID_habito && l.Fecha_log_habito === dateStr);
                if (log) { let filled = 0; for (let i = 1; i <= habit.Numero_slots_habito; i++) { if (log[`Log_habito_slot_${String(i).padStart(2, '0')}`] === 1) filled++; } if (filled >= habit.Numero_slots_habito) daysCompleted100++; }
            });
            const pct = Math.round((daysCompleted100 / targetDates.length) * 100);
            container.innerHTML += `<div class="habit-card entrance" style="--habit-color: #${habit.Color_habito}; --progress: ${pct}%; cursor: default; animation-delay: ${index * 0.08}s"><div class="habit-info"><span class="habit-percent">${pct}% Completado</span><span class="habit-name">${habit.Nombre_habito}</span></div><div class="habit-slots" style="font-weight: 700; color: var(--text-secondary); font-size: 14px;">${daysCompleted100} / ${targetDates.length} ${periodName}</div></div>`;
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
        if(currentForm.nombre.length >= 3) {
            document.getElementById('step-color').classList.add('active');
        } else {
            document.getElementById('step-color').classList.remove('active');
            document.getElementById('step-icon').classList.remove('active');
            document.getElementById('step-slots').classList.remove('active');
        }
        updatePreview();
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
    document.getElementById('preview-name').innerText = currentForm.nombre || "Escribe un nombre...";
    
    document.getElementById('live-preview').style.setProperty('--habit-color', `#${currentForm.color}`); 
    document.getElementById('live-preview').style.setProperty('--progress', '0%');
    
    const iconKey = (currentForm.icono || 'generico').toLowerCase().trim(); 
    const iconSet = ICONS[iconKey] || ICONS.generico; 
    
    let slotsHtml = '';
    for(let i = 0; i < currentForm.slots; i++) { 
        slotsHtml += `<div class="slot" style="color: #${currentForm.color}">${iconSet.empty}</div>`; 
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
            <div class="habit-card" style="--habit-color: #${h.Color_habito}; border-left: 5px solid #${h.Color_habito}; opacity: 1; margin-bottom: 10px; cursor: default;">
                <div class="habit-info" style="display: flex; align-items: center; gap: 15px; pointer-events: auto;">
                    <span class="habit-name" style="margin:0;">${h.Nombre_habito}</span>
                </div>
                <button class="btn-icon" onclick="openEditForm('${h.ID_habito}')" style="z-index: 10; position: relative;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
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
    
    document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
    document.getElementById('step-name').classList.add('active');
    
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
    
    document.querySelectorAll('.form-step').forEach(s => s.classList.add('active'));
    
    // Seleccionar el color correcto usando data-hex (Infallible)
    document.querySelectorAll('.color-circle').forEach(el => { 
        el.classList.remove('selected'); 
        if(el.dataset.hex === h.Color_habito) {
            el.classList.add('selected'); 
        }
    });
    
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
        closeModals(); 
        await syncData(); // Sincroniza la librería real desde el n8n

    } catch(e) { 
        showToast("Error al guardar en el servidor"); 
    } finally {
        btn.innerText = originalText;
        // Solo lo habilitamos de nuevo si pasa la validación
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