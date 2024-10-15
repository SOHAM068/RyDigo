const express = require("express");
const { WebSocketServer } = require("ws");
const geolib = require("geolib");

const app = express();
const PORT = 4000;

// Store driver locations
let drivers = {};

// Create WebSocket server
const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      console.log("Received message:", data); // Debugging line

      if (data.type === "locationUpdate" && data.role === "driver") {
        drivers[data.driver] = {
          latitude: data.latitude,
          longitude: data.longitude,
        };
        console.log(`Updated driver ${data.driver} location:`, drivers[data.driver]);
      }

      if (data.type === "requestRide" && data.role === "user") {
        console.log("Requesting ride...");
        console.log("Current drivers:", drivers); // Log the drivers object
        const nearbyDrivers = findNearbyDrivers(data.latitude, data.longitude);
        console.log("Nearby drivers:", nearbyDrivers);
        ws.send(
          JSON.stringify({ type: "nearbyDrivers", drivers: nearbyDrivers })
        );
      }
    } catch (error) {
      console.log("Failed to parse WebSocket message:", error);
    }
  });
});

const findNearbyDrivers = (userLat, userLon) => {
  console.log("Finding nearby drivers for user at:", userLat, userLon);
  return Object.entries(drivers)
    .filter(([id, location]) => {
      const distance = geolib.getDistance(
        { latitude: userLat, longitude: userLon },
        location
      );
      console.log(`Distance to driver ${id}: ${distance} meters`);
      return distance <= 10000; // 10 kilometers
    })
    .map(([id, location]) => ({ id, ...location })); // Add driver id to the object and return it as an array, ... is the spread operator to copy the object properties to the new object
};

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
