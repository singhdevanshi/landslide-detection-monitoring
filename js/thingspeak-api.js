async function testThingSpeak() {
    const CHANNEL_ID = '2878666';
    const READ_API_KEY = 'GRFB9E6YPTFUS1QI';
    const url = `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds.json?api_key=${READ_API_KEY}&results=10`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log("ThingSpeak data:", data);
        return data;
    } catch (error) {
        console.error("Error fetching from ThingSpeak:", error);
        return null;
    }
}

// Call this function to test
document.addEventListener('DOMContentLoaded', function() {
    testThingSpeak();
});