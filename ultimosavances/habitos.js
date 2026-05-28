const WEBHOOK_URL = 'https://automations-n8n.b8vwcm.easypanel.host/webhook-test/FLOW_mini';
const USERNAME = 'cesaryf';

// Iconos SVG
const ICONS = {
    generico: { empty: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg>`, filled: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg>` },
    agua: { empty: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 2v2.53a1 1 0 0 1-.36.77L6.87 8A2 2 0 0 0 6 9.5V20a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9.5a2 2 0 0 0-.87-1.5l-2.77-2.73a1 1 0 0 1-.36-.77V2"/><path d="M10 2h4"/></svg>`, filled: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M10 2v2.53a1 1 0 0 1-.36.77L6.87 8A2 2 0 0 0 6 9.5V20a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9.5a2 2 0 0 0-.87-1.5l-2.77-2.73a1 1 0 0 1-.36-.77V2"/><path d="M10 2h4"/></svg>` },
    comida: { empty: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 8 C7 3, 17 3, 17 8 C17 12, 14 14.5, 14 15.5 L10 15.5 C10 14.5, 7 12, 7 8 Z"/><path d="M10.5 15.5 L10.5 18.5 A1.5 1.5 0 1 0 12 20 A1.5 1.5 0 1 0 13.5 18.5 L13.5 15.5"/></svg>`, filled: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M7 8 C7 3, 17 3, 17 8 C17 12, 14 14.5, 14 15.5 L10 15.5 C10 14.5, 7 12, 7 8 Z"/><path d="M10.5 15.5 L10.5 18.5 A1.5 1.5 0 1 0 12 20 A1.5 1.5 0 1 0 13.5 18.5 L13.5 15.5"/></svg>` }
};

const COLORS = ['#3b82f6', '#22c55e', '#8b5cf6', '#06b6d4', '#f59e0b', '#64748b', '#ef4444', '#eab308', '#ec4899', '#14b8a6'];

// Estado Global
let state = {
    library: [],
    logs: [],
    currentView: 'day',
    referenceDate: new Date(), 
    editingHabitId: null
};

let currentForm = { nombre: '', color: COLORS[0], icono: 'generico', slots: 1, freq: '1' };

// --- HELPERS DE FECHA (Evitar problemas de Zona Horaria) ---
function getLocalISODate(date) {
    const offset = date.getTimezoneOffset();
    const d = new Date(date.getTime() - (offset * 60 * 1000));
    return d.toISOString().split('T')[0];
}

function getMonday(d) {
    d = new Date(d);
    const day = d.getDay(), diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}

// --- CORE INIT ---
document.addEventListener('DOMContentLoaded', async () => {
    setupUIEvents();
    renderPicker();
    await syncData();
});

async function syncData() {
    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: "syncro_habitos", user: USERNAME })
        });
        
        // Simulación con tu JSON (si en tu n8n real lo haces, cambia a const data = await response.json())
        const data = await mockN8nResponse(); 

        if (data === "aún no hay hábitos") {
            openCreateForm();
        } else {
            // Eliminar duplicados de la librería por si n8n manda de más
            const uniqueLibrary = Array.from(new Map(data.LIBRERIA_HABITOS.map(item => [item.ID_habito, item])).values());
            state.library = uniqueLibrary;
            state.logs = data.LOGS_HABITOS;
            renderHabits();
        }
    } catch (e) {
        showToast("Error de conexión.");
    }
}

// --- RENDERIZADO VISTAS ---
function changeView(view) {
    state.currentView = view;
    document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`btn-${view}`).classList.add('active');
    renderPicker();
    renderHabits();
}

function updateReference(dateStr, el) {
    state.referenceDate = new Date(dateStr);
    renderPicker();
    renderHabits();
}

