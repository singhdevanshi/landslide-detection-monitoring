// thingspeak-api.js
class ThingSpeakAPI {
    constructor(channelId, readApiKey) {
        this.channelId = channelId;
        this.readApiKey = readApiKey;
        this.baseUrl = 'https://api.thingspeak.com';
    }
    
    async getLatestData() {
        try {
            const response = await fetch(
                `${this.baseUrl}/channels/${this.channelId}/feeds/last.json?api_key=${this.readApiKey}`
            );
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching latest data:', error);
            return null;
        }
    }
    
    async getHistoricalData(days = 1) {
        try {
            const response = await fetch(
                `${this.baseUrl}/channels/${this.channelId}/feeds.json?api_key=${this.readApiKey}&days=${days}`
            );
            if (!response.ok) {
                throw new Error('Failed to fetch historical data');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching historical data:', error);
            return null;
        }
    }
}

// Replace with your actual channel ID and read API key
const CHANNEL_ID = '2878666';
const READ_API_KEY = 'GRFB9E6YPTFUS1QI';

const thingSpeakClient = new ThingSpeakAPI(CHANNEL_ID, READ_API_KEY);