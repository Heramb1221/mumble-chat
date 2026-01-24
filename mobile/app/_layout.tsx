import { Stack } from "expo-router";
import { ClerkProvider } from '@clerk/clerk-expo'
import "../global.css";
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import AuthSync from "@/components/AuthSync";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Sentry from '@sentry/react-native';
import SocketConnection from "@/components/SocketConnection";

Sentry.init({
  dsn: 'https://efd20e60483d7f7af2c5436b0a3202bf@o4510764612255744.ingest.de.sentry.io/4510764613632080',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

const queryClient = new QueryClient();

export default Sentry.wrap(function RootLayout() {

  return (
    <ClerkProvider tokenCache={tokenCache}>
      <QueryClientProvider client={queryClient}>
        <AuthSync />
        <SocketConnection />
        <StatusBar style="light"/>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#121417"} }}>
          <Stack.Screen name="(auth)" options={{ animation: "fade" }}/>
          <Stack.Screen name="(tabs)" options={{ animation: "fade" }}/>
          <Stack.Screen name="new-chat" options={{ animation: "slide_from_bottom", presentation:"modal", gestureEnabled: true }}/>
        </Stack>
      </QueryClientProvider>
    </ClerkProvider>
  );
});