function renderPicker() {
    const container = document.getElementById('picker-container');
    container.innerHTML = '';
    const d = new Date(state.referenceDate);
    const todayStr = getLocalISODate(new Date());

    if (state.currentView === 'day') {
        const daysNames = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
        // Generar 15 días hacia atrás
        for (let i = -14; i <= 0; i++) {
            let tempD = new Date(d); tempD.setDate(new Date().getDate() + i);
            const dateStr = getLocalISODate(tempD);
            const isSelected = dateStr === getLocalISODate(state.referenceDate);
            container.innerHTML += `
                <div class="day-item ${isSelected ? 'active' : ''}" onclick="updateReference('${tempD.toISOString()}', this)">
                    <span class="day-num">${tempD.getDate()}</span>
                    <span class="day-name">${daysNames[tempD.getDay()]}</span>
                </div>`;
        }
    } else if (state.currentView === 'week') {
        const currentMonday = getMonday(new Date());
        for (let i = -5; i <= 0; i++) {
            const start = new Date(currentMonday); start.setDate(start.getDate() + (i * 7));
            const end = new Date(start); end.setDate(end.getDate() + 6);
            const isSelected = getLocalISODate(getMonday(state.referenceDate)) === getLocalISODate(start);
            container.innerHTML += `
                <div class="period-item ${isSelected ? 'active' : ''}" onclick="updateReference('${start.toISOString()}', this)">
                    Semana: ${start.getDate()}/${start.getMonth()+1} al ${end.getDate()}/${end.getMonth()+1}
                </div>`;
        }
    } else if (state.currentView === 'month') {
        const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        for (let i = -6; i <= 0; i++) {
            const tempD = new Date(); tempD.setDate(1); tempD.setMonth(tempD.getMonth() + i);
            const isSelected = tempD.getMonth() === state.referenceDate.getMonth() && tempD.getFullYear() === state.referenceDate.getFullYear();
            container.innerHTML += `
                <div class="period-item ${isSelected ? 'active' : ''}" onclick="updateReference('${tempD.toISOString()}', this)">
                    ${monthNames[tempD.getMonth()]} ${tempD.getFullYear()}
                </div>`;
        }
    }
    
    // Auto-scroll al elemento activo
    setTimeout(() => {
        const activeEl = container.querySelector('.active');
        if(activeEl) activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, 50);
}

function renderHabits() {
    const container = document.getElementById('habits-container');
    container.innerHTML = '';

    if (state.library.length === 0) {
        container.innerHTML = '<div class="empty-state">No tienes hábitos creados.</div>';
        return;
    }

    if (state.currentView === 'day') {
        const dateStr = getLocalISODate(state.referenceDate);
        
        state.library.forEach(habit => {
            const log = state.logs.find(l => l.ID_habito === habit.ID_habito && l.Fecha_log_habito === dateStr);
            
            let filledSlots = 0;
            if (log) {
                for(let i=1; i<=10; i++) {
                    if(log[`Log_habito_slot_${String(i).padStart(2,'0')}`] === 1) filledSlots++;
                }
            }

            const pct = Math.round((filledSlots / habit.Numero_slots_habito) * 100);
            const iconSet = ICONS[habit.Icono_habito] || ICONS.generico;

            let slotsHtml = '';
            for (let i = 1; i <= habit.Numero_slots_habito; i++) {
                const isFilled = i <= filledSlots;
                slotsHtml += `<div class="slot ${isFilled ? 'filled' : ''}" onclick="toggleSlot(event, '${habit.ID_habito}', ${i}, ${isFilled})" style="--habit-color: #${habit.Color_habito}">${isFilled ? iconSet.filled : iconSet.empty}</div>`;
            }

            container.innerHTML += `
                <div class="habit-card" onclick="addSlot('${habit.ID_habito}')" style="--habit-color: #${habit.Color_habito}; --progress: ${pct}%">
                    <div class="habit-info">
                        <span class="habit-percent">${pct}%</span>
                        <span class="habit-name">${habit.Nombre_habito}</span>
                    </div>
                    <div class="habit-slots">${slotsHtml}</div>
                </div>
            `;
        });
    } else {
        // --- LÓGICA DE SEMANA Y MES (Agregación) ---
        let targetDates = [];
        let periodName = "";
        
        if (state.currentView === 'week') {
            const start = getMonday(state.referenceDate);
            for(let i=0; i<7; i++) {
                let d = new Date(start); d.setDate(start.getDate() + i);
                targetDates.push(getLocalISODate(d));
            }
            periodName = "días esta semana";
        } else {
            const y = state.referenceDate.getFullYear(), m = state.referenceDate.getMonth();
            const lastDay = new Date(y, m + 1, 0).getDate();
            for(let i=1; i<=lastDay; i++) {
                let d = new Date(y, m, i);
                targetDates.push(getLocalISODate(d));
            }
            periodName = "días este mes";
        }

        state.library.forEach(habit => {
            let daysCompleted100 = 0;

            // Revisamos cada día del periodo (Semana o Mes)
            targetDates.forEach(dateStr => {
                const log = state.logs.find(l => l.ID_habito === habit.ID_habito && l.Fecha_log_habito === dateStr);
                if (log) {
                    let filled = 0;
                    for (let i = 1; i <= habit.Numero_slots_habito; i++) {
                        if (log[`Log_habito_slot_${String(i).padStart(2, '0')}`] === 1) filled++;
                    }
                    // Solo suma 1 si ese día se cumplió al 100%
                    if (filled >= habit.Numero_slots_habito) daysCompleted100++;
                }
            });

            const pct = Math.round((daysCompleted100 / targetDates.length) * 100);

            // Renderizamos la card SIN iconos clicleables, solo info
            container.innerHTML += `
                <div class="habit-card" style="--habit-color: #${habit.Color_habito}; --progress: ${pct}%; cursor: default;">
                    <div class="habit-info">
                        <span class="habit-percent">${pct}% Completado</span>
                        <span class="habit-name">${habit.Nombre_habito}</span>
                    </div>
                    <div class="habit-slots" style="font-weight: 700; color: var(--text-secondary); font-size: 14px;">
                        ${daysCompleted100} / ${targetDates.length} ${periodName}
                    </div>
                </div>
            `;
        });
    }
}

// --- INTERACCIONES Y WEBHOOKS ---
async function addSlot(habitId) {
    if(state.currentView !== 'day') return; // En semana/mes no se puede añadir
    fetch(WEBHOOK_URL, { method: 'POST', body: JSON.stringify({ action: "rellenar_slot", habit_id: habitId, user: USERNAME }) });
    showToast("Slot completado ✅");
}

async function toggleSlot(e, habitId, slotIndex, isFilled) {
    e.stopPropagation();
    if(state.currentView !== 'day') return;

    if (isFilled) {
        fetch(WEBHOOK_URL, { method: 'POST', body: JSON.stringify({ action: "vaciar_slot", habit_id: habitId, slot_index: slotIndex }) });
        showToast("Slot vaciado ❌");
    } else {
        addSlot(habitId);
    }
}

// --- FORMULARIO CREACIÓN PROGRESIVA ---
function setupUIEvents() {
    document.getElementById('fab-add').addEventListener('click', openLibrary);
    document.getElementById('habit-name').addEventListener('input', (e) => {
        currentForm.nombre = e.target.value;
        if(currentForm.nombre.length > 2) document.getElementById('step-color').classList.add('active');
        updatePreview();
    });

    const cp = document.getElementById('color-picker');
    COLORS.forEach(c => cp.innerHTML += `<div class="color-circle" style="background: ${c}" onclick="selectColor('${c}')"></div>`);

    const ip = document.getElementById('icon-picker');
    Object.keys(ICONS).forEach(k => ip.innerHTML += `<div class="icon-box" onclick="selectIcon('${k}')">${ICONS[k].empty}</div>`);
}

function selectColor(color) {
    currentForm.color = color;
    document.querySelectorAll('.color-circle').forEach(el => {
        el.classList.remove('selected');
        if(el.style.background === color) el.classList.add('selected');
    });
    document.getElementById('step-icon').classList.add('active');
    updatePreview();
}

function selectIcon(iconKey) {
    currentForm.icono = iconKey;
    document.querySelectorAll('.icon-box').forEach(el => el.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
    document.getElementById('step-slots').classList.add('active');
    document.getElementById('step-freq').classList.add('active');
    updatePreview();
}

function updatePreview() {
    currentForm.slots = document.getElementById('habit-slots').value;
    document.getElementById('slots-value').innerText = `${currentForm.slots} paso(s)`;
    document.getElementById('preview-name').innerText = currentForm.nombre || "Escribe un nombre...";
    document.getElementById('live-preview').style.setProperty('--habit-color', currentForm.color);
    document.getElementById('live-preview').style.setProperty('--progress', '0%');
    
    const iconSet = ICONS[currentForm.icono] || ICONS.generico;
    let slotsHtml = '';
    for(let i=0; i<currentForm.slots; i++) { slotsHtml += `<div class="slot" style="color: ${currentForm.color}">${iconSet.empty}</div>`; }
    document.getElementById('preview-slots').innerHTML = slotsHtml;
}

async function saveHabit() {
    const isEdit = state.editingHabitId !== null;
    const action = isEdit ? "guardar_habito" : "crear_habito";

    try {
        await fetch(WEBHOOK_URL, { method: 'POST', body: JSON.stringify({ action: action, data: currentForm, user: USERNAME }) });
        showToast(isEdit ? "Hábito actualizado" : "Hábito creado");
        closeModals();
        syncData(); 
    } catch(e) { showToast("Error al guardar"); }
}

function openLibrary() {
    const list = document.getElementById('library-list');
    list.innerHTML = '';
    state.library.forEach(h => {
        list.innerHTML += `<div class="habit-card" onclick="openEditForm('${h.ID_habito}')" style="--habit-color: #${h.Color_habito}; border: 1px solid #ddd;"><span class="habit-name">${h.Nombre_habito} ✏️</span></div>`;
    });
    document.getElementById('library-panel').classList.remove('hidden');
}

function openCreateForm() {
    state.editingHabitId = null;
    document.getElementById('form-title').innerText = "Crea un hábito";
    document.getElementById('form-panel').classList.remove('hidden');
}

function openEditForm(id) {
    state.editingHabitId = id;
    const h = state.library.find(x => x.ID_habito === id);
    document.getElementById('form-title').innerText = "Editar hábito";
    document.getElementById('habit-name').value = h.Nombre_habito;
    currentForm.nombre = h.Nombre_habito;
    document.getElementById('form-panel').classList.remove('hidden');
    updatePreview();
}

function closeModals() { document.querySelectorAll('.modal-panel').forEach(m => m.classList.add('hidden')); }
function showToast(msg) { const toast = document.createElement('div'); toast.className = 'toast'; toast.innerText = msg; document.getElementById('toast-container').appendChild(toast); setTimeout(() => toast.remove(), 3000); }

// --- CONTROL MENÚ LATERAL ---
const menuBtn = document.getElementById('menu-btn');
const closeMenuBtn = document.getElementById('close-menu');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

menuBtn.addEventListener('click', () => { sidebar.classList.add('open'); overlay.classList.add('show'); });
const closeMenu = () => { sidebar.classList.remove('open'); overlay.classList.remove('show'); };
closeMenuBtn.addEventListener('click', closeMenu);
overlay.addEventListener('click', closeMenu);

// MOCK para probar sin CORS de momento
async function mockN8nResponse() {
    return {
        LIBRERIA_HABITOS: [
            {"ID_habito": "habit001_cesaryf","Usuario": "cesaryf","Nombre_habito": "Beber 4L","Color_habito": "3b82f6","Icono_habito": "generico","Numero_slots_habito": 4,"Frecuencia_habito": "1"},
            {"ID_habito": "habit002_cesaryf","Usuario": "cesaryf","Nombre_habito": "Comidas","Color_habito": "22c55e","Icono_habito": "generico","Numero_slots_habito": 5,"Frecuencia_habito": "1"},
            {"ID_habito": "habit003_cesaryf","Usuario": "cesaryf","Nombre_habito": "Dormir 7 horas","Color_habito": "8b5cf6","Icono_habito": "generico","Numero_slots_habito": 1,"Frecuencia_habito": "1"}
        ],
        LOGS_HABITOS: [
            {"ID_habito": "habit001_cesaryf", "Fecha_log_habito": "2026-05-27", "Log_habito_slot_01": 1, "Log_habito_slot_02": 1, "Log_habito_slot_03": 1, "Log_habito_slot_04": 1}, // Día cumplido al 100%
            {"ID_habito": "habit002_cesaryf", "Fecha_log_habito": "2026-05-27", "Log_habito_slot_01": 1, "Log_habito_slot_02": 1, "Log_habito_slot_03": 0, "Log_habito_slot_04": 0, "Log_habito_slot_05": 0} // Día NO cumplido al 100%
        ]
    };
}