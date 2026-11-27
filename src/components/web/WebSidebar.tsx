import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Home, Calendar, CheckSquare, Flame, Sparkles, User, LogOut, Sun, Moon, Globe } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useI18n, TranslationKey } from '../../i18n';
import { Typography } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { LifeOSLogo } from '../common/LifeOSLogo';
import { NavTabType } from '../../types';

interface WebSidebarProps {
  activeTab: NavTabType;
  onTabChange: (tab: NavTabType) => void;
  onLogout?: () => void;
  userName?: string;
}

interface SidebarTabItem {
  key: NavTabType;
  labelKey: TranslationKey;
  renderIcon: (color: string) => React.ReactNode;
}

export const WebSidebar: React.FC<WebSidebarProps> = ({
  activeTab,
  onTabChange,
  onLogout,
  userName = 'Merve',
}) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { t, language, toggleLanguage } = useI18n();

  const tabs: SidebarTabItem[] = [
    {
      key: 'home',
      labelKey: 'navHome',
      renderIcon: (color) => <Home size={18} color={color} />,
    },
    {
      key: 'tasks',
      labelKey: 'navTasks',
      renderIcon: (color) => <CheckSquare size={18} color={color} />,
    },
    {
      key: 'calendar',
      labelKey: 'navCalendar',
      renderIcon: (color) => <Calendar size={18} color={color} />,
    },
    {
      key: 'habits',
      labelKey: 'navHabits',
      renderIcon: (color) => <Flame size={18} color={color} />,
    },
    {
      key: 'ai',
      labelKey: 'navAI',
      renderIcon: (color) => <Sparkles size={18} color={color} />,
    },
    {
      key: 'profile',
      labelKey: 'navProfile',
      renderIcon: (color) => <User size={18} color={color} />,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.sidebar, borderRightColor: colors.border }]}>
      {/* Brand Logo */}
      <View style={styles.brandSection}>
        <LifeOSLogo size="sm" />
      </View>

      {/* Navigation Items */}
      <View style={styles.navSection}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const color = isActive ? colors.primaryText : colors.textSecondary;
          return (
            <Pressable
              key={tab.key}
              onPress={() => onTabChange(tab.key)}
              style={({ pressed }) => [
                styles.navItem,
                isActive && {
                  backgroundColor: colors.primary,
                },
                pressed && { opacity: 0.85 },
              ]}
            >
              <View style={styles.navItemIcon}>{tab.renderIcon(color)}</View>
              <Text
                style={[
                  Typography.body,
                  styles.navItemText,
                  { color, fontWeight: isActive ? '700' : '500' },
                ]}
              >
                {t(tab.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Footer Controls */}
      <View style={[styles.footerSection, { borderTopColor: colors.border }]}>
        <View style={styles.toggleRow}>
          <Pressable
            onPress={toggleLanguage}
            style={[styles.smallPill, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
            hitSlop={6}
          >
            <Globe size={14} color={colors.textSecondary} />
            <Text style={[Typography.captionBold, { color: colors.textPrimary, fontSize: 11 }]}>
              {language.toUpperCase()}
            </Text>
          </Pressable>

          <Pressable
            onPress={toggleTheme}
            style={[styles.smallPill, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
            hitSlop={6}
          >
            {isDark ? <Sun size={14} color="#FFB454" /> : <Moon size={14} color={colors.primary} />}
            <Text style={[Typography.captionBold, { color: colors.textPrimary, fontSize: 11 }]}>
              {isDark ? (language === 'tr' ? 'Açık' : 'Light') : (language === 'tr' ? 'Koyu' : 'Dark')}
            </Text>
          </Pressable>
        </View>

        <View style={[styles.userCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
            <Text style={[Typography.bodyBold, { color: colors.primaryText, fontSize: 13 }]}>
              {userName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userMeta}>
            <Text style={[Typography.bodyBold, { color: colors.textPrimary, fontSize: 13 }]} numberOfLines={1}>
              {userName}
            </Text>
            <Text style={[Typography.caption, { color: colors.textSecondary, fontSize: 11 }]} numberOfLines={1}>
              LifeOS
            </Text>
          </View>
          {onLogout && (
            <Pressable onPress={onLogout} hitSlop={8} style={styles.logoutBtn} accessibilityLabel={t('logout')}>
              <LogOut size={16} color={colors.danger} />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 240,
    height: '100%',
    borderRightWidth: 1,
    paddingVertical: 28,
    paddingHorizontal: 18,
    justifyContent: 'space-between',
  },
  brandSection: {
    paddingHorizontal: 10,
    paddingBottom: 24,
  },
  navSection: {
    flex: 1,
    gap: 6,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 14,
  },
  navItemIcon: {
    marginRight: 12,
  },
  navItemText: {
    fontSize: 15,
    flex: 1,
  },
  footerSection: {
    borderTopWidth: 1,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  smallPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 7,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: 16,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMeta: {
    flex: 1,
  },
  logoutBtn: {
    padding: 4,
  },
});
