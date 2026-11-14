import React, { useState } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { I18nProvider } from './src/i18n';
import { ScreenType } from './src/types';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';

function MainApp() {
  const { colors, isDark } = useTheme();
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('login');
  const [userName, setUserName] = useState('Merve');

  const handleLoginSuccess = (email: string) => {
    const inferredName = email.split('@')[0];
    const capitalizedName =
      inferredName.charAt(0).toUpperCase() + inferredName.slice(1);
    setUserName(capitalizedName || 'Merve');
    setCurrentScreen('dashboard');
  };

  const handleRegisterSuccess = (name: string) => {
    setUserName(name || 'Merve');
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setCurrentScreen('login');
  };

  const isWeb = Platform.OS === 'web';

  const appContent = (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {currentScreen === 'login' && (
        <LoginScreen
          onNavigateToRegister={() => setCurrentScreen('register')}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {currentScreen === 'register' && (
        <RegisterScreen
          onNavigateToLogin={() => setCurrentScreen('login')}
          onRegisterSuccess={handleRegisterSuccess}
        />
      )}

      {currentScreen === 'dashboard' && (
        <DashboardScreen
          userName={userName}
          onLogout={handleLogout}
        />
      )}
    </SafeAreaView>
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
          {appContent}
        </View>
      </View>
    );
  }

  return appContent;
}

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <MainApp />
      </I18nProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
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
    maxWidth: 430, // Standard modern mobile screen width (iPhone 15/16 Pro Max dimension)
    height: '100%',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    overflow: 'hidden',
  },
});
