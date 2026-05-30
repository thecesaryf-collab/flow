// Configuración
const WEBHOOK_URL = 'https://automations-n8n.b8vwcm.easypanel.host/webhook/FLOW_mini';
const USERNAME = 'cesaryf'; // ¡Corregido! Ahora coincide con entrenos.js y habitos.js
const DAYS_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

// Elementos del DOM
const dom = {
    greeting: document.getElementById('greeting'),
    chatContainer: document.getElementById('chat-container'),
    inputArea: document.getElementById('input-area'),
    journalInput: document.getElementById('journal-input'),
    sendBtn: document.getElementById('send-btn'),
    menuBtn: document.getElementById('menu-btn'),
    closeMenuBtn: document.getElementById('close-menu'),
    sidebar: document.getElementById('sidebar'),
    overlay: document.getElementById('overlay'),
    toastContainer: document.getElementById('toast-container')
};

// Utilidades de Tiempo
function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 10) return `Buenos días, ${USERNAME} 🌅`;
    if (hour < 21) return `Buenas tardes, ${USERNAME} ☀️`;
    return `Buenas noches, ${USERNAME} 🌙`;
}

function getSystemQuestion() {
    const hour = new Date().getHours();
    if (hour < 10) return '¿Cómo crees que irá tu día?';
    if (hour < 21) return '¿Qué tal está yendo tu día?';
    return '¿Qué tal ha ido tu día?';
}

function getCurrentDayKey() {
    let dayIndex = new Date().getDay(); // 0 es Domingo, 1 es Lunes
    // Convertir a formato del JSON: Lunes=01, ..., Domingo=07
    let jsonDayNumber = dayIndex === 0 ? 7 : dayIndex; 
    return `Log_jour_dia_0${jsonDayNumber}`;
}

// Control del DOM y UI
function showToast(message, isError = true) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.borderLeftColor = isError ? '#ef4444' : '#10b981'; // Rojo error, Verde éxito
    toast.textContent = message;
    dom.toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

function addMessageToChat(text, type, delay = 0, dayName = '') {
    setTimeout(() => {
        const bubble = document.createElement('div');
        bubble.className = `bubble ${type}`;
        
        let content = '';
        if (dayName) {
            content += `<span class="bubble-day">${dayName}</span>`;
        }
        content += text;
        
        bubble.innerHTML = content;
        dom.chatContainer.appendChild(bubble);
        // Scroll hacia abajo
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, delay);
}

// Lógica de Estados
function renderState1() {
    dom.inputArea.classList.remove('hidden');
    addMessageToChat(getSystemQuestion(), 'system', 300);
}

function renderState2(logData) {
    dom.inputArea.classList.add('hidden');
    
    // Iterar sobre los 7 días y mostrarlos si tienen contenido
    let delay = 300;
    for (let i = 1; i <= 7; i++) {
        const key = `Log_jour_dia_0${i}`;
        if (logData[key] && logData[key].trim() !== "") {
            // Calcular nombre del día: Lunes es 1, Domingo es 7
            let jsDayIndex = i === 7 ? 0 : i;
            addMessageToChat(logData[key], 'user', delay, DAYS_ES[jsDayIndex]);
            delay += 200; // Efecto cascada (popping)
        }
    }
}

// Integración con n8n
async function fetchJournalingSync() {
    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: "Sincron Journaling", user: USERNAME }) // Usando variable
        });
        
        if (!response.ok) throw new Error('Error en sincronización');
        
        const data = await response.json();
        return data[0]; 
    } catch (error) {
        console.error("Error fetching n8n:", error);
        showToast("Error conectando con el servidor. Usando datos locales para prueba.");
        // Fallback local dinámico con la variable
        return {
            "ID_log_jour": `log20260527_${USERNAME}_jour001`,
            "Usuario": USERNAME,
            "Log_jour_dia_01": "Hoy completé todo el entreno de pecho con buenas sensaciones.",
            "Log_jour_dia_02": "Me costó arrancar por la mañana pero avancé bastante trabajo.",
            "Log_jour_dia_03": "", 
            "Log_jour_dia_04": "",
            "Log_jour_dia_05": "",
            "Log_jour_dia_06": "",
            "Log_jour_dia_07": ""
        };
    }
}

async function sendNewJournaling(text) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos max

    dom.sendBtn.disabled = true;
    dom.journalInput.disabled = true;

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: "Nuevo Journaling", user: USERNAME, text: text, dayKey: getCurrentDayKey() }), // Usando variable
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            dom.journalInput.value = '';
            dom.inputArea.classList.add('hidden');
            addMessageToChat(text, 'user', 100);
            
            setTimeout(() => initApp(), 2000); 
        } else {
            throw new Error('El servidor no respondió con éxito.');
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            showToast("Error: El servidor tardó más de 5 segundos en responder.");
        } else {
            showToast("Error al enviar el journaling.");
        }
    } finally {
        dom.sendBtn.disabled = false;
        dom.journalInput.disabled = false;
        dom.journalInput.focus();
    }
}

// Inicialización
async function initApp() {
    dom.greeting.textContent = getGreeting();
    dom.chatContainer.innerHTML = ''; // Limpiar chat
    
    const logs = await fetchJournalingSync();
    const todayKey = getCurrentDayKey();

    // Lógica de Cambio de Estado
    if (!logs[todayKey] || logs[todayKey].trim() === "") {
        renderState1();
    } else {
        renderState2(logs);
    }
}

// Event Listeners
dom.sendBtn.addEventListener('click', () => {
    const text = dom.journalInput.value.trim();
    if (text) sendNewJournaling(text);
});

dom.journalInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const text = dom.journalInput.value.trim();
        if (text) sendNewJournaling(text);
    }
});

// Menú Hamburguesa
dom.menuBtn.addEventListener('click', () => {
    dom.sidebar.classList.add('open');
    dom.overlay.classList.add('show');
});

const closeMenu = () => {
    dom.sidebar.classList.remove('open');
    dom.overlay.classList.remove('show');
};

dom.closeMenuBtn.addEventListener('click', closeMenu);
dom.overlay.addEventListener('click', closeMenu);

// Iniciar aplicación
document.addEventListener('DOMContentLoaded', initApp);
