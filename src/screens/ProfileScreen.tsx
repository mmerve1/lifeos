import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Switch,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {
  Sparkles,
  CheckCircle2,
  Flame,
  Target,
  Brain,
  ShieldCheck,
  Sun,
  Moon,
  Globe,
  LogOut,
  Save,
  Compass,
  Clock,
  MessageCircle,
  RefreshCw,
  Edit3,
  Check,
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n';
import { Typography } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { useResponsive } from '../hooks/useResponsive';
import { WebSidebar } from '../components/web/WebSidebar';
import { BottomNavigation } from '../components/dashboard/BottomNavigation';
import { FadeRiseView } from '../components/common/FadeRiseView';
import { useAuthStore } from '../store/useAuthStore';
import { useLifeProfileStore } from '../store/useLifeProfileStore';
import { useTaskStore } from '../store/useTaskStore';
import { useHabitStore } from '../store/useHabitStore';
import { mentorApi } from '../api/mentorApi';
import { MentorPermissions } from '../types/mentor';
import { ModuleCategory, NavTabType } from '../types';

interface ProfileScreenProps {
  onNavigateToHome: () => void;
  onNavigateToTasks: () => void;
  onNavigateToCalendar: () => void;
  onNavigateToHabits: () => void;
  onNavigateToMentor: () => void;
  onNavigateToOnboarding: () => void;
  onLogout: () => void;
}

const LIFE_STAGES = [
  { key: 'student', tr: 'Öğrenci', en: 'Student' },
  { key: 'professional', tr: 'Çalışan', en: 'Professional' },
  { key: 'job_seeker', tr: 'İş Arayan', en: 'Job Seeker' },
  { key: 'entrepreneur', tr: 'Girişimci', en: 'Entrepreneur' },
  { key: 'balanced', tr: 'Dengeli Yaşam', en: 'Balanced Life' },
];

const FOCUS_AREAS: { key: ModuleCategory; tr: string; en: string; color: string }[] = [
  { key: 'career', tr: 'Kariyer', en: 'Career', color: '#FFB454' },
  { key: 'academic', tr: 'Akademik', en: 'Academic', color: '#5FD6E8' },
  { key: 'learning', tr: 'Öğrenme', en: 'Learning', color: '#8FA2FF' },
  { key: 'health', tr: 'Sağlık', en: 'Health', color: '#7BE3A1' },
  { key: 'finance', tr: 'Finans', en: 'Finance', color: '#C9A6FF' },
  { key: 'social', tr: 'Sosyal', en: 'Social', color: '#FF8FA3' },
  { key: 'personal', tr: 'Kişisel', en: 'Personal', color: '#F5E06B' },
];

const PEAK_TIMES = [
  { key: 'morning', tr: 'Sabah (06:00 – 12:00)', en: 'Morning (06:00 – 12:00)' },
  { key: 'afternoon', tr: 'Gündüz (12:00 – 18:00)', en: 'Afternoon (12:00 – 18:00)' },
  { key: 'evening', tr: 'Akşam / Gece (18:00 – 00:00)', en: 'Evening / Night (18:00 – 00:00)' },
];

const MENTOR_STYLES = [
  { key: 'supportive', tr: 'Destekleyici & Sakin', en: 'Supportive & Calm' },
  { key: 'direct', tr: 'Net & Disiplinli', en: 'Direct & Structured' },
  { key: 'concise', tr: 'Kısa & Öz', en: 'Short & Concise' },
];

const DEFAULT_PERMS: MentorPermissions = {
  allowCalendar: true,
  allowTasks: true,
  allowHabits: true,
  allowCareer: true,
  allowFinance: false,
  allowHealth: false,
};

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onNavigateToHome,
  onNavigateToTasks,
  onNavigateToCalendar,
  onNavigateToHabits,
  onNavigateToMentor,
  onNavigateToOnboarding,
  onLogout,
}) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useI18n();
  const { isWideScreen } = useResponsive();
  const isTr = language === 'tr';

  const { user, updateAccountName } = useAuthStore();
  const { profile, loadProfile, saveOnboarding } = useLifeProfileStore();
  const { tasks, loadTasks } = useTaskStore();
  const { habits, goals, loadAll: loadHabitsAndGoals } = useHabitStore();

  // Account name editing
  const [editingName, setEditingName] = useState(false);
  const [fullNameInput, setFullNameInput] = useState(user?.name || 'Merve');
  const [savingName, setSavingName] = useState(false);
  const [nameSavedFeedback, setNameSavedFeedback] = useState(false);

  // Life profile inline editing
  const [lifeStage, setLifeStage] = useState('balanced');
  const [focusAreas, setFocusAreas] = useState<ModuleCategory[]>(['career', 'learning']);
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [peakTime, setPeakTime] = useState('evening');
  const [mentorStyle, setMentorStyle] = useState('supportive');
  const [savingLife, setSavingLife] = useState(false);
  const [lifeSavedFeedback, setLifeSavedFeedback] = useState(false);

  // Mentor permissions & memory count
  const [permissions, setPermissions] = useState<MentorPermissions>(DEFAULT_PERMS);
  const [memoryCount, setMemoryCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
    loadTasks();
    loadHabitsAndGoals();
    Promise.all([mentorApi.getPermissions(), mentorApi.getMemories()])
      .then(([perms, mems]) => {
        setPermissions(perms);
        setMemoryCount(mems.length);
      })
      .catch(() => {});
  }, [loadProfile, loadTasks, loadHabitsAndGoals]);

  useEffect(() => {
    if (user?.name) setFullNameInput(user.name);
  }, [user?.name]);

  useEffect(() => {
    if (profile) {
      setLifeStage(profile.lifeStage || 'balanced');
      setFocusAreas(profile.focusAreas?.length ? profile.focusAreas : ['career', 'learning']);
      setPrimaryGoal(profile.primaryGoal || '');
      setPeakTime(profile.peakTime || 'evening');
      setMentorStyle(profile.mentorStyle || 'supportive');
    }
  }, [profile]);

  const stats = useMemo(() => {
    const completedTasks = tasks.filter((t) => t.status === 'completed').length;
    const totalTasks = tasks.length;
    const taskRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const bestStreak = habits.reduce(
      (max, h) => Math.max(max, h.completedDates?.length || 0),
      0
    );
    const avgGoalProgress =
      goals.length > 0
        ? Math.round(
            goals.reduce(
              (sum, g) =>
                sum + Math.min(100, (g.currentCount / Math.max(1, g.targetCount)) * 100),
              0
            ) / goals.length
          )
        : 0;

    const activePermsCount = Object.values(permissions).filter(Boolean).length;

    return {
      completedTasks,
      totalTasks,
      taskRate,
      habitCount: habits.length,
      bestStreak,
      goalCount: goals.length,
      avgGoalProgress,
      activePermsCount,
    };
  }, [tasks, habits, goals, permissions]);

  const handleSaveName = async () => {
    const trimmed = fullNameInput.trim();
    if (trimmed.length < 2) return;
    setSavingName(true);
    setErrorMsg(null);
    try {
      await updateAccountName(trimmed);
      setEditingName(false);
      setNameSavedFeedback(true);
      setTimeout(() => setNameSavedFeedback(false), 2500);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error');
    } finally {
      setSavingName(false);
    }
  };

  const handleToggleFocusArea = (area: ModuleCategory) => {
    setFocusAreas((prev) => {
      if (prev.includes(area)) {
        if (prev.length === 1) return prev;
        return prev.filter((a) => a !== area);
      }
      return [...prev, area];
    });
  };

  const handleSaveLifeProfile = async () => {
    setSavingLife(true);
    setErrorMsg(null);
    try {
      await saveOnboarding({
        lifeStage,
        focusAreas,
        primaryGoal: primaryGoal.trim(),
        peakTime,
        mentorStyle,
      });
      setLifeSavedFeedback(true);
      setTimeout(() => setLifeSavedFeedback(false), 2500);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error');
    } finally {
      setSavingLife(false);
    }
  };

  const handleTogglePerm = async (key: keyof MentorPermissions) => {
    const next = { ...permissions, [key]: !permissions[key] };
    setPermissions(next);
    try {
      const saved = await mentorApi.updatePermissions(next);
      setPermissions(saved);
    } catch {
      setPermissions(permissions);
    }
  };

  const handleNavTab = (tab: NavTabType) => {
    if (tab === 'home') onNavigateToHome();
    else if (tab === 'tasks') onNavigateToTasks();
    else if (tab === 'calendar') onNavigateToCalendar();
    else if (tab === 'habits') onNavigateToHabits();
    else if (tab === 'ai') onNavigateToMentor();
  };

  const displayName = user?.name || 'Merve';
  const displayEmail = user?.email || 'merve@lifeos.app';
  const displayInitials = user?.initials || displayName.slice(0, 2).toUpperCase();

  const stageLabel =
    LIFE_STAGES.find((s) => s.key === lifeStage)?.[isTr ? 'tr' : 'en'] ?? lifeStage;
  const peakLabel =
    PEAK_TIMES.find((p) => p.key === peakTime)?.[isTr ? 'tr' : 'en'] ?? peakTime;
  const styleLabel =
    MENTOR_STYLES.find((m) => m.key === mentorStyle)?.[isTr ? 'tr' : 'en'] ?? mentorStyle;

  const permissionItems: { key: keyof MentorPermissions; label: string; color: string }[] = [
    { key: 'allowTasks', label: isTr ? 'Görevler' : 'Tasks', color: '#8FA2FF' },
    { key: 'allowCalendar', label: isTr ? 'Takvim' : 'Calendar', color: '#5FD6E8' },
    { key: 'allowHabits', label: isTr ? 'Alışkanlıklar & Hedefler' : 'Habits & Goals', color: '#7BE3A1' },
    { key: 'allowCareer', label: isTr ? 'Kariyer' : 'Career', color: '#FFB454' },
    { key: 'allowFinance', label: isTr ? 'Finans' : 'Finance', color: '#C9A6FF' },
    { key: 'allowHealth', label: isTr ? 'Sağlık' : 'Health', color: '#FF8FA3' },
  ];

  return (
    <View style={[styles.root, isWideScreen && styles.rootWide, { backgroundColor: colors.background }]}>
      {isWideScreen && (
        <WebSidebar
          activeTab="profile"
          onTabChange={handleNavTab}
          onLogout={onLogout}
          userName={displayName}
        />
      )}

      <View style={styles.mainArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            isWideScreen && styles.scrollContentWide,
            !isWideScreen && { paddingTop: Platform.OS === 'ios' ? 54 : Spacing.lg, paddingBottom: 100 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Page Header */}
          <FadeRiseView delay={0} style={styles.pageHeader}>
            <View>
              <Text style={[Typography.captionBold, { color: colors.primary, letterSpacing: 0.6 }]}>
                LIFEOS · {isTr ? 'KİŞİSEL MERKEZ' : 'PERSONAL HUB'}
              </Text>
              <Text style={[Typography.h1, { color: colors.textPrimary, fontSize: 28, marginTop: 2 }]}>
                {isTr ? 'Profil & Tercihler' : 'Profile & Preferences'}
              </Text>
            </View>
            <View style={styles.headerActions}>
              <Pressable
                onPress={onNavigateToMentor}
                style={({ pressed }) => [
                  styles.headerPill,
                  { backgroundColor: colors.primary },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Sparkles size={15} color={colors.primaryText} />
                <Text style={[Typography.captionBold, { color: colors.primaryText }]}>
                  {isTr ? 'AI Mentor' : 'AI Mentor'}
                </Text>
              </Pressable>
              <Pressable
                onPress={onNavigateToOnboarding}
                style={({ pressed }) => [
                  styles.headerPill,
                  { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <RefreshCw size={14} color={colors.textPrimary} />
                <Text style={[Typography.captionBold, { color: colors.textPrimary }]}>
                  {isTr ? 'Tanışma Akışı' : 'Re-run Onboarding'}
                </Text>
              </Pressable>
            </View>
          </FadeRiseView>

          {errorMsg && (
            <View
              style={[
                styles.errorBanner,
                { backgroundColor: 'rgba(255, 143, 163, 0.14)', borderColor: colors.danger },
              ]}
            >
              <Text style={[Typography.caption, { color: colors.danger }]}>{errorMsg}</Text>
            </View>
          )}

          {/* Hero Identity Card */}
          <FadeRiseView delay={60}>
            <View
              style={[
                styles.heroCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={styles.heroLeft}>
                <View
                  style={[
                    styles.avatarRing,
                    {
                      borderColor: colors.primary,
                      backgroundColor: isDark ? 'rgba(143,162,255,0.16)' : 'rgba(99,102,241,0.12)',
                    },
                  ]}
                >
                  <Text style={[styles.avatarText, { color: colors.primary }]}>
                    {displayInitials}
                  </Text>
                </View>

                <View style={styles.heroIdentity}>
                  {editingName ? (
                    <View style={styles.nameEditRow}>
                      <TextInput
                        value={fullNameInput}
                        onChangeText={setFullNameInput}
                        style={[
                          styles.nameInput,
                          {
                            backgroundColor: colors.surfaceElevated,
                            borderColor: colors.primary,
                            color: colors.textPrimary,
                          },
                        ]}
                        autoFocus
                        onSubmitEditing={handleSaveName}
                      />
                      <Pressable
                        onPress={handleSaveName}
                        disabled={savingName}
                        style={[styles.iconSaveBtn, { backgroundColor: '#7BE3A1' }]}
                      >
                        {savingName ? (
                          <ActivityIndicator size="small" color="#0E1029" />
                        ) : (
                          <Check size={16} color="#0E1029" />
                        )}
                      </Pressable>
                    </View>
                  ) : (
                    <View style={styles.nameDisplayRow}>
                      <Text style={[Typography.h2, { color: colors.textPrimary, fontSize: 22 }]}>
                        {displayName}
                      </Text>
                      <Pressable
                        onPress={() => setEditingName(true)}
                        hitSlop={8}
                        style={[
                          styles.editNameBtn,
                          { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                        ]}
                      >
                        <Edit3 size={13} color={colors.textSecondary} />
                      </Pressable>
                      {nameSavedFeedback && (
                        <Text style={[Typography.captionBold, { color: '#7BE3A1', fontSize: 12 }]}>
                          {isTr ? 'Kaydedildi ✓' : 'Saved ✓'}
                        </Text>
                      )}
                    </View>
                  )}

                  <Text style={[Typography.body, { color: colors.textSecondary, fontSize: 14 }]}>
                    {displayEmail}
                  </Text>

                  <View style={styles.heroBadgesRow}>
                    <View style={[styles.metaChip, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                      <Compass size={12} color="#FFB454" />
                      <Text style={[Typography.captionBold, { color: colors.textPrimary, fontSize: 11 }]}>
                        {stageLabel}
                      </Text>
                    </View>
                    <View style={[styles.metaChip, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                      <Clock size={12} color="#5FD6E8" />
                      <Text style={[Typography.captionBold, { color: colors.textPrimary, fontSize: 11 }]}>
                        {peakLabel}
                      </Text>
                    </View>
                    <View style={[styles.metaChip, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                      <MessageCircle size={12} color="#C9A6FF" />
                      <Text style={[Typography.captionBold, { color: colors.textPrimary, fontSize: 11 }]}>
                        {styleLabel}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </FadeRiseView>

          {/* 4 Live Stat Cards */}
          <FadeRiseView delay={120}>
            <View style={[styles.statsGrid, isWideScreen && styles.statsGridWide]}>
              <Pressable
                onPress={onNavigateToTasks}
                style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={[styles.statIconWrap, { backgroundColor: 'rgba(143, 162, 255, 0.16)' }]}>
                  <CheckCircle2 size={18} color="#8FA2FF" />
                </View>
                <Text style={[Typography.h2, { color: colors.textPrimary, fontSize: 22 }]}>
                  {stats.completedTasks}/{stats.totalTasks}
                </Text>
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                  {isTr ? `Görev · %${stats.taskRate} tamamlandı` : `Tasks · ${stats.taskRate}% done`}
                </Text>
              </Pressable>

              <Pressable
                onPress={onNavigateToHabits}
                style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={[styles.statIconWrap, { backgroundColor: 'rgba(255, 180, 84, 0.16)' }]}>
                  <Flame size={18} color="#FFB454" />
                </View>
                <Text style={[Typography.h2, { color: colors.textPrimary, fontSize: 22 }]}>
                  {stats.bestStreak} {isTr ? 'gün' : 'd'}
                </Text>
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                  {isTr
                    ? `En iyi seri · ${stats.habitCount} alışkanlık`
                    : `Best streak · ${stats.habitCount} habits`}
                </Text>
              </Pressable>

              <Pressable
                onPress={onNavigateToHabits}
                style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={[styles.statIconWrap, { backgroundColor: 'rgba(123, 227, 161, 0.16)' }]}>
                  <Target size={18} color="#7BE3A1" />
                </View>
                <Text style={[Typography.h2, { color: colors.textPrimary, fontSize: 22 }]}>
                  %{stats.avgGoalProgress}
                </Text>
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                  {isTr
                    ? `${stats.goalCount} aktif hedef ortalaması`
                    : `Avg across ${stats.goalCount} goals`}
                </Text>
              </Pressable>

              <Pressable
                onPress={onNavigateToMentor}
                style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={[styles.statIconWrap, { backgroundColor: 'rgba(201, 166, 255, 0.16)' }]}>
                  <Brain size={18} color="#C9A6FF" />
                </View>
                <Text style={[Typography.h2, { color: colors.textPrimary, fontSize: 22 }]}>
                  {memoryCount}
                </Text>
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                  {isTr
                    ? `AI hafıza · ${stats.activePermsCount}/6 izin açık`
                    : `AI memories · ${stats.activePermsCount}/6 perms`}
                </Text>
              </Pressable>
            </View>
          </FadeRiseView>

          {/* Main 2-Column Content */}
          <View style={[styles.twoCol, isWideScreen && styles.twoColWide]}>
            {/* Left Column: Editable Life Profile */}
            <FadeRiseView delay={180} style={{ flex: 1.35 }}>
              <View
                style={[
                  styles.sectionCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <Compass size={18} color={colors.primary} />
                    <Text style={[Typography.h3, { color: colors.textPrimary }]}>
                      {isTr ? 'Yaşam Profilim & Odak Alanları' : 'Life Profile & Focus Areas'}
                    </Text>
                  </View>
                  {lifeSavedFeedback && (
                    <Text style={[Typography.captionBold, { color: '#7BE3A1', fontSize: 12 }]}>
                      {isTr ? 'Veritabanına kaydedildi ✓' : 'Saved to DB ✓'}
                    </Text>
                  )}
                </View>

                {/* Primary Goal */}
                <Text style={[Typography.captionBold, styles.fieldLabel, { color: colors.textSecondary }]}>
                  {isTr ? 'Ana Hedefim' : 'Primary Goal'}
                </Text>
                <TextInput
                  value={primaryGoal}
                  onChangeText={setPrimaryGoal}
                  placeholder={
                    isTr
                      ? 'Örn: Kariyerimde ilerlemek ve iş bulmak'
                      : 'e.g. Advance my career and land a great role'
                  }
                  placeholderTextColor={colors.textSecondary}
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                    },
                  ]}
                />

                {/* Life Stage */}
                <Text style={[Typography.captionBold, styles.fieldLabel, { color: colors.textSecondary }]}>
                  {isTr ? 'Yaşam Dönemi' : 'Life Stage'}
                </Text>
                <View style={styles.chipWrap}>
                  {LIFE_STAGES.map((st) => {
                    const active = lifeStage === st.key;
                    return (
                      <Pressable
                        key={st.key}
                        onPress={() => setLifeStage(st.key)}
                        style={[
                          styles.optionChip,
                          {
                            backgroundColor: active ? colors.primary : colors.surfaceElevated,
                            borderColor: active ? colors.primary : colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            Typography.captionBold,
                            { color: active ? colors.primaryText : colors.textPrimary, fontSize: 12 },
                          ]}
                        >
                          {isTr ? st.tr : st.en}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Focus Areas */}
                <Text style={[Typography.captionBold, styles.fieldLabel, { color: colors.textSecondary }]}>
                  {isTr ? 'Öncelikli Yaşam Alanları' : 'Priority Focus Areas'}
                </Text>
                <View style={styles.chipWrap}>
                  {FOCUS_AREAS.map((area) => {
                    const active = focusAreas.includes(area.key);
                    return (
                      <Pressable
                        key={area.key}
                        onPress={() => handleToggleFocusArea(area.key)}
                        style={[
                          styles.optionChip,
                          {
                            backgroundColor: active
                              ? area.color
                              : colors.surfaceElevated,
                            borderColor: active ? area.color : colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            Typography.captionBold,
                            {
                              color: active ? '#0E1029' : colors.textPrimary,
                              fontSize: 12,
                            },
                          ]}
                        >
                          {isTr ? area.tr : area.en}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Peak Time */}
                <Text style={[Typography.captionBold, styles.fieldLabel, { color: colors.textSecondary }]}>
                  {isTr ? 'En Verimli Zaman' : 'Peak Energy Window'}
                </Text>
                <View style={styles.chipWrap}>
                  {PEAK_TIMES.map((pt) => {
                    const active = peakTime === pt.key;
                    return (
                      <Pressable
                        key={pt.key}
                        onPress={() => setPeakTime(pt.key)}
                        style={[
                          styles.optionChip,
                          {
                            backgroundColor: active ? colors.primary : colors.surfaceElevated,
                            borderColor: active ? colors.primary : colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            Typography.captionBold,
                            { color: active ? colors.primaryText : colors.textPrimary, fontSize: 12 },
                          ]}
                        >
                          {isTr ? pt.tr : pt.en}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Mentor Style */}
                <Text style={[Typography.captionBold, styles.fieldLabel, { color: colors.textSecondary }]}>
                  {isTr ? 'AI Mentor İletişim Tonu' : 'AI Mentor Tone'}
                </Text>
                <View style={styles.chipWrap}>
                  {MENTOR_STYLES.map((ms) => {
                    const active = mentorStyle === ms.key;
                    return (
                      <Pressable
                        key={ms.key}
                        onPress={() => setMentorStyle(ms.key)}
                        style={[
                          styles.optionChip,
                          {
                            backgroundColor: active ? colors.primary : colors.surfaceElevated,
                            borderColor: active ? colors.primary : colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            Typography.captionBold,
                            { color: active ? colors.primaryText : colors.textPrimary, fontSize: 12 },
                          ]}
                        >
                          {isTr ? ms.tr : ms.en}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Pressable
                  onPress={handleSaveLifeProfile}
                  disabled={savingLife}
                  style={({ pressed }) => [
                    styles.saveProfileBtn,
                    { backgroundColor: colors.primary },
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  {savingLife ? (
                    <ActivityIndicator size="small" color={colors.primaryText} />
                  ) : (
                    <>
                      <Save size={16} color={colors.primaryText} />
                      <Text style={[Typography.bodyBold, { color: colors.primaryText, fontSize: 14 }]}>
                        {isTr ? 'Yaşam Profilini Kaydet' : 'Save Life Profile'}
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>
            </FadeRiseView>

            {/* Right Column: AI Permissions + App Settings */}
            <FadeRiseView delay={240} style={{ flex: 1, gap: Spacing.md }}>
              {/* AI Mentor Data Permissions */}
              <View
                style={[
                  styles.sectionCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <View style={styles.sectionTitleRow}>
                  <ShieldCheck size={18} color="#7BE3A1" />
                  <Text style={[Typography.h3, { color: colors.textPrimary }]}>
                    {isTr ? 'AI Mentor Veri İzinleri' : 'AI Mentor Data Access'}
                  </Text>
                </View>
                <Text
                  style={[
                    Typography.caption,
                    { color: colors.textSecondary, marginTop: 4, marginBottom: 12 },
                  ]}
                >
                  {isTr
                    ? 'Hangi yaşam alanlarının AI Mentor ile paylaşılacağını kontrol et.'
                    : 'Control which life areas your AI Mentor can read.'}
                </Text>

                <View style={{ gap: 8 }}>
                  {permissionItems.map((item) => (
                    <View
                      key={item.key}
                      style={[
                        styles.permRow,
                        { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                      ]}
                    >
                      <View style={[styles.permDot, { backgroundColor: item.color }]} />
                      <Text
                        style={[
                          Typography.bodyBold,
                          { color: colors.textPrimary, fontSize: 13, flex: 1 },
                        ]}
                      >
                        {item.label}
                      </Text>
                      <Switch
                        value={permissions[item.key]}
                        onValueChange={() => handleTogglePerm(item.key)}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor="#FFFFFF"
                      />
                    </View>
                  ))}
                </View>
              </View>

              {/* App Preferences & Sign Out */}
              <View
                style={[
                  styles.sectionCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Text style={[Typography.h3, { color: colors.textPrimary, marginBottom: 12 }]}>
                  {isTr ? 'Uygulama Tercihleri' : 'App Preferences'}
                </Text>

                <View style={styles.prefRow}>
                  <View style={styles.prefLabelGroup}>
                    {isDark ? (
                      <Moon size={16} color={colors.primary} />
                    ) : (
                      <Sun size={16} color="#FFB454" />
                    )}
                    <Text style={[Typography.body, { color: colors.textPrimary }]}>
                      {isTr ? 'Görünüm Teması' : 'Appearance'}
                    </Text>
                  </View>
                  <Pressable
                    onPress={toggleTheme}
                    style={[
                      styles.prefToggleBtn,
                      { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                    ]}
                  >
                    <Text style={[Typography.captionBold, { color: colors.primary }]}>
                      {isDark
                        ? isTr
                          ? 'Koyu Tema'
                          : 'Dark Mode'
                        : isTr
                        ? 'Açık Tema'
                        : 'Light Mode'}
                    </Text>
                  </Pressable>
                </View>

                <View style={[styles.prefRow, { marginTop: 10 }]}>
                  <View style={styles.prefLabelGroup}>
                    <Globe size={16} color="#C9A6FF" />
                    <Text style={[Typography.body, { color: colors.textPrimary }]}>
                      {isTr ? 'Dil' : 'Language'}
                    </Text>
                  </View>
                  <Pressable
                    onPress={toggleLanguage}
                    style={[
                      styles.prefToggleBtn,
                      { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                    ]}
                  >
                    <Text style={[Typography.captionBold, { color: colors.primary }]}>
                      {isTr ? 'Türkçe (TR)' : 'English (EN)'}
                    </Text>
                  </Pressable>
                </View>

                <Pressable
                  onPress={onLogout}
                  style={({ pressed }) => [
                    styles.logoutBtn,
                    {
                      backgroundColor: 'rgba(255, 143, 163, 0.12)',
                      borderColor: colors.danger,
                    },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <LogOut size={16} color={colors.danger} />
                  <Text style={[Typography.bodyBold, { color: colors.danger, fontSize: 14 }]}>
                    {isTr ? 'Çıkış Yap' : 'Sign Out'}
                  </Text>
                </Pressable>
              </View>
            </FadeRiseView>
          </View>

          <View style={{ height: Spacing.xxxl }} />
        </ScrollView>

        {!isWideScreen && (
          <BottomNavigation activeTab="profile" onTabChange={handleNavTab} />
        )}
      </View>
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
  mainArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.lg,
    gap: Spacing.lg,
  },
  scrollContentWide: {
    paddingHorizontal: 32,
    paddingTop: 28,
    maxWidth: 1180,
    width: '100%',
    alignSelf: 'center',
  },
  pageHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 12,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  headerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.pill,
  },
  errorBanner: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  heroCard: {
    padding: 22,
    borderRadius: 24,
    borderWidth: 1,
  },
  heroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    flexWrap: 'wrap',
  },
  avatarRing: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
  },
  heroIdentity: {
    flex: 1,
    minWidth: 220,
    gap: 4,
  },
  nameDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  editNameBtn: {
    padding: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  nameEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: 320,
  },
  nameInput: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  iconSaveBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statsGridWide: {
    flexWrap: 'nowrap',
  },
  statCard: {
    flex: 1,
    minWidth: 155,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  twoCol: {
    flexDirection: 'column',
    gap: Spacing.lg,
  },
  twoColWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sectionCard: {
    padding: 20,
    borderRadius: 22,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldLabel: {
    marginTop: 14,
    marginBottom: 8,
    fontSize: 12,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  saveProfileBtn: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
  },
  permRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  permDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  prefLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  prefToggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  logoutBtn: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
});
