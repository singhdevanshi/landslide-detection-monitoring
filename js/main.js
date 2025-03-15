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

    // Update time display
    updateTime();
    setInterval(updateTime, 1000);
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
                borderColor: 'rgba(46, 204, 113, 1)',
                backgroundColor: 'rgba(46, 204, 113, 0.2)',
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
                borderColor: 'rgba(52, 152, 219, 1)',
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
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
                borderColor: 'rgba(231, 76, 60, 1)',
                backgroundColor: 'rgba(231, 76, 60, 0.2)',
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    const accelYCtx = document.getElementById('accel-chart-y').getContext('2d');
    charts.accelY = new Chart(accelYCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Y-axis',
                data: [],
                borderColor: 'rgba(241, 196, 15, 1)',
                backgroundColor: 'rgba(241, 196, 15, 0.2)',
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    const accelZCtx = document.getElementById('accel-chart-z').getContext('2d');
    charts.accelZ = new Chart(accelZCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Z-axis',
                data: [],
                borderColor: 'rgba(155, 89, 182, 1)',
                backgroundColor: 'rgba(155, 89, 182, 0.2)',
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
                borderColor: 'rgba(155, 89, 182, 1)',
                backgroundColor: 'rgba(155, 89, 182, 0.2)',
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
    // Time range buttons
    document.querySelectorAll('.time-btn').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelector('.time-btn.active').classList.remove('active');
            this.classList.add('active');
            currentTimeRange = this.getAttribute('data-time');
            fetchAndUpdateData();
        });
    });

    // Refresh button
    document.getElementById('refresh-data').addEventListener('click', function() {
        fetchAndUpdateData();
        updateTime();
    });

    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
    });
}

// Update the time display
function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('update-time').textContent = `${hours}:${minutes}:${seconds}`;
}

// Fetch and update all data
async function fetchAndUpdateData() {
    try {
        let results = 20; // Default for 1h

        // Adjust results based on selected time range
        switch(currentTimeRange) {
            case '6h':
                results = 60;
                break;
            case '24h':
                results = 200;
                break;
            case '7d':
                results = 1000;
                break;
        }

        const url = `https://api.thingspeak.com/channels/2878666/feeds.json?api_key=GRFB9E6YPTFUS1QI&results=${results}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (data && data.feeds && data.feeds.length > 0) {
            processThingSpeakData(data.feeds);
            updateTime(); // Update last updated time
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
        accelY: [],
        accelZ: [],
        vibration: []
    };

    // Process each feed
    feeds.forEach(feed => {
        // Format timestamp as readable time
        const date = new Date(feed.created_at);
        const timeStr = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        chartData.labels.push(timeStr);

        // Map ThingSpeak fields to our variables
        // Adjust these field mappings based on your ThingSpeak channel setup
        chartData.accelX.push(parseFloat(feed.field1) || 0);
        chartData.accelY.push(parseFloat(feed.field2) || 0);
        chartData.accelZ.push(parseFloat(feed.field3) || 0);
        chartData.vibration.push(parseFloat(feed.field4) || 0);
        chartData.moisture.push(parseFloat(feed.field5) || 0);

        // Calculate FOS based on moisture if field6 is not available
        // This is a placeholder calculation - adjust based on your actual formula
        const fosValue = parseFloat(feed.field6) || calculateFOS(parseFloat(feed.field5) || 0);
        chartData.fos.push(fosValue);
    });

    // Update charts with the latest data (most recent data points at the end)
    updateChart(charts.fos, chartData.labels, chartData.fos);
    updateChart(charts.moisture, chartData.labels, chartData.moisture);
    updateChart(charts.accelX, chartData.labels, chartData.accelX);
    updateChart(charts.accelY, chartData.labels, chartData.accelY);
    updateChart(charts.accelZ, chartData.labels, chartData.accelZ);
    updateChart(charts.vibration, chartData.labels, chartData.vibration);

    // Update latest values (most recent data point)
    if (chartData.fos.length > 0) {
        const latestFos = chartData.fos[chartData.fos.length - 1];
        document.getElementById('fos-value').textContent = latestFos.toFixed(2);
        updateStatusIndicator(latestFos);
    }

    if (chartData.moisture.length > 0) {
        document.getElementById('moisture-value').textContent = chartData.moisture[chartData.moisture.length - 1].toFixed(1);
    }

    if (chartData.accelX.length > 0) {
        document.getElementById('accel-x').textContent = chartData.accelX[chartData.accelX.length - 1].toFixed(2);
    }

    if (chartData.accelY.length > 0) {
        document.getElementById('accel-y').textContent = chartData.accelY[chartData.accelY.length - 1].toFixed(2);
    }

    if (chartData.accelZ.length > 0) {
        document.getElementById('accel-z').textContent = chartData.accelZ[chartData.accelZ.length - 1].toFixed(2);
    }

    if (chartData.vibration.length > 0) {
        document.getElementById('vibration-value').textContent = chartData.vibration[chartData.vibration.length - 1].toFixed(1);
    }
}

// Calculate Factor of Safety based on moisture
// Simple model for when FOS is not directly available
function calculateFOS(moisture) {
    // Simple model: FOS decreases as moisture increases
    // Adjust this formula as needed for your specific use case
    return 2.0 - (moisture / 100) * 1.2;
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

    // Remove all existing status classes
    indicator.classList.remove('status-safe', 'status-warning', 'status-danger');

    // Update status based on FOS value
    if (fos < 1.0) {
        indicator.classList.add('status-danger');
        indicator.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Danger';
    } else if (fos < 1.2) {
        indicator.classList.add('status-warning');
        indicator.innerHTML = '<i class="fas fa-exclamation-circle"></i> Warning';
    } else {
        indicator.classList.add('status-safe');
        indicator.innerHTML = '<i class="fas fa-check-circle"></i> Safe';
    }
}
