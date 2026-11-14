import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '../theme/ThemeContext';
import { I18nProvider } from '../i18n';

function RootLayoutContent() {
  const { colors, isDark } = useTheme();
  const isWeb = Platform.OS === 'web';

  const stackContent = (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack>
    </View>
  );

  if (isWeb) {
    return (
      <View
        style={[
          styles.webPageContainer,
          { backgroundColor: isDark ? '#090A0F' : '#E8EBF5' },
        ]}
      >
        <View
          style={[
            styles.mobileSimulatorFrame,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
            },
          ]}
        >
          {stackContent}
        </View>
      </View>
    );
  }

  return stackContent;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <I18nProvider>
          <RootLayoutContent />
        </I18nProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  webPageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  mobileSimulatorFrame: {
    width: '100%',
    maxWidth: 430,
    height: '100%',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    overflow: 'hidden',
  },
});
