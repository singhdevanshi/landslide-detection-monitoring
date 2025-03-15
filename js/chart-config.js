// Chart.js configurations for various charts

// FOS Chart
let fosChart = null;
function createFosChart() {
    const ctx = document.getElementById('fos-chart').getContext('2d');
    fosChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Factor of Safety',
                data: [],
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Allow chart to respect CSS height
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    suggestedMin: 0.5,
                    suggestedMax: 2.0
                }
            }
        }
    });
    return fosChart;
}

// Accelerometer Chart X
let accelChartX = null;
function createAccelChartX() {
    const ctx = document.getElementById('accel-chart-x').getContext('2d');
    accelChartX = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'X',
                data: [],
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Allow chart to respect CSS height
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    suggestedMin: 0.5,
                    suggestedMax: 2.0
                }
            }
        }
    });
    return accelChartX;
}

// Accelerometer Chart Y
let accelChartY = null;
function createAccelChartY() {
    const ctx = document.getElementById('accel-chart-y').getContext('2d');
    accelChartY = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Y',
                data: [],
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Allow chart to respect CSS height
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    suggestedMin: 0.5,
                    suggestedMax: 2.0
                }
            }
        }
    });
    return accelChartY;
}

// Vibration Chart
let vibrationChart = null;
function createVibrationChart() {
    const ctx = document.getElementById('vibration-chart').getContext('2d');
    vibrationChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Vibration',
                data: [],
                borderColor: 'rgba(153, 102, 255, 1)',
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Allow chart to respect CSS height
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    suggestedMin: 0.5,
                    suggestedMax: 2.0
                }
            }
        }
    });
    return vibrationChart;
}

// Moisture Chart
let moistureChart = null;
function createMoistureChart() {
    const ctx = document.getElementById('moisture-chart').getContext('2d');
    moistureChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Soil Moisture',
                data: [],
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Allow chart to respect CSS height
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    suggestedMin: 0.5,
                    suggestedMax: 2.0
                }
            }
        }
    });
    return moistureChart;
}
