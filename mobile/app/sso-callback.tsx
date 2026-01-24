import { useEffect } from "react";
import { useRouter } from "expo-router";
import { View, ActivityIndicator } from "react-native";

export default function SSOCallback() {
  const router = useRouter();

  useEffect(() => {
    // Auth already succeeded — just move forward
    router.replace("/(tabs)");
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
