import React from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import TitleImage from "./title.png"; // Replace with the actual path to your image
import BgImage from "./bg.jpg"; // Replace with the actual path to your background image

const LandingPage = () => {
  const navigation = useNavigation();

  return (
    <ImageBackground source={BgImage} style={styles.background}>
      <View style={styles.container}>
        <Image source={TitleImage} style={styles.image} />
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Game")}
        >
          <Text style={styles.buttonText}>Play</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Game")}
        >
          <Text style={styles.buttonText}>How to play</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover", // Ensure the background image covers the entire screen
    justifyContent: "center", // Center content vertically
    alignItems: "center", // Center content horizontally
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 300, // Set the desired width of the image
    height: 200, // Set the desired height of the image
    marginBottom: 350,
  },
  button: {
    backgroundColor: "#D269E6", // Button background color
    paddingVertical: 20, // Vertical padding
    paddingHorizontal: 100, // Horizontal padding
    borderRadius: 8, // Rounded corners
    elevation: 3, // Shadow for Android
    shadowColor: "#5CE1E6", // Shadow color for iOS
    shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
    shadowOpacity: 1, // Shadow opacity for iOS
    shadowRadius: 4, // Shadow blur radius for iOS
  },
  buttonText: {
    color: "#fff", // Text color
    fontSize: 16, // Text size
    fontWeight: "bold", // Text weight
    textAlign: "center", // Center align text
  },
  ball: {
    width: 50, // Adjust the ball size
    height: 50, // Adjust the ball size
    backgroundColor: "#FF6347", // Ball color
    borderRadius: 25, // Make it circular
    position: "absolute", // Absolute positioning to float around
    top: 50, // Adjust initial top position
  },
  star: {
    width: 10,
    height: 10,
    backgroundColor: "#FFD700",
    borderRadius: 5,
    position: "absolute",
  },
});

export default LandingPage;
