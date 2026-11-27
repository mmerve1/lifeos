import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Modal,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { LogOut, CheckCircle2, Globe, Sun, Moon, Check, Plus } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n';
import { Typography } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { AppTopBar } from '../components/dashboard/AppTopBar';
import { ModuleCard } from '../components/dashboard/ModuleCard';
import { BottomNavigation } from '../components/dashboard/BottomNavigation';
import { LifeOrbit } from '../components/dashboard/LifeOrbit';
import { AssistantBanner } from '../components/dashboard/AssistantBanner';
import { FadeRiseView } from '../components/common/FadeRiseView';
import { EmptyState } from '../components/common/EmptyState';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { SecondaryButton } from '../components/common/SecondaryButton';
import { mockUser } from '../data/mockData';
import { NavTabType, AgendaItemType, ModuleItemType } from '../types';
import { useTaskStore } from '../store/useTaskStore';
import { useLifeProfileStore } from '../store/useLifeProfileStore';
import { useResponsive } from '../hooks/useResponsive';
import { WebSidebar } from '../components/web/WebSidebar';

interface DashboardScreenProps {
  userName?: string;
  onLogout: () => void;
  onNavigateToTasks?: () => void;
  onNavigateToNewTask?: () => void;
  onNavigateToCalendar?: () => void;
  onNavigateToHabits?: () => void;
  onNavigateToMentor?: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToOnboarding?: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  userName = 'Merve',
  onLogout,
  onNavigateToTasks,
  onNavigateToNewTask,
  onNavigateToCalendar,
  onNavigateToHabits,
  onNavigateToMentor,
  onNavigateToProfile,
  onNavigateToOnboarding,
}) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { t, language, toggleLanguage } = useI18n();
  const { tasks, loadTasks, toggleTask, createTask, getStats } = useTaskStore();
  const { profile, loadProfile } = useLifeProfileStore();
  const { isWideScreen } = useResponsive();

  const [activeTab, setActiveTab] = useState<NavTabType>('home');
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [activeModuleModal, setActiveModuleModal] = useState<string | null>(null);

  // Pulsing ping dot animation
  const pingScale = useRef(new Animated.Value(1)).current;
  const pingOpacity = useRef(new Animated.Value(0.75)).current;

  useEffect(() => {
    loadTasks();
    loadProfile();
  }, [loadTasks, loadProfile]);

  useEffect(() => {
    const useNativeDriver = Platform.OS !== 'web';
    const loop = Animated.loop(
      Animated.parallel([
        Animated.timing(pingScale, {
          toValue: 2.6,
          duration: 1800,
          easing: Easing.out(Easing.ease),
          useNativeDriver,
        }),
        Animated.timing(pingOpacity, {
          toValue: 0,
          duration: 1800,
          easing: Easing.out(Easing.ease),
          useNativeDriver,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pingScale, pingOpacity]);

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

  const taskStats = useMemo(() => getStats(), [tasks, getStats]);
  const remainingCount = Math.max(0, taskStats.total - taskStats.completed);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 18) return t('goodAfternoon');
    return t('goodEvening');
  };

  const formattedDate = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(language === 'tr' ? 'tr-TR' : 'en-US', {
        day: 'numeric',
        month: 'long',
        weekday: 'long',
      }).format(new Date());
    } catch {
      return new Date().toDateString();
    }
  }, [language]);

  const headlineSuffix = useMemo(() => {
    if (taskStats.total === 0) {
      return language === 'tr' ? 'bugün ajandan boş.' : 'your agenda is clear.';
    }
    if (remainingCount === 0) {
      return language === 'tr' ? 'plan tamam.' : 'all done today.';
    }
    return language === 'tr'
      ? `bugün ${remainingCount} işin kaldı.`
      : `${remainingCount} tasks left today.`;
  }, [language, remainingCount, taskStats.total]);

  const localizedModules: ModuleItemType[] = useMemo(() => {
    const base: ModuleItemType[] = [
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
    ];

    if (!profile?.focusAreas?.length) return base;
    const focusSet = new Set(profile.focusAreas);
    return base
      .map((m) =>
        focusSet.has(m.category)
          ? { ...m, badge: language === 'tr' ? 'Öncelikli' : 'Priority' }
          : m
      )
      .sort((a, b) => (focusSet.has(b.category) ? 1 : 0) - (focusSet.has(a.category) ? 1 : 0));
  }, [language, t, profile]);

  const handleModulePress = (moduleId: string) => {
    if (moduleId === 'personal' && onNavigateToTasks) {
      onNavigateToTasks();
      return;
    }
    if (moduleId === 'health' && onNavigateToHabits) {
      onNavigateToHabits();
      return;
    }
    if (moduleId === 'ai' && onNavigateToMentor) {
      onNavigateToMentor();
      return;
    }
    const mod = localizedModules.find((m) => m.id === moduleId);
    setActiveModuleModal(mod ? mod.name : moduleId);
  };

  const handleQuickAdd = () => {
    if (onNavigateToNewTask) {
      onNavigateToNewTask();
      return;
    }
    if (onNavigateToTasks) {
      onNavigateToTasks();
      return;
    }
    createTask({
      title: language === 'tr' ? 'Akşam yürüyüşü' : 'Evening walk',
      priority: 'medium',
      category: 'health',
      dueDate: new Date().toISOString().split('T')[0],
      dueTime: '18:00',
    });
  };

  const handleNotificationPress = () => {
    Alert.alert(
      language === 'tr' ? 'Bildirim Merkezi' : 'Notification Center',
      language === 'tr'
        ? '2 bekleyen bildiriminiz var:\n• 11:00 Proje geliştirme görevi yaklaşıyor\n• Haftalık hedef değerlendirme hatırlatması'
        : 'You have 2 pending items:\n• 11:00 Project development coming up\n• Weekly goal review reminder'
    );
  };

  return (
    <View style={[styles.root, isWideScreen && styles.rootWide, { backgroundColor: colors.background }]}>
      {isWideScreen && (
        <WebSidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            if (tab === 'tasks' && onNavigateToTasks) {
              onNavigateToTasks();
              return;
            }
            if (tab === 'calendar' && onNavigateToCalendar) {
              onNavigateToCalendar();
              return;
            }
            if (tab === 'habits' && onNavigateToHabits) {
              onNavigateToHabits();
              return;
            }
            if (tab === 'ai' && onNavigateToMentor) {
              onNavigateToMentor();
              return;
            }
            if (tab === 'profile') {
              if (onNavigateToProfile) onNavigateToProfile();
              else setProfileModalVisible(true);
              return;
            }
            setActiveTab(tab);
          }}
          onLogout={onLogout}
          userName={userName}
        />
      )}

      <View style={styles.mainContentArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, isWideScreen && styles.scrollContentWide]}
          showsVerticalScrollIndicator={false}
        >
          {!isWideScreen && (
            <AppTopBar
              user={{ ...mockUser, name: userName }}
              notificationCount={2}
              onNotificationPress={handleNotificationPress}
              onAvatarPress={() => setProfileModalVisible(true)}
            />
          )}

          {/* Header */}
          <FadeRiseView delay={0} style={styles.heroHeader}>
            <View style={styles.heroHeaderText}>
              <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                {formattedDate}
              </Text>
              <Text
                style={[
                  isWideScreen ? styles.heroTitleDesktop : styles.heroTitleMobile,
                  { color: colors.textPrimary },
                ]}
              >
                {getGreeting()} {userName}, {headlineSuffix}
              </Text>
            </View>

            <Pressable
              onPress={handleQuickAdd}
              style={({ pressed }) => [
                styles.quickCapturePill,
                {
                  backgroundColor: isDark ? '#F3F2FF' : '#14173A',
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Plus size={16} color={isDark ? '#0E1029' : '#FFFFFF'} strokeWidth={2.5} />
              <Text style={[styles.quickCaptureText, { color: isDark ? '#0E1029' : '#FFFFFF' }]}>
                {language === 'tr' ? 'Hızlı yakala' : 'Quick capture'}
              </Text>
            </Pressable>
          </FadeRiseView>

          {/* Main Split: Günün Akışı + Yaşam Yörüngen */}
          <View style={[styles.primarySplit, isWideScreen && styles.primarySplitWide]}>
            {/* Left Panel: Today's Flow */}
            <FadeRiseView
              delay={80}
              style={[
                styles.glassPanel,
                isWideScreen && styles.flowPanelWide,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={styles.panelHeaderRow}>
                <Text style={[styles.panelTitle, { color: colors.textPrimary }]}>
                  {language === 'tr' ? 'Günün akışı' : "Today's flow"}
                </Text>
                <Pressable onPress={onNavigateToTasks} hitSlop={8}>
                  <Text style={[Typography.captionBold, { color: colors.primary }]}>
                    {t('viewAll')}
                  </Text>
                </Pressable>
              </View>

              {agenda.length === 0 ? (
                <EmptyState
                  title={t('emptyAgendaTitle')}
                  description={t('emptyAgendaDesc')}
                  actionLabel={t('addFirstTask')}
                  onAction={handleQuickAdd}
                />
              ) : (
                <View style={styles.flowList}>
                  {agenda.map((item) => {
                    const modColor = colors.modules[item.category] || colors.primary;
                    return (
                      <Pressable
                        key={item.id}
                        onPress={() => toggleTask(item.id)}
                        style={({ pressed }) => [
                          styles.flowItem,
                          {
                            backgroundColor: colors.surfaceElevated,
                            opacity: item.completed ? 0.72 : pressed ? 0.9 : 1,
                            transform: [{ scale: item.completed ? 0.985 : 1 }],
                          },
                        ]}
                      >
                        <Text style={[styles.flowTime, { color: colors.textSecondary }]}>
                          {item.time}
                        </Text>

                        <View
                          style={[
                            styles.flowCircleCheck,
                            {
                              borderColor: modColor,
                              backgroundColor: item.completed ? modColor : 'transparent',
                            },
                          ]}
                        >
                          {item.completed && <Check size={14} color="#0E1029" strokeWidth={3} />}
                        </View>

                        <View style={styles.flowTextCol}>
                          <Text
                            style={[
                              styles.flowItemTitle,
                              { color: colors.textPrimary },
                              item.completed && styles.flowItemDone,
                            ]}
                            numberOfLines={1}
                          >
                            {item.title}
                          </Text>
                          <Text style={[styles.flowItemCategory, { color: modColor }]}>
                            {item.module}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              )}

              {/* Pulsing ping helper footer */}
              <View style={styles.pingFooter}>
                <View style={styles.pingDotWrap}>
                  <Animated.View
                    style={[
                      styles.pingRing,
                      {
                        backgroundColor: colors.danger,
                        opacity: pingOpacity,
                        transform: [{ scale: pingScale }],
                      },
                    ]}
                  />
                  <View style={[styles.pingDot, { backgroundColor: colors.danger }]} />
                </View>
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                  {language === 'tr'
                    ? 'Dokunarak tamamla; yörünge anında güncellenir'
                    : 'Tap to complete; your orbit updates live'}
                </Text>
              </View>
            </FadeRiseView>

            {/* Right Panel: Animated Life Orbit */}
            <FadeRiseView
              delay={160}
              style={[
                styles.glassPanel,
                isWideScreen && styles.orbitPanelWide,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.panelTitle, { color: colors.textPrimary, marginBottom: 8 }]}>
                {language === 'tr' ? 'Yaşam yörüngen' : 'Your life orbit'}
              </Text>
              <LifeOrbit
                completed={taskStats.completed}
                total={taskStats.total}
                onSelectModule={handleModulePress}
              />
            </FadeRiseView>
          </View>

          {/* Animated AI Assistant Suggestion Banner */}
          <FadeRiseView delay={240}>
            <AssistantBanner
              profile={profile}
              onOpenOnboarding={onNavigateToOnboarding}
            />
          </FadeRiseView>

          {/* Your Spaces (Modules) Section */}
          <FadeRiseView delay={300}>
            <View style={styles.sectionHeader}>
              <Text style={[Typography.sectionTitle, { color: colors.textPrimary }]}>
                {t('yourSpaces')}
              </Text>
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                {t('spacesSubtitle')}
              </Text>
            </View>

            <View style={isWideScreen ? styles.modulesGridWide : undefined}>
              {localizedModules.map((module) => (
                <View key={module.id} style={isWideScreen ? styles.moduleGridItemWide : undefined}>
                  <ModuleCard module={module} onPress={handleModulePress} />
                </View>
              ))}
            </View>
          </FadeRiseView>

          <View style={{ height: Spacing.xxxl }} />
        </ScrollView>

        {!isWideScreen && (
          <BottomNavigation
            activeTab={activeTab}
            onQuickAdd={handleQuickAdd}
            onTabChange={(tab) => {
              if (tab === 'tasks' && onNavigateToTasks) {
                onNavigateToTasks();
                return;
              }
              if (tab === 'calendar' && onNavigateToCalendar) {
                onNavigateToCalendar();
                return;
              }
              if (tab === 'ai' && onNavigateToMentor) {
                onNavigateToMentor();
                return;
              }
              if (tab === 'profile') {
                if (onNavigateToProfile) onNavigateToProfile();
                else setProfileModalVisible(true);
                return;
              }
              setActiveTab(tab);
            }}
          />
        )}
      </View>

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
                  { backgroundColor: colors.surfaceSubtle, borderColor: colors.primary },
                ]}
              >
                <Text style={[styles.modalAvatarText, { color: colors.primary }]}>
                  {userName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={[Typography.sectionTitle, { color: colors.textPrimary }]}>{userName}</Text>
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                {mockUser.email}
              </Text>
            </View>

            <View style={[styles.modalDivider, { backgroundColor: colors.border }]} />

            <View style={styles.settingRow}>
              <View style={styles.settingLabelGroup}>
                {isDark ? <Moon size={16} color={colors.primary} /> : <Sun size={16} color={colors.warning} />}
                <Text style={[Typography.body, { color: colors.textPrimary }]}>{t('themeSetting')}</Text>
              </View>
              <Pressable
                onPress={toggleTheme}
                style={[styles.toggleChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <Text style={[Typography.captionBold, { color: colors.primary }]}>
                  {isDark ? t('darkMode') : t('lightMode')}
                </Text>
              </Pressable>
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingLabelGroup}>
                <Globe size={16} color={colors.secondaryViolet} />
                <Text style={[Typography.body, { color: colors.textPrimary }]}>{t('languageSetting')}</Text>
              </View>
              <Pressable
                onPress={toggleLanguage}
                style={[styles.toggleChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <Text style={[Typography.captionBold, { color: colors.primary }]}>
                  {language === 'tr' ? t('turkish') : t('english')}
                </Text>
              </Pressable>
            </View>

            <View style={styles.modalActions}>
              {onNavigateToOnboarding && (
                <SecondaryButton
                  label={language === 'tr' ? 'Yaşam Profilini Güncelle' : 'Update Life Profile'}
                  onPress={() => {
                    setProfileModalVisible(false);
                    onNavigateToOnboarding();
                  }}
                  style={{ marginBottom: Spacing.sm }}
                />
              )}
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

      {/* Module Detail Modal */}
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
                ? `${activeModuleModal} modülü yakında kendi veritabanı tabloları ve .NET 8 Web API uçlarıyla aktif olacak.`
                : `The ${activeModuleModal} module will soon connect to dedicated PostgreSQL tables and .NET 8 Web API endpoints.`}
            </Text>

            <PrimaryButton
              label={language === 'tr' ? 'Tamam' : 'Understood'}
              onPress={() => setActiveModuleModal(null)}
              style={{ marginTop: Spacing.lg }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  rootWide: {
    flexDirection: 'row',
  },
  mainContentArea: {
    flex: 1,
    height: '100%',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.lg,
  },
  scrollContentWide: {
    paddingHorizontal: 32,
    paddingTop: 28,
    maxWidth: 1180,
    width: '100%',
    alignSelf: 'center',
  },
  heroHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 14,
    marginBottom: 22,
  },
  heroHeaderText: {
    flex: 1,
    minWidth: 240,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  heroTitleDesktop: {
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  heroTitleMobile: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  quickCapturePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: Radius.pill,
  },
  quickCaptureText: {
    fontSize: 14,
    fontWeight: '700',
  },
  primarySplit: {
    flexDirection: 'column',
    gap: 20,
  },
  primarySplitWide: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  glassPanel: {
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
  },
  flowPanelWide: {
    flex: 1.15,
  },
  orbitPanelWide: {
    flex: 0.95,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  panelHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  flowList: {
    gap: 10,
  },
  flowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
  },
  flowTime: {
    width: 44,
    fontSize: 13,
    fontWeight: '600',
  },
  flowCircleCheck: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowTextCol: {
    flex: 1,
    gap: 2,
  },
  flowItemTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  flowItemDone: {
    textDecorationLine: 'line-through',
  },
  flowItemCategory: {
    fontSize: 12,
    fontWeight: '600',
  },
  pingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 14,
    paddingHorizontal: 6,
  },
  pingDotWrap: {
    width: 10,
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pingRing: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  modulesGridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moduleGridItemWide: {
    width: '49%',
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
  modalDivider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  settingLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  toggleChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  modalActions: {
    marginTop: Spacing.lg,
  },
  moduleModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
});
