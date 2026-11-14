import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Home, Calendar, CheckSquare, Sparkles, User } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { NavTabType } from '../../types';

interface BottomNavigationProps {
  activeTab: NavTabType;
  onTabChange: (tab: NavTabType) => void;
}

interface TabItemConfig {
  key: NavTabType;
  label: string;
  renderIcon: (color: string, focused: boolean) => React.ReactNode;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs: TabItemConfig[] = [
    {
      key: 'home',
      label: 'Home',
      renderIcon: (color) => <Home size={20} color={color} strokeWidth={2} />,
    },
    {
      key: 'calendar',
      label: 'Calendar',
      renderIcon: (color) => <Calendar size={20} color={color} strokeWidth={2} />,
    },
    {
      key: 'tasks',
      label: 'Tasks',
      renderIcon: (color) => <CheckSquare size={20} color={color} strokeWidth={2} />,
    },
    {
      key: 'ai',
      label: 'AI',
      renderIcon: (color) => <Sparkles size={20} color={color} strokeWidth={2} />,
    },
    {
      key: 'profile',
      label: 'Profile',
      renderIcon: (color) => <User size={20} color={color} strokeWidth={2} />,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const color = isActive ? Colors.primary : Colors.textSecondary;

          return (
            <Pressable
              key={tab.key}
              onPress={() => onTabChange(tab.key)}
              hitSlop={6}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              style={styles.tabButton}
            >
              <View style={[styles.iconWrapper, isActive && styles.iconWrapperActive]}>
                {tab.renderIcon(color, isActive)}
              </View>
              <Text
                style={[
                  Typography.caption,
                  styles.tabLabel,
                  { color, fontWeight: isActive ? '600' : '400' },
                ]}
              >
                {tab.label}
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
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
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
  iconWrapperActive: {
    backgroundColor: 'rgba(139, 124, 246, 0.12)',
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 2,
  },
});
