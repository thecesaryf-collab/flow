// --- MOTOR DE CARTAS TIPO TINDER (swipeEngine.js) ---

let deckEjercicios = [];
let rutinaActualIndex = null;
let currentCardElement = null;

// Función inteligente que calcula dónde te quedaste a medias
function reanudarEntrenamiento(indexRutina) {
    const hoyObj = new Date();
    const hoyStr = `${String(hoyObj.getDate()).padStart(2, '0')}/${String(hoyObj.getMonth() + 1).padStart(2, '0')}/${hoyObj.getFullYear()}`;

    const logsHoy = (userDataLogsCrudos || []).filter(log => log.Date === hoyStr);
    const rutina = rutinasArrayMem[indexRutina];

    if (!rutina) return; // Si por lo que sea no existe, no hacemos nada y evitamos que se rompa

    let startIndex = 0;
    let indexContador = 0;

    for (let i = 1; i <= 8; i++) {
        const ejClave = `E_0${i}`;
        const nombreEj = rutina[ejClave];

        if (nombreEj && nombreEj.trim() !== "") {
            // Verificamos de forma segura que el log tenga un número real
            const tieneDatos = logsHoy.some(log => {
                const valorKg = log[`${ejClave}_kg`];
                return valorKg !== undefined && valorKg !== null && valorKg !== "" && !isNaN(parseFloat(valorKg));
            });
            
            if (tieneDatos) {
                startIndex = indexContador + 1; // Avanzamos la carta
            }
            indexContador++;
        }
    }

    if (startIndex >= indexContador && indexContador > 0) {
        startIndex = indexContador - 1;
    }

    const gridCont = document.getElementById('entreno-state-2-grid');
    if (gridCont) gridCont.classList.add('hidden');

    iniciarModoCartas(indexRutina, startIndex);
}

// Arranca el modo Swipe
// Arranca el modo Swipe
function iniciarModoCartas(indexRutina, startIndex = 0) {
    rutinaActualIndex = indexRutina;
    const rutina = rutinasArrayMem[indexRutina];
    
    deckEjercicios = [];
    for (let i = 1; i <= 8; i++) {
        const nombreEj = rutina[`E_0${i}`];
        if (nombreEj && nombreEj.trim() !== "") {
            deckEjercicios.push({ id: `E_0${i}`, nombre: nombreEj, completado: false, data: [] });
        }
    }

    deckEjercicios = deckEjercicios.slice(startIndex);

    document.getElementById('nav-bg').classList.add('expanded-swipe');
    document.getElementById('swipe-header-title').innerText = rutina.Train_ID;
    document.getElementById('swipe-container').classList.remove('hidden');
    document.getElementById('entreno-form').classList.add('hidden');

    // ¡EL ARREGLO!: Ocultamos explícitamente el dashboard y el selector para que no asomen
    const state1 = document.getElementById('entreno-state-1');
    if (state1) state1.classList.add('hidden');
    const stateSelector = document.getElementById('entreno-state-selector');
    if (stateSelector) stateSelector.classList.add('hidden');

    renderizarBaraja();
}

function renderizarBaraja() {
    const stack = document.getElementById('card-stack');
    stack.innerHTML = '';

    if (deckEjercicios.length === 0) {
        finalizarModoCartas();
        return;
    }

    for (let i = deckEjercicios.length - 1; i >= 0; i--) {
        const ej = deckEjercicios[i];
        const isTopCard = (i === 0);
        
        const card = document.createElement('div');
        card.className = `tinder-card ${isTopCard ? 'top-card' : ''}`;
        card.style.zIndex = deckEjercicios.length - i;
        
        card.innerHTML = `
            <div class="card-header">
                <h3>${ej.nombre}</h3>
            </div>
            <div class="card-photo-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="#A09E95" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            </div>
            <div class="card-inputs" id="inputs-${ej.id}">
                </div>
            
            <div class="swipe-icon swipe-left-icon hidden">✕</div>
            <div class="swipe-icon swipe-right-icon hidden">✓</div>
        `;

        stack.appendChild(card);

        if (isTopCard) {
            currentCardElement = card;
            generarFilaSerie(ej.id, 1);
            activarFisicas(card, ej);
        }
    }
}

// Generador dinámico de series (Máximo 4)
function generarFilaSerie(ejId, numeroSerie) {
    const container = document.getElementById(`inputs-${ejId}`);
    const row = document.createElement('div');
    row.className = 'series-row';
    
    row.innerHTML = `
        <span class="series-label">Serie ${numeroSerie}</span>
        <div class="input-with-suffix">
            <input type="number" class="series-input kg-input" placeholder="0" />
            <span class="input-suffix">Kg</span>
        </div>
        <div class="input-with-suffix">
            <input type="number" class="series-input rep-input" placeholder="0" />
            <span class="input-suffix">reps</span>
        </div>
    `;
    
    const inputs = row.querySelectorAll('input');
    inputs.forEach(inp => {
        inp.addEventListener('input', () => {
            const kg = row.querySelector('.kg-input').value;
            const rep = row.querySelector('.rep-input').value;
            if (kg && rep && !row.nextElementSibling && numeroSerie < 4) {
                generarFilaSerie(ejId, numeroSerie + 1);
            }
        });
    });

    container.appendChild(row);
}

