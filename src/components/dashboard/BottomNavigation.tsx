import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing, Platform } from 'react-native';
import { Home, Calendar, CheckSquare, Plus, User } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useI18n } from '../../i18n';
import { Typography } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { NavTabType } from '../../types';

interface BottomNavigationProps {
  activeTab: NavTabType;
  onTabChange: (tab: NavTabType) => void;
  onQuickAdd?: () => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
  onQuickAdd,
}) => {
  const { colors } = useTheme();
  const { t } = useI18n();
  const breatheAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const useNativeDriver = Platform.OS !== 'web';
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1.07,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver,
        }),
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [breatheAnim]);

  const renderTab = (
    key: NavTabType,
    label: string,
    icon: (color: string) => React.ReactNode
  ) => {
    const isActive = activeTab === key;
    const color = isActive ? colors.primary : colors.textSecondary;
    return (
      <Pressable
        key={key}
        onPress={() => onTabChange(key)}
        hitSlop={6}
        accessibilityRole="tab"
        accessibilityState={{ selected: isActive }}
        style={styles.tabButton}
      >
        {icon(color)}
        <Text
          style={[
            Typography.caption,
            styles.tabLabel,
            { color, fontWeight: isActive ? '700' : '500' },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.outerWrap, { backgroundColor: 'transparent' }]}>
      <View
        style={[
          styles.floatingPill,
          {
            backgroundColor: colors.surfaceElevated,
            borderColor: colors.border,
          },
        ]}
      >
        {renderTab('home', t('navHome'), (c) => <Home size={19} color={c} />)}
        {renderTab('tasks', t('navTasks'), (c) => <CheckSquare size={19} color={c} />)}

        {/* Center breathing + Quick Capture button */}
        <Animated.View style={{ transform: [{ scale: breatheAnim }] }}>
          <Pressable
            onPress={() => (onQuickAdd ? onQuickAdd() : onTabChange('tasks'))}
            style={({ pressed }) => [
              styles.centerFab,
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
            accessibilityLabel="Quick add task"
          >
            <Plus size={26} color={colors.primaryText} strokeWidth={2.5} />
          </Pressable>
        </Animated.View>

        {renderTab('calendar', t('navCalendar'), (c) => <Calendar size={19} color={c} />)}
        {renderTab('profile', t('navProfile'), (c) => <User size={19} color={c} />)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrap: {
    paddingHorizontal: 14,
    paddingBottom: Spacing.md,
    paddingTop: 6,
  },
  floatingPill: {
    height: 68,
    borderRadius: Radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 52,
    gap: 2,
  },
  tabLabel: {
    fontSize: 10,
  },
  centerFab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8FA2FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
});
