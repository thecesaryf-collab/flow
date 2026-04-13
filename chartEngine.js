// --- MOTOR GRÁFICO PREMIUM (chartEngine.js) ---
let progressChart = null;
let currentChartMode = 'kg'; 

function parseDateString(dateStr) {
    const parts = dateStr.split('/');
    return new Date(parts[2], parts[1] - 1, parts[0]);
}

function procesarLogsParaGrafico(logsArray, rutinaName, ejercicioClave, timeframe) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    let diasLimite = 7;
    if (timeframe === 'mensual') diasLimite = 30;
    if (timeframe === 'anual') diasLimite = 365;

    let datosFiltrados = [];
    let conteoSeriesPorDia = {}; 

    let logsLimpios = [];
    let rowsVistos = new Set();
    
    logsArray.forEach(log => {
        if (log.row_number) {
            if (rowsVistos.has(log.row_number)) return; 
            rowsVistos.add(log.row_number);
        }
        logsLimpios.push(log);
    });

    logsLimpios.forEach(log => {
        if (log.Train_ID === rutinaName && log.Date) {
            const fechaLog = parseDateString(log.Date);
            const diffTime = hoy.getTime() - fechaLog.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays <= diasLimite && diffDays >= 0) {
                const kg = parseFloat(log[`${ejercicioClave}_kg`]);
                const rep = parseFloat(log[`${ejercicioClave}_Rep`]);

                if (!isNaN(kg) && !isNaN(rep)) {
                    conteoSeriesPorDia[log.Date] = (conteoSeriesPorDia[log.Date] || 0) + 1;
                    const numeroDeSerie = conteoSeriesPorDia[log.Date];

                    datosFiltrados.push({
                        fechaObj: fechaLog,
                        fechaStr: log.Date.substring(0, 5), 
                        kg: kg,
                        rep: rep,
                        intensidad: (kg * rep) / 100, 
                        serie: numeroDeSerie 
                    });
                }
            }
        }
    });

    datosFiltrados.sort((a, b) => a.fechaObj - b.fechaObj);
    return datosFiltrados;
}

function renderizarGrafico(logsCrudos, rutinaName, ejercicioClave, timeframe) {
    const legendContainer = document.getElementById('custom-chart-legend');
    if (legendContainer) legendContainer.innerHTML = '';

    if (!logsCrudos || logsCrudos.length === 0) return;

    const datosProcesados = procesarLogsParaGrafico(logsCrudos, rutinaName, ejercicioClave, timeframe);
    
    if (datosProcesados.length === 0) {
        if (progressChart) {
            progressChart.data.datasets = [];
            progressChart.update();
        }
        return;
    }

    const labelsUnicos = [...new Set(datosProcesados.map(d => d.fechaStr))];
    const maxSeries = Math.max(...datosProcesados.map(d => d.serie));

    // Paleta de Amarillos (100%, 80%, 60%, 40%, 20% aprox)
    const coloresLíneas = ['#FFAC00', '#FFC833', '#FFDB66', '#FFEB99', '#FFF6CC'];

    // 1. Renderizar Leyenda HTML Dinámica y Clickable
    if (legendContainer) {
        for (let i = 1; i <= maxSeries; i++) {
            const colorSerie = coloresLíneas[(i - 1) % coloresLíneas.length];
            
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';
            legendItem.style.cursor = 'pointer'; // Indicador de que es clickable
            legendItem.style.transition = '0.2s';
            legendItem.innerHTML = `
                <div class="legend-color-box" style="background-color: ${colorSerie};"></div>
                <span>Serie ${i}</span>
            `;

            // Lógica para Tachar y Ocultar al hacer click
            legendItem.onclick = () => {
                if (!progressChart) return;
                const datasetIndex = i - 1;
                const isVisible = progressChart.isDatasetVisible(datasetIndex);
                
                if (isVisible) {
                    progressChart.hide(datasetIndex);
                    legendItem.style.opacity = '0.4';
                    legendItem.style.textDecoration = 'line-through';
                } else {
                    progressChart.show(datasetIndex);
                    legendItem.style.opacity = '1';
                    legendItem.style.textDecoration = 'none';
                }
            };

            legendContainer.appendChild(legendItem);
        }
    }

    const datasets = [];

    // 2. Crear las líneas (datasets) sin puntos negros
    for (let i = 1; i <= maxSeries; i++) {
        const colorSerie = coloresLíneas[(i - 1) % coloresLíneas.length]; 
        const puntosDeEstaSerie = [];

        const datosDeLaSerie = datosProcesados.filter(d => d.serie === i);

        datosDeLaSerie.forEach(punto => {
            const valorY = currentChartMode === 'kg' ? punto.kg : punto.intensidad;
            puntosDeEstaSerie.push({
                x: punto.fechaStr, 
                y: valorY,         
                kg: punto.kg,
                rep: punto.rep
            });
        });

        datasets.push({
            label: `Serie ${i}`,
            data: puntosDeEstaSerie,
            borderColor: colorSerie,
            backgroundColor: colorSerie,
            pointBackgroundColor: colorSerie, // Todo del mismo color de la serie
            pointBorderColor: colorSerie,
            pointBorderWidth: 0,
            pointRadius: 4, // Tamaño estándar para todos
            pointHoverRadius: 8,
            tension: 0.3,
            borderWidth: i === 1 ? 3 : 2, 
            spanGaps: true 
        });
    }

    const ctx = document.getElementById('progress-chart').getContext('2d');
    if (progressChart) progressChart.destroy();

    const interactivo = timeframe !== 'anual';

    progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labelsUnicos,
            datasets: datasets
        },
        options: {
            responsive: true, 
            maintainAspectRatio: false,
            plugins: { 
                legend: { display: false }, // Apagamos la leyenda nativa
                tooltip: {
                    enabled: interactivo,
                    backgroundColor: 'rgba(17, 17, 17, 0.9)',
                    titleFont: { family: 'Inter', size: 12 },
                    bodyFont: { family: 'Inter', size: 14, weight: 'bold' },
                    padding: 10,
                    cornerRadius: 10,
                    displayColors: true,
                    callbacks: {
                        title: function(context) { return 'Día: ' + context[0].raw.x; },
                        label: function(context) {
                            const datasetLabel = context.dataset.label;
                            const raw = context.raw;
                            return `${datasetLabel}: ${raw.kg} kg × ${raw.rep} reps`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#A09E95',
                        font: { family: 'Inter', weight: 800, size: 10 },
                        maxTicksLimit: 6,
                        callback: function(value) { 
                            if (currentChartMode === 'kg') {
                                if (value % 20 === 0) return value; 
                                return ''; 
                            } else {
                                return value; 
                            }
                        }
                    },
                    grid: {
                        color: function(context) {
                            if (currentChartMode !== 'kg') return 'rgba(0,0,0,0.05)';
                            if (context.tick.value % 20 === 0) return 'rgba(0,0,0,0.15)';
                            if (context.tick.value % 10 === 0) return 'rgba(0,0,0,0.06)';
                            return 'rgba(0,0,0,0.02)';
                        }
                    },
                    border: { display: false }
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { family: 'Inter', weight: 700, size: 11 }, color: '#A09E95' }
                }
            }
        }
    });
}