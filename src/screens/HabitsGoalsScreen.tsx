import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { Check, Flame, Plus, Minus, Target, Trash2 } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n';
import { Spacing, Radius } from '../theme/spacing';
import { useResponsive } from '../hooks/useResponsive';
import { useHabitStore, calculateStreak } from '../store/useHabitStore';
import { WebSidebar } from '../components/web/WebSidebar';
import { BottomNavigation } from '../components/dashboard/BottomNavigation';
import { ActivityHeatmap } from '../components/habits/ActivityHeatmap';
import { NewHabitModal, NewGoalModal } from '../components/habits/HabitGoalModals';
import { FadeRiseView } from '../components/common/FadeRiseView';
import {
  formatMonthYear,
  getShortWeekdays,
  getWeekDates,
  toIsoDate,
} from '../utils/calendarUtils';

interface HabitsGoalsScreenProps {
  userName?: string;
  onNavigateToHome: () => void;
  onNavigateToTasks: () => void;
  onNavigateToCalendar: () => void;
  onNavigateToMentor?: () => void;
  onNavigateToProfile?: () => void;
  onLogout: () => void;
}

export const HabitsGoalsScreen: React.FC<HabitsGoalsScreenProps> = ({
  userName = 'Merve',
  onNavigateToHome,
  onNavigateToTasks,
  onNavigateToCalendar,
  onNavigateToMentor,
  onNavigateToProfile,
  onLogout,
}) => {
  const { colors, isDark } = useTheme();
  const { language } = useI18n();
  const { isWideScreen } = useResponsive();
  const {
    habits,
    goals,
    loadAll,
    toggleHabitDate,
    addHabit,
    deleteHabit,
    addGoal,
    stepGoal,
    deleteGoal,
  } = useHabitStore();

  const [newHabitOpen, setNewHabitOpen] = useState(false);
  const [newGoalOpen, setNewGoalOpen] = useState(false);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const today = useMemo(() => new Date(), []);
  const todayIso = toIsoDate(today);
  const weekDates = useMemo(() => getWeekDates(today), [today]);
  const shortWeekdays = useMemo(() => getShortWeekdays(language), [language]);

  return (
    <View style={[styles.root, isWideScreen && styles.rootWide, { backgroundColor: colors.background }]}>
      {isWideScreen && (
        <WebSidebar
          activeTab="habits"
          onTabChange={(tab) => {
            if (tab === 'home') onNavigateToHome();
            else if (tab === 'tasks') onNavigateToTasks();
            else if (tab === 'calendar') onNavigateToCalendar();
            else if (tab === 'ai' && onNavigateToMentor) onNavigateToMentor();
            else if (tab === 'profile' && onNavigateToProfile) onNavigateToProfile();
          }}
          onLogout={onLogout}
          userName={userName}
        />
      )}

      <View style={styles.mainArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, isWideScreen && styles.scrollContentWide]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <FadeRiseView delay={0} style={styles.headerRow}>
            <View>
              <Text style={[styles.eyebrow, { color: colors.textSecondary }]}>
                {formatMonthYear(today, language)}
              </Text>
              <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>
                {language === 'tr' ? 'Alışkanlıklar & Hedefler' : 'Habits & Goals'}
              </Text>
            </View>

            <View style={styles.headerButtons}>
              <Pressable
                onPress={() => setNewHabitOpen(true)}
                style={[styles.primaryPill, { backgroundColor: colors.primary }]}
              >
                <Plus size={16} color={colors.primaryText} strokeWidth={2.5} />
                <Text style={[styles.primaryPillText, { color: colors.primaryText }]}>
                  {language === 'tr' ? 'Yeni alışkanlık' : 'New habit'}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setNewGoalOpen(true)}
                style={[
                  styles.secondaryPill,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Target size={15} color={colors.primary} />
                <Text style={[styles.secondaryPillText, { color: colors.textPrimary }]}>
                  {language === 'tr' ? 'Yeni hedef' : 'New goal'}
                </Text>
              </Pressable>
            </View>
          </FadeRiseView>

          {/* Activity Heatmap + KPIs */}
          <FadeRiseView delay={80}>
            <ActivityHeatmap habits={habits} weeks={isWideScreen ? 20 : 12} />
          </FadeRiseView>

          {/* Weekly Habit Matrix */}
          <FadeRiseView
            delay={150}
            style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={styles.panelTopRow}>
              <Text style={[styles.panelTitle, { color: colors.textPrimary }]}>
                {language === 'tr' ? 'Haftalık Alışkanlık Takibi' : 'Weekly Habit Tracker'}
              </Text>
              <Text style={[styles.panelSub, { color: colors.textSecondary }]}>
                {language === 'tr' ? 'Kutulara dokunarak işaretle' : 'Tap squares to check in'}
              </Text>
            </View>

            {/* Week Day Header Row */}
            <View style={[styles.matrixHeaderRow, { borderBottomColor: colors.border }]}>
              <View style={styles.habitNameCol} />
              <View style={styles.daysCols}>
                {weekDates.map((d, idx) => {
                  const iso = toIsoDate(d);
                  const isToday = iso === todayIso;
                  return (
                    <View key={iso} style={styles.dayHeaderCell}>
                      <Text
                        style={[
                          styles.dayHeaderWd,
                          { color: isToday ? colors.primary : colors.textSecondary },
                        ]}
                      >
                        {shortWeekdays[idx]}
                      </Text>
                      <View
                        style={[
                          styles.dayNumCircle,
                          isToday && { backgroundColor: colors.primary },
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayHeaderNum,
                            { color: isToday ? colors.primaryText : colors.textPrimary },
                          ]}
                        >
                          {d.getDate()}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Habit Rows */}
            {habits.map((habit) => {
              const modColor = colors.modules[habit.category] || colors.primary;
              const streak = calculateStreak(habit.completedDates);
              return (
                <View
                  key={habit.id}
                  style={[styles.habitRow, { borderBottomColor: colors.border }]}
                >
                  <View style={styles.habitNameCol}>
                    <View style={styles.habitTitleLine}>
                      <View style={[styles.catDot, { backgroundColor: modColor }]} />
                      <Text
                        style={[styles.habitTitle, { color: colors.textPrimary }]}
                        numberOfLines={1}
                      >
                        {habit.title}
                      </Text>
                    </View>
                    <View style={styles.habitSubLine}>
                      <View style={[styles.streakBadge, { backgroundColor: `${colors.warning}22` }]}>
                        <Flame size={12} color={colors.warning} />
                        <Text style={[styles.streakText, { color: colors.warning }]}>
                          {streak} {language === 'tr' ? 'gün' : 'd'}
                        </Text>
                      </View>
                      <Pressable onPress={() => deleteHabit(habit.id)} hitSlop={6}>
                        <Trash2 size={13} color={colors.textSecondary} />
                      </Pressable>
                    </View>
                  </View>

                  <View style={styles.daysCols}>
                    {weekDates.map((d) => {
                      const iso = toIsoDate(d);
                      const checked = habit.completedDates.includes(iso);
                      return (
                        <View key={iso} style={styles.dayCheckCell}>
                          <Pressable
                            onPress={() => toggleHabitDate(habit.id, iso)}
                            style={({ pressed }) => [
                              styles.checkSquare,
                              {
                                backgroundColor: checked ? modColor : colors.surfaceElevated,
                                borderColor: checked ? modColor : colors.border,
                                opacity: pressed ? 0.8 : 1,
                              },
                            ]}
                          >
                            {checked && <Check size={15} color="#0E1029" strokeWidth={3} />}
                          </Pressable>
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </FadeRiseView>

          {/* Goals Section */}
          <FadeRiseView delay={220} style={styles.goalsSection}>
            <View style={styles.goalsHeaderRow}>
              <Text style={[styles.panelTitle, { color: colors.textPrimary }]}>
                {language === 'tr' ? 'Haftalık & Aylık Hedefler' : 'Weekly & Monthly Goals'}
              </Text>
              <Text style={[styles.panelSub, { color: colors.textSecondary }]}>
                {goals.filter((g) => g.currentCount >= g.targetCount).length}/{goals.length}{' '}
                {language === 'tr' ? 'tamamlandı' : 'achieved'}
              </Text>
            </View>

            <View style={[styles.goalsGrid, isWideScreen && styles.goalsGridWide]}>
              {goals.map((goal) => {
                const modColor = colors.modules[goal.category] || colors.primary;
                const pct = Math.min(100, Math.round((goal.currentCount / goal.targetCount) * 100));
                const isDone = goal.currentCount >= goal.targetCount;

                return (
                  <View
                    key={goal.id}
                    style={[
                      styles.goalCard,
                      isWideScreen && styles.goalCardWide,
                      {
                        backgroundColor: colors.surface,
                        borderColor: isDone ? colors.success : colors.border,
                      },
                    ]}
                  >
                    <View style={styles.goalTopRow}>
                      <View style={[styles.periodTag, { backgroundColor: `${modColor}22` }]}>
                        <Text style={[styles.periodTagText, { color: modColor }]}>
                          {goal.period === 'weekly'
                            ? language === 'tr'
                              ? 'Haftalık'
                              : 'Weekly'
                            : language === 'tr'
                              ? 'Aylık'
                              : 'Monthly'}
                        </Text>
                      </View>
                      <Pressable onPress={() => deleteGoal(goal.id)} hitSlop={8}>
                        <Trash2 size={14} color={colors.textSecondary} />
                      </Pressable>
                    </View>

                    <Text style={[styles.goalTitle, { color: colors.textPrimary }]}>
                      {goal.title}
                    </Text>
                    {goal.description ? (
                      <Text style={[styles.goalDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                        {goal.description}
                      </Text>
                    ) : null}

                    {/* Progress bar */}
                    <View style={styles.goalProgressRow}>
                      <View style={[styles.goalTrack, { backgroundColor: colors.surfaceElevated }]}>
                        <View
                          style={[
                            styles.goalFill,
                            {
                              width: `${pct}%`,
                              backgroundColor: isDone ? colors.success : modColor,
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.goalPct, { color: isDone ? colors.success : colors.textPrimary }]}>
                        {pct}%
                      </Text>
                    </View>

                    {/* Stepper Controls */}
                    <View style={styles.goalFooterRow}>
                      <Text style={[styles.goalCountText, { color: colors.textSecondary }]}>
                        {goal.currentCount} / {goal.targetCount}
                      </Text>

                      <View style={styles.stepperGroup}>
                        <Pressable
                          onPress={() => stepGoal(goal.id, -1)}
                          style={[
                            styles.stepBtn,
                            { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                          ]}
                        >
                          <Minus size={14} color={colors.textPrimary} />
                        </Pressable>
                        <Pressable
                          onPress={() => stepGoal(goal.id, 1)}
                          style={[
                            styles.stepBtn,
                            {
                              backgroundColor: isDark ? colors.primary : '#14173A',
                              borderColor: 'transparent',
                            },
                          ]}
                        >
                          <Plus size={14} color={isDark ? colors.primaryText : '#FFFFFF'} />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </FadeRiseView>

          <View style={{ height: Spacing.xxxl }} />
        </ScrollView>

        {!isWideScreen && (
          <BottomNavigation
            activeTab="home"
            onQuickAdd={() => setNewHabitOpen(true)}
            onTabChange={(tab) => {
              if (tab === 'home') onNavigateToHome();
              else if (tab === 'tasks') onNavigateToTasks();
              else if (tab === 'calendar') onNavigateToCalendar();
            }}
          />
        )}
      </View>

      <NewHabitModal
        visible={newHabitOpen}
        onClose={() => setNewHabitOpen(false)}
        onSave={addHabit}
      />
      <NewGoalModal
        visible={newGoalOpen}
        onClose={() => setNewGoalOpen(false)}
        onSave={addGoal}
      />
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
    maxWidth: 1220,
    width: '100%',
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 14,
    marginBottom: 20,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
    marginBottom: 2,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 40,
    paddingHorizontal: 16,
    borderRadius: Radius.pill,
  },
  primaryPillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 40,
    paddingHorizontal: 16,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  secondaryPillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  panel: {
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  panelTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  panelSub: {
    fontSize: 12,
    fontWeight: '500',
  },
  matrixHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  habitNameCol: {
    flex: 1.5,
    paddingRight: 10,
  },
  daysCols: {
    flex: 2.2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayHeaderCell: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  dayHeaderWd: {
    fontSize: 10,
    fontWeight: '700',
  },
  dayNumCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayHeaderNum: {
    fontSize: 12,
    fontWeight: '700',
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  habitTitleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  catDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  habitTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  habitSubLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 5,
    paddingLeft: 17,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  streakText: {
    fontSize: 11,
    fontWeight: '700',
  },
  dayCheckCell: {
    flex: 1,
    alignItems: 'center',
  },
  checkSquare: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalsSection: {
    gap: 14,
  },
  goalsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalsGrid: {
    flexDirection: 'column',
    gap: 14,
  },
  goalsGridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  goalCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    gap: 10,
  },
  goalCardWide: {
    width: '32%',
    minWidth: 260,
  },
  goalTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  periodTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  periodTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  goalDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  goalProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  goalTrack: {
    flex: 1,
    height: 8,
    borderRadius: 99,
    overflow: 'hidden',
  },
  goalFill: {
    height: '100%',
    borderRadius: 99,
  },
  goalPct: {
    fontSize: 13,
    fontWeight: '700',
    minWidth: 38,
    textAlign: 'right',
  },
  goalFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  goalCountText: {
    fontSize: 13,
    fontWeight: '600',
  },
  stepperGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
