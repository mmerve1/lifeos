import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Modal,
} from 'react-native';
import { SlidersHorizontal, LogOut, CheckCircle2, Globe, Sun, Moon } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n';
import { Typography } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { AppTopBar } from '../components/dashboard/AppTopBar';
import { ProgressCard } from '../components/dashboard/ProgressCard';
import { StatCard } from '../components/dashboard/StatCard';
import { AgendaItem } from '../components/dashboard/AgendaItem';
import { ModuleCard } from '../components/dashboard/ModuleCard';
import { BottomNavigation } from '../components/dashboard/BottomNavigation';
import { EmptyState } from '../components/common/EmptyState';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { SecondaryButton } from '../components/common/SecondaryButton';
import {
  mockUser,
  mockModules,
} from '../data/mockData';
import { NavTabType, AgendaItemType, StatMetricType, ModuleItemType } from '../types';
import { useTaskStore } from '../store/useTaskStore';

interface DashboardScreenProps {
  userName?: string;
  onLogout: () => void;
  onNavigateToTasks?: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  userName = 'Merve',
  onLogout,
  onNavigateToTasks,
}) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { t, language, toggleLanguage } = useI18n();
  const { tasks, loadTasks, toggleTask, createTask, getStats } = useTaskStore();

  const [activeTab, setActiveTab] = useState<NavTabType>('home');
  const [showEmptyAgenda, setShowEmptyAgenda] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [activeModuleModal, setActiveModuleModal] = useState<string | null>(null);

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, []);

  // Convert tasks to AgendaItemType for existing AgendaItem component
  const agenda: AgendaItemType[] = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return tasks
      .filter((task) => task.dueDate === today)
      .sort((a, b) => (a.dueTime ?? '').localeCompare(b.dueTime ?? ''))
      .map((task) => ({
        id: task.id,
        time: task.dueTime ?? '—',
        title: task.title,
        module: task.category.charAt(0).toUpperCase() + task.category.slice(1),
        category: task.category,
        completed: task.status === 'completed',
      }));
  }, [tasks]);

  // Computed progress from real task data
  const taskStats = useMemo(() => getStats(), [tasks]);
  const progressPct = taskStats.total > 0
    ? Math.round((taskStats.completed / taskStats.total) * 100)
    : 0;

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 18) return t('goodAfternoon');
    return t('goodEvening');
  };

  // Localized stats — connected to real task store
  const localizedStats: StatMetricType[] = useMemo(() => [
    {
      id: 'tasks',
      label: t('tasksCompleted'),
      value: `${taskStats.completed}/${taskStats.total}`,
      subtitle: taskStats.total > 0
        ? `${progressPct}% ${t('tasksDoneRatio')}`
        : t('tasksSubtitle'),
      icon: 'CheckCircle2',
    },
    {
      id: 'goals',
      label: t('activeGoals'),
      value: String(taskStats.active),
      subtitle: t('goalsSubtitle'),
      icon: 'Target',
    },
  ], [language, tasks]);

  // Localized modules list
  const localizedModules: ModuleItemType[] = useMemo(() => [
    {
      id: 'career',
      name: t('moduleCareer'),
      description: t('moduleCareerDesc'),
      category: 'career',
      iconName: 'Briefcase',
      badge: language === 'tr' ? '1 aktif' : '1 active',
    },
    {
      id: 'academic',
      name: t('moduleAcademic'),
      description: t('moduleAcademicDesc'),
      category: 'academic',
      iconName: 'GraduationCap',
    },
    {
      id: 'finance',
      name: t('moduleFinance'),
      description: t('moduleFinanceDesc'),
      category: 'finance',
      iconName: 'Wallet',
    },
    {
      id: 'health',
      name: t('moduleHealth'),
      description: t('moduleHealthDesc'),
      category: 'health',
      iconName: 'HeartPulse',
      badge: language === 'tr' ? 'Seri: 6 gün' : 'Streak: 6d',
    },
    {
      id: 'learning',
      name: t('moduleLearning'),
      description: t('moduleLearningDesc'),
      category: 'learning',
      iconName: 'BookOpen',
    },
    {
      id: 'social',
      name: t('moduleSocial'),
      description: t('moduleSocialDesc'),
      category: 'social',
      iconName: 'Users',
    },
    {
      id: 'personal',
      name: t('modulePersonal'),
      description: t('modulePersonalDesc'),
      category: 'personal',
      iconName: 'Compass',
    },
    {
      id: 'ai',
      name: t('moduleAI'),
      description: t('moduleAIDesc'),
      category: 'ai',
      iconName: 'Sparkles',
      badge: 'Beta',
    },
  ], [language]);

  const handleToggleAgenda = (id: string) => {
    toggleTask(id);
  };

  const handleNotificationPress = () => {
    Alert.alert(
      language === 'tr' ? 'Bildirim Merkezi' : 'Notification Center',
      language === 'tr'
        ? '2 bekleyen bildiriminiz var:\n• 11:00 Proje geliştirme görevi yaklaşıyor\n• Haftalık hedef değerlendirme hatırlatması'
        : 'You have 2 pending items:\n• 11:00 Project development coming up\n• Weekly goal review reminder'
    );
  };

  const handleModulePress = (moduleId: string) => {
    if (moduleId === 'personal' && onNavigateToTasks) {
      onNavigateToTasks();
      return;
    }
    const mod = localizedModules.find((m) => m.id === moduleId);
    setActiveModuleModal(mod ? mod.name : moduleId);
  };

  const handleAddSampleTask = () => {
    if (onNavigateToTasks) {
      onNavigateToTasks();
      return;
    }
    createTask({
      title: language === 'tr' ? 'Akşam antrenmanı ve gün sonu değerlendirmesi' : 'Evening workout & reflection',
      priority: 'medium',
      category: 'health',
      dueDate: new Date().toISOString().split('T')[0],
      dueTime: '18:00',
    });
    setShowEmptyAgenda(false);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top App Bar with Theme Toggle */}
        <AppTopBar
          user={{ ...mockUser, name: userName }}
          notificationCount={2}
          onNotificationPress={handleNotificationPress}
          onAvatarPress={() => setProfileModalVisible(true)}
        />

        {/* Welcome Header */}
        <View style={styles.welcomeSection}>
          <Text style={[Typography.pageTitle, styles.welcomeTitle, { color: colors.textPrimary }]}>
            {getGreeting()}, {userName}!
          </Text>
          <Text style={[Typography.body, { color: colors.textSecondary }]}>
            {t('letsMakeCount')}
          </Text>
        </View>

        {/* Weekly Progress Card */}
        <ProgressCard
          progress={{
            percentage: progressPct,
            message: t('progressMessage'),
            tasksCompleted: taskStats.completed,
            tasksTotal: taskStats.total,
            activeGoals: taskStats.active,
          }}
          onPress={() => {
            Alert.alert(
              language === 'tr' ? 'Haftalık İlerleme Detayı' : 'Weekly Progress Details',
              language === 'tr'
                ? `Mevcut İlerleme: %${progressPct}\nTamamlanan: ${taskStats.completed}/${taskStats.total}\nAktif Görev: ${taskStats.active}\n\nTamamen gerçek hedef ve görev verilerinizden hesaplanmaktadır.`
                : `Current Completion: ${progressPct}%\nTasks Done: ${taskStats.completed}/${taskStats.total}\nActive Tasks: ${taskStats.active}\n\nCalculated strictly from defined goals and completed tasks.`
            );
          }}
        />

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          {localizedStats.map((stat) => (
            <StatCard
              key={stat.id}
              item={stat}
              onPress={() => {
                Alert.alert(
                  stat.label,
                  `${stat.label}: ${stat.value} (${stat.subtitle})`
                );
              }}
            />
          ))}
        </View>

        {/* Today's Agenda Section */}
        <View style={styles.sectionHeader}>
          <Text style={[Typography.sectionTitle, { color: colors.textPrimary }]}>
            {t('todaysAgenda')}
          </Text>
          <View style={styles.headerRightActions}>
            {/* Dev toggle to inspect empty state */}
            <Pressable
              onPress={() => setShowEmptyAgenda(!showEmptyAgenda)}
              style={[styles.filterPill, { backgroundColor: colors.surface, borderColor: colors.border }]}
              hitSlop={6}
            >
              <SlidersHorizontal size={12} color={colors.textSecondary} />
              <Text style={[Typography.caption, { color: colors.textSecondary, fontSize: 11 }]}>
                {showEmptyAgenda ? t('showData') : t('testEmpty')}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                if (onNavigateToTasks) {
                  onNavigateToTasks();
                } else {
                  Alert.alert(
                    t('todaysAgenda'),
                    language === 'tr'
                      ? 'Bugün için planlanan tüm görev ve etkinliklerin kronolojik listesi.'
                      : 'Chronological view of all tasks and events scheduled for today.'
                  );
                }
              }}
              hitSlop={8}
            >
              <Text style={[Typography.captionBold, { color: colors.primary }]}>
                {t('viewAll')}
              </Text>
            </Pressable>
          </View>
        </View>

        {showEmptyAgenda || agenda.length === 0 ? (
          <EmptyState
            title={t('emptyAgendaTitle')}
            description={t('emptyAgendaDesc')}
            actionLabel={t('addFirstTask')}
            onAction={handleAddSampleTask}
          />
        ) : (
          agenda.map((item) => (
            <AgendaItem
              key={item.id}
              item={item}
              onToggle={handleToggleAgenda}
              onPress={(id) => {
                Alert.alert(t('todaysAgenda'), `${item.title} (${item.module})`);
              }}
            />
          ))
        )}

        {/* Your Spaces (Modules) Section */}
        <View style={[styles.sectionHeader, { marginTop: Spacing.xl }]}>
          <Text style={[Typography.sectionTitle, { color: colors.textPrimary }]}>
            {t('yourSpaces')}
          </Text>
          <Text style={[Typography.caption, { color: colors.textSecondary }]}>
            {t('spacesSubtitle')}
          </Text>
        </View>

        {localizedModules.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            onPress={handleModulePress}
          />
        ))}

        {/* Bottom padding so content is not obscured */}
        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      {/* Profile & Settings Modal */}
      <Modal
        visible={profileModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
            ]}
          >
            <View style={styles.profileHeader}>
              <View
                style={[
                  styles.modalAvatarCircle,
                  { backgroundColor: colors.surface, borderColor: colors.primary },
                ]}
              >
                <Text style={[styles.modalAvatarText, { color: colors.secondaryViolet }]}>
                  {userName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={[Typography.cardTitle, styles.modalName, { color: colors.textPrimary }]}>
                {userName}
              </Text>
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                {mockUser.email}
              </Text>
            </View>

            <View style={[styles.modalDivider, { backgroundColor: colors.border }]} />

            {/* Quick Preference: Language Switcher */}
            <View style={styles.modalSettingRow}>
              <View style={styles.settingLabelGroup}>
                <Globe size={18} color={colors.textSecondary} />
                <Text style={[Typography.body, { color: colors.textPrimary }]}>
                  {t('languageSetting')}
                </Text>
              </View>
              <Pressable
                onPress={toggleLanguage}
                style={[styles.modalTogglePill, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <Text style={[Typography.captionBold, { color: colors.primary }]}>
                  {language === 'tr' ? '🇹🇷 Türkçe' : '🇬🇧 English'}
                </Text>
              </Pressable>
            </View>

            {/* Quick Preference: Theme Switcher */}
            <View style={styles.modalSettingRow}>
              <View style={styles.settingLabelGroup}>
                {isDark ? (
                  <Moon size={18} color={colors.textSecondary} />
                ) : (
                  <Sun size={18} color={colors.warning} />
                )}
                <Text style={[Typography.body, { color: colors.textPrimary }]}>
                  {t('themeSetting')}
                </Text>
              </View>
              <Pressable
                onPress={toggleTheme}
                style={[styles.modalTogglePill, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <Text style={[Typography.captionBold, { color: colors.primary }]}>
                  {isDark ? t('darkMode') : t('lightMode')}
                </Text>
              </Pressable>
            </View>

            <View style={[styles.modalDivider, { backgroundColor: colors.border, marginTop: Spacing.md }]} />

            <View style={styles.modalInfoRow}>
              <Text style={[Typography.body, { color: colors.textSecondary }]}>
                {t('platformVersion')}
              </Text>
              <Text style={[Typography.captionBold, { color: colors.textPrimary }]}>
                LifeOS v1.0 (MVP)
              </Text>
            </View>

            <View style={styles.modalActions}>
              <SecondaryButton
                label={t('logout')}
                icon={<LogOut size={16} color={colors.danger} />}
                textStyle={{ color: colors.danger }}
                onPress={() => {
                  setProfileModalVisible(false);
                  onLogout();
                }}
              />
              <PrimaryButton
                label={t('close')}
                onPress={() => setProfileModalVisible(false)}
                style={{ marginTop: Spacing.sm }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Module Detail Sheet Modal */}
      <Modal
        visible={!!activeModuleModal}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModuleModal(null)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
            ]}
          >
            <View style={styles.moduleModalHeader}>
              <CheckCircle2 size={24} color={colors.primary} />
              <Text style={[Typography.cardTitle, { color: colors.textPrimary }]}>
                {activeModuleModal}
              </Text>
            </View>

            <Text style={[Typography.body, { color: colors.textSecondary, lineHeight: 20 }]}>
              {language === 'tr'
                ? `Bu alan, ${activeModuleModal} modülüne özel iş kurallarını, veritabanı kayıtlarını ve bileşenleri barındıracaktır. Clean Architecture & .NET 10 Web API uçları bu modüle bağlanacaktır.`
                : `This space will host modular business rules, data sets, and views for ${activeModuleModal}. Clean Architecture & .NET 10 API endpoints will bind to this hub.`}
            </Text>

            <PrimaryButton
              label={language === 'tr' ? 'Tamam' : 'Understood'}
              onPress={() => setActiveModuleModal(null)}
              style={{ marginTop: Spacing.lg }}
            />
          </View>
        </View>
      </Modal>

      {/* Fixed Bottom Navigation (5 items) */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'tasks' && onNavigateToTasks) {
            onNavigateToTasks();
            return;
          }
          setActiveTab(tab);
          if (tab !== 'home') {
            Alert.alert(
              tab.charAt(0).toUpperCase() + tab.slice(1),
              language === 'tr'
                ? `${t(('nav' + tab.charAt(0).toUpperCase() + tab.slice(1)) as any)} görünümüne geçiliyor. MVP sürümünde Ana Sayfa ana merkezdir.`
                : `Navigating to the ${tab} view. In this MVP release, Main Dashboard is the primary interactive hub.`
            );
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.xl,
  },
  welcomeSection: {
    marginBottom: Spacing.lg,
  },
  welcomeTitle: {
    marginBottom: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.screenPadding,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderWidth: 1,
    borderRadius: Radius.modal,
    padding: Spacing.xl,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalAvatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  modalAvatarText: {
    fontSize: 24,
    fontWeight: '700',
  },
  modalName: {
    marginBottom: 2,
  },
  modalDivider: {
    height: 1,
    marginBottom: Spacing.md,
  },
  modalSettingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs + 2,
    marginBottom: Spacing.xs,
  },
  settingLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  modalTogglePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  modalActions: {
    marginTop: Spacing.md,
  },
  moduleModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
});
