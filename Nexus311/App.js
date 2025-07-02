import React, { useEffect, useRef, useState } from "react";
import { WebView } from "react-native-webview";
import {
  View,
  StyleSheet,
  StatusBar,
  Text,
  BackHandler,
  ActivityIndicator,
  Dimensions,
  AppRegistry,
  Alert,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  Linking,
} from "react-native";
import * as Notifications from "expo-notifications";
import * as Location from "expo-location";
import { Camera } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";

export default function App() {
  const height = Dimensions.get("screen").height;
  const width = Dimensions.get("screen").width;
  const webViewRef = React.useRef(null);

  // const [isWebViewLoading, setIsWebViewLoading] = useState(true);
  const [shouldShowBackButton, setShouldShowBackButton] = useState(false);
  const [showLoadingIcon, setShowLoadingIcon] = useState(true);

  useEffect(() => {
    // Add a delay before showing the back button (e.g., 2000 milliseconds or 2 seconds)
    const delayTimeout = setTimeout(() => {
      // setShouldShowBackButton(true);
      registerForPermissions();
      setShowLoadingIcon(false);
    }, 3000);

    // Cleanup function to clear the timeout on component unmount or re-render
    return () => clearTimeout(delayTimeout);
  }, []);

  const handleBackPress = () => {
    if (webViewRef.current) {
      if (Platform.OS === "ios" || Platform.OS === "android") {
        webViewRef.current.goBack();
      }
    }
  };

  // Function to request camera and location permissions.
  const registerForPermissions = async () => {
    // Request camera permission
    const { status: existingCameraStatus } =
      await Camera.getCameraPermissionsAsync();
    if (existingCameraStatus !== "granted") {
      const { status: cameraStatus } =
        await Camera.requestCameraPermissionsAsync();
      if (cameraStatus !== "granted") {
        showExplanationModal(
          "Camera and Location Permission Required",
          "App needs to know your location and camera access to capture the incident to report."
        );
      }
    }

    // Request location permission
    const { status: existingLocationStatus } =
      await Location.requestForegroundPermissionsAsync();

    registerForPushNotificationsAsync();
  };

  const showExplanationModal = (title, message) => {
    // Replace this with your actual code to display a modal or alert to the user
    alert(`${title}\n\n${message}`);
  };

  // Function to register for push notifications
  const registerForPushNotificationsAsync = async () => {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return;
    }
  };

  const onNavigationStateChange = (navState) => {
    const currentUrl = navState.url;
    console.log("Current URL:", currentUrl);
    try {
      if (
        currentUrl.endsWith("deviceType=ios") ||
        currentUrl.endsWith("com/s")
      ) {
        setShouldShowBackButton(false);
      } else {
        setShouldShowBackButton(true);
      }
    } catch (error) {
      console.log("error:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
      <WebView
        ref={webViewRef}
        source={{
          uri: "https://311qa2-dev-ed.develop.my.site.com/311LWR?deviceType=ios",
        }}
        onNavigationStateChange={onNavigationStateChange}
        onError={(event) => {
          console.log(event);
          alert(`Webview Error : ${event.nativeEvent.description}`);
        }}
        userAgent={Platform.OS === "ios" ?
          "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1" :
          undefined}
        // Essential WebView properties
        javaScriptEnabled={true}
        domStorageEnabled={true}
        sharedCookiesEnabled={true}
        cacheEnabled={true}
        // Allow navigation
        allowsBackForwardNavigationGestures={true}
        // Security
        originWhitelist={['*']}
        // Critical for about:srcdoc errors - force all pages to stay in main frame
        setSupportMultipleWindows={false}
        // Ensure iframes are handled properly
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        allowFileAccessFromFileURLs={true}
        webviewDebuggingEnabled={true}
      />
      {shouldShowBackButton && (
        <View style={styles.navBar}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons
              name="chevron-back"
              size={32}
              color="white"
              marginLeft={5}
            />
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
        </View>
      )}
      {showLoadingIcon && (
        <ActivityIndicator
          color={"#002b54"}
          style={{
            position: "absolute",
            top: height / 2,
            left: width / 2.2,
          }}
          size={"large"}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    backgroundColor: "#002b54",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  loadingIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    marginLeft: 5, // Adjust the spacing between the icon and text
  },
  navBar: {
    height: 30,
  },
});

AppRegistry.registerComponent("Nexus311", () => App);