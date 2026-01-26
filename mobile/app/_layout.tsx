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
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  enabled: !__DEV__,

  sendDefaultPii: !__DEV__,
  enableLogs: !__DEV__,

  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,

  integrations: __DEV__
    ? []
    : [Sentry.mobileReplayIntegration()],
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