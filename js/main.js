// main.js
let charts = {};
let currentTimeRange = '24h';
let updateInterval = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initCharts();
    setupEventListeners();
    
    // Initial data fetch from ThingSpeak
    fetchAndUpdateData();
    
    // Set up periodic updates from ThingSpeak (every 30 seconds)
    updateInterval = setInterval(fetchAndUpdateData, 30000);
});

// Initialize all charts
function initCharts() {
    // Initialize basic charts from the index.html
    const fosCtx = document.getElementById('fos-chart').getContext('2d');
    charts.fos = new Chart(fosCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Factor of Safety',
                data: [],
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    const moistureCtx = document.getElementById('moisture-chart').getContext('2d');
    charts.moisture = new Chart(moistureCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Soil Moisture',
                data: [],
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    const accelXCtx = document.getElementById('accel-chart-x').getContext('2d');
    charts.accelX = new Chart(accelXCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'X-axis',
                data: [],
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    const vibrationCtx = document.getElementById('vibration-chart').getContext('2d');
    charts.vibration = new Chart(vibrationCtx, {
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
            maintainAspectRatio: false
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // No buttons in the current HTML, but we can add this if needed
}

// Fetch and update all data
async function fetchAndUpdateData() {
    try {
        const url = `https://api.thingspeak.com/channels/2878666/feeds.json?api_key=GRFB9E6YPTFUS1QI&results=20`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data && data.feeds && data.feeds.length > 0) {
            processThingSpeakData(data.feeds);
        } else {
            console.log("No data received from ThingSpeak");
        }
    } catch (error) {
        console.error("Error fetching ThingSpeak data:", error);
    }
}

// Process ThingSpeak data
function processThingSpeakData(feeds) {
    // Clear previous data
    const chartData = {
        labels: [],
        fos: [],
        moisture: [],
        accelX: [],
        vibration: []
    };

    // Process each feed
    feeds.forEach(feed => {
        const timestamp = new Date(feed.created_at).toLocaleTimeString();
        chartData.labels.push(timestamp);
        
        // Use field values directly from your ESP32 code
        chartData.accelX.push(parseFloat(feed.field1) || 0);
        chartData.moisture.push(parseFloat(feed.field5) || 0);
        chartData.vibration.push(parseFloat(feed.field4) || 0);
        chartData.fos.push(parseFloat(feed.field6) || 0);
    });

    // Update charts
    updateChart(charts.fos, chartData.labels, chartData.fos);
    updateChart(charts.moisture, chartData.labels, chartData.moisture);
    updateChart(charts.accelX, chartData.labels, chartData.accelX);
    updateChart(charts.vibration, chartData.labels, chartData.vibration);

    // Update latest values
    if (chartData.fos.length > 0) {
        const latestFos = chartData.fos[chartData.fos.length - 1];
        document.getElementById('fos-value').textContent = latestFos.toFixed(2);
        updateStatusIndicator(latestFos);
    }
    
    if (chartData.moisture.length > 0) {
        document.getElementById('moisture-value').textContent = chartData.moisture[chartData.moisture.length - 1].toFixed(2) + '%';
    }
    
    if (chartData.accelX.length > 0) {
        document.getElementById('accel-x').textContent = chartData.accelX[chartData.accelX.length - 1].toFixed(2) + 'V';
    }
    
    if (chartData.vibration.length > 0) {
        document.getElementById('vibration-value').textContent = chartData.vibration[chartData.vibration.length - 1].toFixed(2);
    }
}

// Update chart with new data
function updateChart(chart, labels, data) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
}

// Update status indicator
function updateStatusIndicator(fos) {
    const indicator = document.getElementById('status-indicator');
    
    indicator.classList.remove('status-safe', 'status-warning', 'status-danger');
    
    if (fos < 1.0) {
        indicator.classList.add('status-danger');
        indicator.textContent = 'DANGER';
    } else if (fos < 1.2) {
        indicator.classList.add('status-warning');
        indicator.textContent = 'Warning';
    } else {
        indicator.classList.add('status-safe');
        indicator.textContent = 'Safe';
    }
}