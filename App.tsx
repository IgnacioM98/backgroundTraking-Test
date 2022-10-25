import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, View } from "react-native";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { useEffect, useState } from "react";

const TASK_NAME = "BACKGROUND_LOCATION_TASK";

TaskManager.defineTask(TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error(error);
    return;
  }
  if (data) {
    /* Data object example:
      {
        locations: [
          {
            coords: {
              accuracy: 22.5,
              altitude: 61.80000305175781,
              altitudeAccuracy: 1.3333333730697632,
              heading: 0,
              latitude: 36.7384187,
              longitude: 3.3464008,
              speed: 0,
            },
            timestamp: 1640286402303,
          },
        ],
      };
    */
    const { locations } = data as any;
    const location = locations[0];

    if (location) {
      // Do something with location...
      console.log(location);
    }
  }
});

export default function App() {
  // Define position state: {latitude: number, longitude: number}
  const [position, setPosition] = useState(null);

  // Start location tracking in background
  const startBackgroundUpdate = async () => {
    // Don't track position if permission is not granted
    const { granted } = await Location.getBackgroundPermissionsAsync();
    if (!granted) {
      console.log("location tracking denied");
      return;
    }

    // Make sure the task is defined otherwise do not start tracking
    const isTaskDefined = await TaskManager.isTaskDefined(TASK_NAME);
    if (!isTaskDefined) {
      console.log("Task is not defined");
      return;
    }

    // Don't track if it is already running in background
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(TASK_NAME);
    if (hasStarted) {
      console.log("Already started");
      return;
    }

    await Location.startLocationUpdatesAsync(TASK_NAME, {
      // For better logs, we set the accuracy to the most sensitive option
      accuracy: Location.Accuracy.BestForNavigation,
      // accuracy: 22,
      // Make sure to enable this notification if you want to consistently track in the background
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: "Location",
        notificationBody: "Location tracking in background",
        notificationColor: "#fff",
      },
    });
  };

  // Stop location tracking in background
  const stopBackgroundUpdate = async () => {
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(TASK_NAME);
    if (hasStarted) {
      await Location.stopLocationUpdatesAsync(TASK_NAME);
      console.log("Location tacking stopped");
    }
  };

  useEffect(() => {
    const requestPermissions = async () => {
      const foreground = await Location.requestForegroundPermissionsAsync();
      if (foreground.granted)
        await Location.requestBackgroundPermissionsAsync().catch((reason) =>
          console.log(reason)
        );
    };
    requestPermissions();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Button
          onPress={startBackgroundUpdate}
          title="Start in background"
          color="green"
        />
        <Button
          onPress={stopBackgroundUpdate}
          title="Stop in foreground"
          color="red"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
