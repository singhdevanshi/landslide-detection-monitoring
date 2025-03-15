// main.js
let map = null;
let charts = {};
let alarmModal = null;
let currentTimeRange = '24h';
let updateInterval = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initMap();
    initCharts();
    setupEventListeners();
    initBootstrapComponents();
    initMQTT(); // Initialize MQTT
    
    // Initial data fetch from ThingSpeak
    fetchAndUpdateData();
    
    // Set up periodic updates from ThingSpeak (every 30 seconds)
    // We can keep this as a fallback if MQTT connection fails
    updateInterval = setInterval(fetchAndUpdateData, 30000);
});

// Initialize the map
function initMap() {
    map = L.map('map-container').setView([51.505, -0.09], 13); // Set to your actual coordinates
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Add a marker for the sensor location
    L.marker([51.505, -0.09]).addTo(map)
        .bindPopup('Landslide Monitoring Station<br>Status: Active');
}

// Initialize all charts
// Fix the initCharts function
function initCharts() {
    charts.fos = createFosChart();
    charts.accelX = createAccelChartX();
    charts.accelY = createAccelChartY();
    charts.vibration = createVibrationChart();
    charts.moisture = createMoistureChart();
    charts.history = createHistoryChart();
}

// And update the updateCharts function
function updateCharts(data) {
    const timestamp = new Date(data.created_at).toLocaleTimeString();
    
    // Update FOS chart
    addDataPoint(charts.fos, timestamp, parseFloat(data.field6));
    
    // Update accelerometer charts
    addDataPoint(charts.accelX, timestamp, parseFloat(data.field1));
    addDataPoint(charts.accelY, timestamp, parseFloat(data.field2));
    
    // Update vibration chart
    addDataPoint(charts.vibration, timestamp, parseFloat(data.field4));
    
    // Update moisture chart
    addDataPoint(charts.moisture, timestamp, parseFloat(data.field5));
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('btn-1h').addEventListener('click', () => changeTimeRange('1h'));
    document.getElementById('btn-24h').addEventListener('click', () => changeTimeRange('24h'));
    document.getElementById('btn-7d').addEventListener('click', () => changeTimeRange('7d'));
    document.getElementById('btn-30d').addEventListener('click', () => changeTimeRange('30d'));
}

// Initialize Bootstrap components
function initBootstrapComponents() {
    alarmModal = new bootstrap.Modal(document.getElementById('alarmModal'));
}

// Change time range for historical data
function changeTimeRange(range) {
    currentTimeRange = range;
    
    // Update UI to show active button
    document.querySelectorAll('.chart-controls .btn').forEach(btn => {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-outline-secondary');
    });
    
    document.getElementById(`btn-${range}`).classList.remove('btn-outline-secondary');
    document.getElementById(`btn-${range}`).classList.add('btn-primary');
    
    // Fetch data for the new time range
    fetchHistoricalData(range);
}

// Fetch and update all data
async function fetchAndUpdateData() {
    try {
        // Get latest data point
        const latestData = await thingSpeakClient.getLatestData();
        if (latestData) {
            updateSensorDisplays(latestData);
            updateCharts(latestData);
            checkAlarmConditions(latestData);
        }
        
        // Fetch historical data based on current time range
        fetchHistoricalData(currentTimeRange);
    } catch (error) {
        console.error('Error updating data:', error);
    }
}

// Update sensor displays with latest data
function updateSensorDisplays(data) {
    // Update accelerometer values
    document.getElementById('accel-x').textContent = parseFloat(data.field1).toFixed(2);
    document.getElementById('accel-y').textContent = parseFloat(data.field2).toFixed(2);
    document.getElementById('accel-z').textContent = parseFloat(data.field3).toFixed(2);
    
    // Update vibration value
    document.getElementById('vibration-value').textContent = parseFloat(data.field4).toFixed(2);
    
    // Update moisture value
    document.getElementById('moisture-value').textContent = parseFloat(data.field5).toFixed(2);
    
    // Update FOS value
    const fos = parseFloat(data.field6);
    document.getElementById('fos-value').textContent = fos.toFixed(2);
    
    // Update status indicator
    updateStatusIndicator(fos);
}

