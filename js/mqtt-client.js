// js/mqtt-client.js - Renamed to thingspeak-client.js
// This should be a proper module with correct ThingSpeak API handling

const THINGSPEAK_READ_API_KEY = "GRFB9E6YPTFUS1QI";
const THINGSPEAK_CHANNEL_ID = "2878666";

// ThingSpeak client object
const thingSpeakClient = {
    // Get latest data point
    getLatestData: async function() {
        try {
            const url = `https://api.thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/feeds/last.json?api_key=${THINGSPEAK_READ_API_KEY}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error("Error fetching ThingSpeak data:", error);
            return null;
        }
    },
    
    // Get historical data
    getHistoricalData: async function(days = 1) {
        try {
            // Calculate results based on days (assuming 15s update rate)
            const results = Math.min(8000, Math.ceil((days * 24 * 60 * 60) / 15));
            
            const url = `https://api.thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/feeds.json?api_key=${THINGSPEAK_READ_API_KEY}&results=${results}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error("Error fetching ThingSpeak data:", error);
            return null;
        }
    }
};