const axios = require("axios");
const Chart = require("chart-config.js/auto");

const THINGSPEAK_READ_API_KEY = "GRFB9E6YPTFUS1QI";
const THINGSPEAK_CHANNEL_ID = "2878666";
const THINGSPEAK_URL = `https://api.thingspeak.com/channels/${2878666}/feeds.json?api_key=${GRFB9E6YPTFUS1QI}&results=10`;

const updateInterval = 5000; // Fetch data every 5 seconds

// Select chart elements
const accelerometerChartElement = document.getElementById("accelerometerChart");
const vibrationChartElement = document.getElementById("vibrationChart");
const moistureChartElement = document.getElementById("moistureChart");

// Create empty charts
const accelerometerChart = new Chart(accelerometerChartElement, {
  type: "line",
  data: { labels: [], datasets: [{ label: "Accelerometer (X)", data: [], borderColor: "red" }] },
});
const vibrationChart = new Chart(vibrationChartElement, {
  type: "line",
  data: { labels: [], datasets: [{ label: "Vibration", data: [], borderColor: "blue" }] },
});
const moistureChart = new Chart(moistureChartElement, {
  type: "line",
  data: { labels: [], datasets: [{ label: "Soil Moisture", data: [], borderColor: "green" }] },
});

async function fetchData() {
  try {
    const response = await axios.get(THINGSPEAK_URL);
    const feeds = response.data.feeds;
    
    if (feeds.length === 0) return;
    
    const timestamps = feeds.map(feed => new Date(feed.created_at).toLocaleTimeString());
    const accelerometerData = feeds.map(feed => parseFloat(feed.field1) || 0);
    const vibrationData = feeds.map(feed => parseFloat(feed.field2) || 0);
    const moistureData = feeds.map(feed => parseFloat(feed.field3) || 0);
    
    updateChart(accelerometerChart, timestamps, accelerometerData);
    updateChart(vibrationChart, timestamps, vibrationData);
    updateChart(moistureChart, timestamps, moistureData);
  } catch (error) {
    console.error("Error fetching ThingSpeak data:", error);
  }
}

function updateChart(chart, labels, data) {
  chart.data.labels = labels;
  chart.data.datasets[0].data = data;
  chart.update();
}

setInterval(fetchData, updateInterval);
fetchData();
