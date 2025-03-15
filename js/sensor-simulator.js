// sensor-simulator.js
// This script simulates sensor data for testing

// Function to generate random value within a range
function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

// Function to simulate accelerometer data
function simulateAccelerometer() {
    return {
        x: randomInRange(-0.2, 0.2),
        y: randomInRange(-0.2, 0.2),
        z: randomInRange(0.8, 1.2) // Mostly gravity
    };
}

// Function to simulate vibration data
function simulateVibration() {
    return {
        value: randomInRange(0, 5)
    };
}

// Function to simulate soil moisture
function simulateMoisture() {
    return {
        value: randomInRange(30, 80)
    };
}

// Function to calculate Factor of Safety based on moisture
// This is a simplified model - you'd replace with your actual FOS calculation
function calculateFOS(moisture) {
    // Simple model: FOS decreases as moisture increases
    // FOS = 2.0 at 0% moisture, FOS = 0.8 at 100% moisture
    return 2.0 - (moisture / 100) * 1.2;
}

// Start simulation
function startSimulation() {
    console.log('Starting sensor simulation...');
    
    // Connect to MQTT broker
    const mqttClient = new MQTTClient('broker.hivemq.com', 8884, `landslide_simulator_${Date.now()}`);
    mqttClient.connect();
    
    mqttClient.setOnConnectCallback(() => {
        console.log('Simulator connected to MQTT broker');
        
        // Publish initial data
        publishSensorData();
        
        // Set interval to publish data regularly
        setInterval(publishSensorData, 5000);
    });
    
    function publishSensorData() {
        // Generate simulated data
        const accelData = simulateAccelerometer();
        const vibrationData = simulateVibration();
        const moistureData = simulateMoisture();
        const fosValue = calculateFOS(moistureData.value);
        
        // Publish to MQTT topics
        mqttClient.publish('landslide/sensors/accelerometer', accelData);
        mqttClient.publish('landslide/sensors/vibration', vibrationData);
        mqttClient.publish('landslide/sensors/moisture', moistureData);
        mqttClient.publish('landslide/analysis/fos', { value: fosValue });
        
        console.log('Published simulated data:', {
            accelerometer: accelData,
            vibration: vibrationData,
            moisture: moistureData,
            fos: fosValue
        });
    }
}

// Start simulation when script loads
startSimulation();