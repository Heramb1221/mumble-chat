import { useSSO } from "@clerk/clerk-expo";
import { useState } from "react";
import { Alert } from "react-native";
import * as Linking from "expo-linking";

function useAuthSocial() {
  const [loadingStrategy, setLoadingStrategy] = useState<
    "oauth_google" | "oauth_apple" | null
  >(null);

  const { startSSOFlow } = useSSO();

  // 🔑 This generates the correct redirect URL for:
  // - Android emulator
  // - Physical device (QR)
  // - Web
  const redirectUrl = Linking.createURL("sso-callback");

  const handleSocialAuth = async (
    strategy: "oauth_google" | "oauth_apple"
  ) => {
    if (loadingStrategy) return;
    setLoadingStrategy(strategy);

    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy,
        redirectUrl,
      });

      if (!createdSessionId || !setActive) {
        const provider = strategy === "oauth_google" ? "Google" : "Apple";
        Alert.alert(
          "Sign-in incomplete",
          `${provider} sign-in did not complete. Please try again.`
        );
        return;
      }

      // ✅ Activate the Clerk session
      await setActive({ session: createdSessionId });
    } catch (error) {
      console.log("💥 Error in social auth:", error);
      const provider = strategy === "oauth_google" ? "Google" : "Apple";
      Alert.alert("Error", `Failed to sign in with ${provider}. Please try again.`);
    } finally {
      setLoadingStrategy(null);
    }
  };

  return { handleSocialAuth, loadingStrategy };
}

export default useAuthSocial;