// Update charts with latest data
function updateCharts(data) {
    const timestamp = new Date(data.created_at).toLocaleTimeString();
    
    // Update FOS chart
    addDataPoint(charts.fos, timestamp, parseFloat(data.field6));
    
    // Update accelerometer chart
    addAccelDataPoint(charts.accel, timestamp, 
        parseFloat(data.field1), 
        parseFloat(data.field2), 
        parseFloat(data.field3)
    );
    
    // Update vibration chart
    addDataPoint(charts.vibration, timestamp, parseFloat(data.field4));
    
    // Update moisture chart
    addDataPoint(charts.moisture, timestamp, parseFloat(data.field5));
}

// Add data point to simple charts
function addDataPoint(chart, label, value) {
    // Keep only last 20 data points for real-time charts
    if (chart.data.labels.length > 20) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }
    
    chart.data.labels.push(label);
    chart.data.datasets[0].data.push(value);
    chart.update();
}

// Add data point to accelerometer chart
function addAccelDataPoint(chart, label, x, y, z) {
    // Keep only last 20 data points
    if (chart.data.labels.length > 20) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
        chart.data.datasets[1].data.shift();
        chart.data.datasets[2].data.shift();
    }
    
    chart.data.labels.push(label);
    chart.data.datasets[0].data.push(x);
    chart.data.datasets[1].data.push(y);
    chart.data.datasets[2].data.push(z);
    chart.update();
}

// Fetch historical data
async function fetchHistoricalData(timeRange) {
    let days = 1;
    
    // Convert time range to days
    switch(timeRange) {
        case '1h': days = 0.042; break;  // ~1 hour
        case '24h': days = 1; break;
        case '7d': days = 7; break;
        case '30d': days = 30; break;
    }
    
    try {
        const data = await thingSpeakClient.getHistoricalData(days);
        if (data && data.feeds) {
            updateHistoryChart(data.feeds);
        }
    } catch (error) {
        console.error('Error fetching historical data:', error);
    }
}

// Update history chart with historical data
function updateHistoryChart(feeds) {
    const labels = [];
    const fosData = [];
    const moistureData = [];
    
    feeds.forEach(feed => {
        const date = new Date(feed.created_at);
        const formattedDate = `${date.getMonth()+1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
        
        labels.push(formattedDate);
        fosData.push(parseFloat(feed.field6));
        moistureData.push(parseFloat(feed.field5));
    });
    
    charts.history.data.labels = labels;
    charts.history.data.datasets[0].data = fosData;
    charts.history.data.datasets[1].data = moistureData;
    charts.history.update();
}

// Update status indicator based on FOS value
function updateStatusIndicator(fos) {
    const indicator = document.getElementById('status-indicator');
    
    // Remove all classes
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

// Check for alarm conditions
function checkAlarmConditions(data) {
    const fos = parseFloat(data.field6);
    
    if (fos < 1.0) {
        // Update modal with current FOS value
        document.getElementById('modal-fos').textContent = fos.toFixed(2);
        
        // Show the alarm modal
        alarmModal.show();
        
        // Play alarm sound
        playAlarmSound();
    }
}

// Function to play alarm sound
function playAlarmSound() {
    // Create an audio element
    const audio = new Audio('https://bigsoundbank.com/UPLOAD/mp3/1482.mp3');
    audio.play().catch(e => console.log('Failed to play alarm sound:', e));
}

// Function to create the history chart
function createHistoryChart() {
    const ctx = document.getElementById('history-chart').getContext('2d');
    const historyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Factor of Safety',
                    data: [],
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    borderWidth: 2,
                    yAxisID: 'y',
                    fill: true
                },
                {
                    label: 'Soil Moisture (%)',
                    data: [],
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    borderWidth: 2,
                    yAxisID: 'y1',
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Factor of Safety'
                    },
                    suggestedMin: 0.5,
                    suggestedMax: 2.0
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Soil Moisture (%)'
                    },
                    min: 0,
                    max: 100,
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
    return historyChart;
}