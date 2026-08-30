import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { BLE } from "../BLE"; // <-- import BLE wrapper

type ControlButtonProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
};


type TrailerCommand = "L" | "R" | "H" | "B" | "O";

export default function TrailerController() {
  const [left, setLeft] = useState(false);
  const [right, setRight] = useState(false);
  const [hazards, setHazards] = useState(false);
  const [brake, setBrake] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
  "scanning" | "connecting" | "connected" | "disconnected"
>("disconnected");
  const [trailerState, setTrailerState] = useState("OFF");



  // Blink animation
  const blink = useSharedValue(1);

  useEffect(() => {
    BLE.onTrailerState = (state) => {
      setTrailerState(state);
    };

    BLE.onStatusChange = (status) => {
      setConnectionStatus(status as any);
    };

    const init = async () => {
      const auto = await BLE.autoReconnect();
      if (!auto) {
        await BLE.scanAndConnect();
      }
    };

    init();
  }, []);



  useEffect(() => {
    const blinking =
      trailerState === "LEFT" ||
      trailerState === "RIGHT" ||
      trailerState === "BOTH" ||
      trailerState === "HAZARDS" ||
      trailerState === "BRAKE_LEFT" ||
      trailerState === "BRAKE_RIGHT";

    if (blinking) {
      blink.value = withRepeat(withTiming(0, { duration: 300 }), -1, true);
    } else {
      blink.value = 1;
    }
  }, [trailerState]);


  const blinkStyle = useAnimatedStyle(() => ({
    opacity: blink.value,
  }));

  const sendCommand = async (cmd: TrailerCommand) => {
    console.log("SEND BLE:", cmd);
    // TODO: integrate BLE write command
    await BLE.write(cmd);
  };

  const toggleLeft = () => {
    setLeft(!left);   // highlight only
    sendCommand("L");
  };

  const toggleRight = () => {
    setRight(!right);
    sendCommand("R");
  };

  const toggleHazards = () => {
    setHazards(!hazards);
    sendCommand("H");
  };

  const toggleBrake = () => {
    setBrake(!brake);
    sendCommand("B");
  };

  const getStatus = () => trailerState;


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trailer Controller</Text>

      <View
  style={[
    styles.statusBar,
    {
      backgroundColor:
        connectionStatus === "connected"
          ? "#22C55E"
          : connectionStatus === "connecting"
          ? "#FACC15"
          : connectionStatus === "scanning"
          ? "#3B82F6"
          : "#EF4444",
    },
  ]}
>
  <Text style={styles.statusBarText}>
    {connectionStatus === "connected" && "Connected"}
    {connectionStatus === "connecting" && "Connecting…"}
    {connectionStatus === "scanning" && "Scanning…"}
    {connectionStatus === "disconnected" && "Disconnected"}
  </Text>
</View>


{/* Trailer Diagram */}
<View style={styles.trailerRow}>
  {/* LEFT LIGHT */}
  <Animated.View
    style={[
      styles.light,
      blinkStyle,
      {
        backgroundColor:
          trailerState === "HAZARDS" ? "#FACC15" :
          trailerState === "BRAKE" ? "#EF4444" :
          trailerState === "BRAKE_LEFT" ? "#EF4444" :
          trailerState === "LEFT" ? "#6366F1" :
          trailerState === "BRAKE_RIGHT" ? "#D1D5DB" :
          trailerState === "RIGHT" ? "#D1D5DB" :
          "#D1D5DB",
      },
    ]}
  />

  {/* RIGHT LIGHT */}
  <Animated.View
    style={[
      styles.light,
      blinkStyle,
      {
        backgroundColor:
          trailerState === "HAZARDS" ? "#FACC15" :
          trailerState === "BRAKE" ? "#EF4444" :
          trailerState === "BRAKE_RIGHT" ? "#EF4444" :
          trailerState === "RIGHT" ? "#6366F1" :
          trailerState === "BRAKE_LEFT" ? "#D1D5DB" :
          trailerState === "LEFT" ? "#D1D5DB" :
          "#D1D5DB",
      },
    ]}
  />
</View>


      {/* Buttons */}
      <View style={styles.row}>
        <ControlButton
          label="Left"
          icon="arrow-back"
          active={left}
          onPress={toggleLeft}
        />
        <ControlButton
          label="Right"
          icon="arrow-forward"
          active={right}
          onPress={toggleRight}
        />
      </View>

      <ControlButton
        label="Hazards"
        icon="warning"
        active={hazards}
        onPress={toggleHazards}
      />

      <ControlButton
        label="Brake"
        icon="stop"
        active={brake}
        onPress={toggleBrake}
      />

      <Text style={styles.status}>{getStatus()}</Text>
    </View>
  );
}

function ControlButton({ label, icon, active, onPress }: ControlButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        { backgroundColor: active ? "#6366F1" : "#FFFFFF" },
      ]}
    >
      <Ionicons
        name={icon}
        size={40}
        color={active ? "#FFFFFF" : "#6366F1"}
      />
      <Text
        style={[
          styles.buttonText,
          { color: active ? "#FFFFFF" : "#6366F1" },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 30,
  },
  trailerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "60%",
    marginBottom: 40,
  },
  light: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  row: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 20,
  },
  button: {
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    width: 140,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "bold",
  },
  status: {
    marginTop: 30,
    fontSize: 22,
    fontWeight: "bold",
  },
  statusBar: {
  width: "100%",
  paddingVertical: 10,
  borderRadius: 10,
  marginBottom: 20,
  alignItems: "center",
},
statusBarText: {
  color: "white",
  fontSize: 16,
  fontWeight: "bold",
},

});
