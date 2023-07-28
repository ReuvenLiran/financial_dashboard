export function createDougnutChartDOM(key, name) {
    const chartContianer = document.createElement('div');
    chartContianer.classList.add('chart-doughnut');
    chartContianer.id = key;

    chartContianer.innerHTML = `
        <h4 class="header">${name}</h4>
        <div class="chart-container">
            <canvas id="chart-doughnut-${key}"></canvas>
            <div class="legend-container" id="legend-container-${key}"></div>
        </div>
   `;

    return chartContianer;
}

export function createGaugeChartDOM(key, name) {
    const chartContianer = document.createElement('div');
    chartContianer.classList.add('chart-doughnut');
    chartContianer.id = key;

    chartContianer.innerHTML = `
        <h4 class="header">${name}</h4>
        <canvas id="chart-doughnut-${key}"></canvas>
        <h5 class="header goal"></h5>
   `;

    return chartContianer;
}