// FÍSICAS REESCRITAS
function activarFisicas(card, ejercicioObj) {
    let startX = 0, startY = 0, currX = 0, currY = 0;
    let isDragging = false;
    const umbralSwipe = 20; 

    card.addEventListener('touchstart', (e) => {
        if(e.target.tagName === 'INPUT') return; 
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        currX = 0; currY = 0; 
        isDragging = true;
        card.style.transition = 'none'; 
    }, {passive: true});

    card.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currX = e.touches[0].clientX - startX;
        currY = e.touches[0].clientY - startY;

        const rotation = currX * 0.05;
        card.style.transform = `translate(${currX}px, ${currY}px) rotate(${rotation}deg)`;

        const percentX = (currX / window.innerWidth) * 100;
        const iconRight = card.querySelector('.swipe-right-icon');
        const iconLeft = card.querySelector('.swipe-left-icon');

        iconRight.classList.add('hidden');
        iconLeft.classList.add('hidden');

        if (percentX > 5) {
            iconRight.classList.remove('hidden');
            iconRight.style.opacity = Math.min(percentX / umbralSwipe, 1);
            iconRight.style.color = percentX >= umbralSwipe ? '#34C759' : '#A09E95'; 
            iconRight.style.borderColor = percentX >= umbralSwipe ? '#34C759' : '#A09E95';
        } else if (percentX < -5) {
            iconLeft.classList.remove('hidden');
            iconLeft.style.opacity = Math.min(Math.abs(percentX) / umbralSwipe, 1);
            iconLeft.style.color = percentX <= -umbralSwipe ? '#FF3B30' : '#A09E95'; 
            iconLeft.style.borderColor = percentX <= -umbralSwipe ? '#FF3B30' : '#A09E95';
        }
    }, {passive: true});

    const finalizarArrastre = () => {
        if (!isDragging) return;
        isDragging = false;
        card.style.transition = 'transform 0.4s ease-out'; 

        const percentX = (currX / window.innerWidth) * 100;

        if (percentX >= umbralSwipe) {
            procesarSwipeDerecha(card, ejercicioObj, currY);
        } else if (percentX <= -umbralSwipe) {
            procesarSwipeIzquierda(card, currY);
        } else {
            card.style.transform = 'translate(0px, 0px) rotate(0deg)';
            card.querySelector('.swipe-right-icon').classList.add('hidden');
            card.querySelector('.swipe-left-icon').classList.add('hidden');
        }
    };

    card.addEventListener('touchend', finalizarArrastre);
    card.addEventListener('touchcancel', finalizarArrastre);
}

// --- CONEXIÓN REAL CON N8N ---
async function procesarSwipeDerecha(card, ejercicioObj, finalY) {
    const rows = card.querySelectorAll('.series-row');
    let logData = [];
    
    // Obtenemos la fecha de HOY en formato dd/mm/aaaa
    const hoyObj = new Date();
    const hoyStr = `${String(hoyObj.getDate()).padStart(2, '0')}/${String(hoyObj.getMonth() + 1).padStart(2, '0')}/${hoyObj.getFullYear()}`;

    // 1. Extraemos los datos tecleados y fabricamos el REF
    rows.forEach((row, index) => {
        const kg = row.querySelector('.kg-input').value;
        const rep = row.querySelector('.rep-input').value;
        
        if(kg && rep) {
            // El índice de JavaScript empieza en 0, así que le sumamos 1 para que sea Serie 1, 2, 3...
            const numeroSerie = index + 1; 
            
            // Fabricamos tu código exacto: "dd/mm/aaaa-n"
            const codigoReferencia = `${hoyStr}-${numeroSerie}`;
            
            logData.push({
                kg: parseFloat(kg), 
                rep: parseFloat(rep),
                REF: codigoReferencia // Enviamos tu clave en lugar del row_number
            });
        }
    });

    // 2. Si no hay datos, hacemos que la carta tiemble y no se mueva
    if (logData.length === 0) {
        card.style.transform = 'translate(0px, 0px) rotate(0deg)';
        card.querySelector('.swipe-right-icon').classList.add('hidden');
        card.classList.add('delete-mode'); // Animación de agitar del CSS
        setTimeout(() => card.classList.remove('delete-mode'), 400);
        return;
    }

    // Animamos la carta hacia la derecha temporalmente
    card.style.transform = `translate(${window.innerWidth}px, ${finalY}px) rotate(15deg)`;
    const spinner = document.getElementById('swipe-spinner');
    spinner.classList.remove('hidden');
    
    try {
        // Petición POST real al webhook
        const payload = {
            orden: "GUARDAR_EJERCICIO",
            ejercicio: {
                Train_ID: rutinasArrayMem[rutinaActualIndex].Train_ID,
                ejercicio_id: ejercicioObj.id,
                nombre: ejercicioObj.nombre,
                series: logData
            }
        };

        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // 4. ¡NUEVA LÓGICA! Esperamos un JSON, no un texto plano.
        const resData = await response.json();

        // 5. Comprobamos que sea un array y tenga tu clave "REF"
        if (Array.isArray(resData) && resData.length > 0 && resData[0].REF) {
            
            // Recuperamos las filas de hoy ordenadas para saber cuál es cuál
            const logsHoy = (userDataLogsCrudos || [])
                .filter(log => log.Date === hoyStr && log.Train_ID === rutinasArrayMem[rutinaActualIndex].Train_ID)
                .sort((a, b) => a.row_number - b.row_number);

            // 6. ¡ACTUALIZAMOS LA MEMORIA DEL FRONT!
            resData.forEach(item => {
                // De "12/04/2026-1" sacamos el "1"
                const partes = item.REF.split('-');
                const numeroSerie = parseInt(partes[partes.length - 1]); 
                
                // La serie 1 corresponde al índice 0, la 2 al 1...
                const filaAActualizar = logsHoy[numeroSerie - 1];

                if (filaAActualizar) {
                    // Inyectamos todas las claves (E_02_kg, E_02_Rep...) en el front
                    Object.keys(item).forEach(clave => {
                        if (clave !== 'REF') { 
                            filaAActualizar[clave] = item[clave];
                        }
                    });
                }
            });

            spinner.classList.add('hidden');
            deckEjercicios.shift(); // Borra la carta de la baraja
            renderizarBaraja();     // Pinta la siguiente
        } else {
            throw new Error("El JSON recibido no tiene el formato esperado.");
        }

    } catch (error) {
        console.error("Fallo al guardar en n8n:", error);
        
        // Si falla el back, quitamos spinner y DEVOLVEMOS LA CARTA al centro
        spinner.classList.add('hidden');
        card.style.transform = 'translate(0px, 0px) rotate(0deg)';
        card.querySelector('.swipe-right-icon').classList.add('hidden');
        
        // Feedback visual de error en el título de la carta
        const headerTitle = card.querySelector('.card-header h3');
        const originalText = headerTitle.innerText;
        headerTitle.innerText = "Error servidor ❌";
        headerTitle.style.color = "#FF3B30";
        
        setTimeout(() => {
            headerTitle.innerText = originalText;
            headerTitle.style.color = "var(--c-black)";
        }, 2000);
    }
    }
    
