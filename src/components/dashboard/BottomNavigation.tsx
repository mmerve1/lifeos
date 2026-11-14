import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Home, Calendar, CheckSquare, Sparkles, User } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useI18n, TranslationKey } from '../../i18n';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { NavTabType } from '../../types';

interface BottomNavigationProps {
  activeTab: NavTabType;
  onTabChange: (tab: NavTabType) => void;
}

interface TabItemConfig {
  key: NavTabType;
  labelKey: TranslationKey;
  renderIcon: (color: string, focused: boolean) => React.ReactNode;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { colors } = useTheme();
  const { t } = useI18n();

  const tabs: TabItemConfig[] = [
    {
      key: 'home',
      labelKey: 'navHome',
      renderIcon: (color) => <Home size={20} color={color} strokeWidth={2} />,
    },
    {
      key: 'calendar',
      labelKey: 'navCalendar',
      renderIcon: (color) => <Calendar size={20} color={color} strokeWidth={2} />,
    },
    {
      key: 'tasks',
      labelKey: 'navTasks',
      renderIcon: (color) => <CheckSquare size={20} color={color} strokeWidth={2} />,
    },
    {
      key: 'ai',
      labelKey: 'navAI',
      renderIcon: (color) => <Sparkles size={20} color={color} strokeWidth={2} />,
    },
    {
      key: 'profile',
      labelKey: 'navProfile',
      renderIcon: (color) => <User size={20} color={color} strokeWidth={2} />,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
      <View style={styles.navBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const color = isActive ? colors.primary : colors.textSecondary;

          return (
            <Pressable
              key={tab.key}
              onPress={() => onTabChange(tab.key)}
              hitSlop={6}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              style={styles.tabButton}
            >
              <View
                style={[
                  styles.iconWrapper,
                  isActive && { backgroundColor: `${colors.primary}1F` },
                ]}
              >
                {tab.renderIcon(color, isActive)}
              </View>
              <Text
                style={[
                  Typography.caption,
                  styles.tabLabel,
                  { color, fontWeight: isActive ? '600' : '400' },
                ]}
              >
                {t(tab.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    minWidth: 54,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 2,
  },
});
