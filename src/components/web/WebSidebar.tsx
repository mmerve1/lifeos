import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Home, Calendar, CheckSquare, Sparkles, User, LogOut, Sun, Moon, Globe } from 'lucide-react-native';
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
    <View style={[styles.container, { backgroundColor: colors.surface, borderRightColor: colors.border }]}>
      {/* Brand Logo */}
      <View style={styles.brandSection}>
        <LifeOSLogo size="sm" />
      </View>

      {/* Navigation Items */}
      <View style={styles.navSection}>
        <Text style={[Typography.captionBold, styles.navCategoryTitle, { color: colors.textSecondary }]}>
          {language === 'tr' ? 'MENÜ' : 'MENU'}
        </Text>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const color = isActive ? colors.primary : colors.textSecondary;
          return (
            <Pressable
              key={tab.key}
              onPress={() => onTabChange(tab.key)}
              style={({ pressed }) => [
                styles.navItem,
                isActive && {
                  backgroundColor: `${colors.primary}18`,
                  borderColor: `${colors.primary}44`,
                },
                pressed && { opacity: 0.8 },
              ]}
            >
              <View style={styles.navItemIcon}>{tab.renderIcon(color)}</View>
              <Text
                style={[
                  Typography.body,
                  styles.navItemText,
                  { color, fontWeight: isActive ? '600' : '500' },
                ]}
              >
                {t(tab.labelKey)}
              </Text>
              {isActive && <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />}
            </Pressable>
          );
        })}
      </View>

      {/* Footer Controls (Theme, Language, User, Logout) */}
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
            {isDark ? <Sun size={14} color="#FBBF24" /> : <Moon size={14} color={colors.primary} />}
            <Text style={[Typography.captionBold, { color: colors.textPrimary, fontSize: 11 }]}>
              {isDark ? (language === 'tr' ? 'Açık' : 'Light') : (language === 'tr' ? 'Koyu' : 'Dark')}
            </Text>
          </Pressable>
        </View>

        {/* User Card */}
        <View style={[styles.userCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
            <Text style={[Typography.bodyBold, { color: '#FFFFFF', fontSize: 13 }]}>
              {userName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userMeta}>
            <Text style={[Typography.bodyBold, { color: colors.textPrimary, fontSize: 13 }]} numberOfLines={1}>
              {userName}
            </Text>
            <Text style={[Typography.caption, { color: colors.textSecondary, fontSize: 11 }]} numberOfLines={1}>
              LifeOS Free
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
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    justifyContent: 'space-between',
  },
  brandSection: {
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  navSection: {
    flex: 1,
    gap: 4,
  },
  navCategoryTitle: {
    fontSize: 10,
    letterSpacing: 1,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    position: 'relative',
  },
  navItemIcon: {
    marginRight: Spacing.md,
  },
  navItemText: {
    fontSize: 14,
    flex: 1,
  },
  activeIndicator: {
    position: 'absolute',
    right: 0,
    top: 8,
    bottom: 8,
    width: 3,
    borderRadius: 2,
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
    paddingVertical: 6,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: Radius.card,
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