function procesarSwipeIzquierda(card, finalY) {
    card.style.transform = `translate(-${window.innerWidth}px, ${finalY}px) rotate(-15deg)`;
    setTimeout(() => {
        deckEjercicios.shift();
        renderizarBaraja();
    }, 300); 
}

function salirModoCartas() {
    document.getElementById('nav-bg').classList.remove('expanded-swipe');
    
    // Al salir, forzamos la actualización del texto del botón principal en app.js
    if (typeof actualizarTextoBotonPrincipal === "function") {
        actualizarTextoBotonPrincipal();
    }
    
    setTimeout(() => {
        document.getElementById('swipe-container').classList.add('hidden');
        
        // Nos aseguramos de limpiar el selector y volver a mostrar el dashboard
        const stateSelector = document.getElementById('entreno-state-selector');
        if (stateSelector) stateSelector.classList.add('hidden');
        
        document.getElementById('entreno-state-1').classList.remove('hidden');
    }, 400);
}

function finalizarModoCartas() {
    document.getElementById('nav-bg').classList.remove('expanded-swipe');
    document.getElementById('swipe-container').classList.add('hidden');
    
    const viewGrid = document.getElementById('entreno-state-2-grid');
    viewGrid.classList.remove('hidden');

    const gridContainer = document.getElementById('summary-grid');
    gridContainer.innerHTML = '';
    
    const rutina = rutinasArrayMem[rutinaActualIndex];
    
    // Extraemos los logs de hoy para pintar el resumen
    const hoyObj = new Date();
    const hoyStr = `${String(hoyObj.getDate()).padStart(2, '0')}/${String(hoyObj.getMonth() + 1).padStart(2, '0')}/${hoyObj.getFullYear()}`;
    const logsHoy = (userDataLogsCrudos || []).filter(log => log.Date === hoyStr);

    for (let i = 1; i <= 8; i++) {
        const ejClave = `E_0${i}`;
        const nombreEj = rutina[ejClave];
        if (nombreEj && nombreEj.trim() !== "") {
            
            const logsEj = logsHoy.filter(log => !isNaN(parseFloat(log[`${ejClave}_kg`])));
            let textoResumen = "Sin registrar";
            
            if (logsEj.length > 0) {
                const maxKg = Math.max(...logsEj.map(l => parseFloat(l[`${ejClave}_kg`])));
                textoResumen = `${logsEj.length} series (Max: ${maxKg}kg)`;
            }

            gridContainer.innerHTML += `
                <div class="summary-card">
                    <div class="sum-title">${nombreEj}</div>
                    <div class="sum-data">${textoResumen}</div>
                </div>
            `;
        }
    }

    // Conectamos el botón negro del resumen final a nuestra nueva función
    const btnEditResumen = document.getElementById('btn-edit-entreno');
    if(btnEditResumen) {
        btnEditResumen.onclick = () => reanudarEntrenamiento(rutinaActualIndex);
    }
}