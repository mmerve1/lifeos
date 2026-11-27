import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { ChevronLeft, ChevronRight, Plus, Check, Clock } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n';
import { Spacing, Radius } from '../theme/spacing';
import { useResponsive } from '../hooks/useResponsive';
import { useTaskStore } from '../store/useTaskStore';
import { WebSidebar } from '../components/web/WebSidebar';
import { BottomNavigation } from '../components/dashboard/BottomNavigation';
import { MiniCalendar } from '../components/calendar/MiniCalendar';
import {
  TaskDetailModal,
  QuickAddCalendarModal,
  getTomorrowDateIso,
} from '../components/calendar/CalendarModals';
import { FadeRiseView } from '../components/common/FadeRiseView';
import { Task } from '../types/task';
import { ModuleCategory } from '../types';
import {
  TIMELINE_HOURS,
  addDays,
  formatFullDate,
  formatMonthYear,
  getMonthGridDates,
  getShortWeekdays,
  getWeekDates,
  parseHour,
  toIsoDate,
} from '../utils/calendarUtils';

type CalendarViewMode = 'month' | 'week' | 'day';

interface CalendarScreenProps {
  userName?: string;
  onNavigateToHome: () => void;
  onNavigateToTasks: () => void;
  onNavigateToEditTask: (id: string) => void;
  onLogout: () => void;
}

const FILTER_CATEGORIES: { key: 'all' | ModuleCategory; tr: string; en: string }[] = [
  { key: 'all', tr: 'Tümü', en: 'All' },
  { key: 'personal', tr: 'Kişisel', en: 'Personal' },
  { key: 'career', tr: 'Kariyer', en: 'Career' },
  { key: 'academic', tr: 'Akademik', en: 'Academic' },
  { key: 'finance', tr: 'Finans', en: 'Finance' },
  { key: 'health', tr: 'Sağlık', en: 'Health' },
  { key: 'learning', tr: 'Öğrenme', en: 'Learning' },
  { key: 'social', tr: 'Sosyal', en: 'Social' },
];

export const CalendarScreen: React.FC<CalendarScreenProps> = ({
  userName = 'Merve',
  onNavigateToHome,
  onNavigateToTasks,
  onNavigateToEditTask,
  onLogout,
}) => {
  const { colors, isDark } = useTheme();
  const { t, language } = useI18n();
  const { isWideScreen, isDesktop } = useResponsive();
  const { tasks, loadTasks, createTask, updateTask, toggleTask, deleteTask } = useTaskStore();

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>(isWideScreen ? 'week' : 'day');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ModuleCategory>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [quickAddVisible, setQuickAddVisible] = useState(false);
  const [quickAddHour, setQuickAddHour] = useState<number | null>(null);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const filteredTasks = useMemo(() => {
    if (categoryFilter === 'all') return tasks;
    return tasks.filter((item) => item.category === categoryFilter);
  }, [tasks, categoryFilter]);

  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const item of filteredTasks) {
      const key = item.dueDate || toIsoDate(new Date());
      if (!map[key]) map[key] = [];
      map[key].push(item);
    }
    return map;
  }, [filteredTasks]);

  const taskCountByDate = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const [k, v] of Object.entries(tasksByDate)) {
      counts[k] = v.length;
    }
    return counts;
  }, [tasksByDate]);

  const todayIso = toIsoDate(new Date());
  const selectedIso = toIsoDate(selectedDate);
  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);
  const shortWeekdays = useMemo(() => getShortWeekdays(language), [language]);
  const todaysTasks = tasksByDate[todayIso] || [];

  // Category breakdown for sidebar widget
  const breakdown = useMemo(() => {
    const counts: Partial<Record<ModuleCategory, number>> = {};
    for (const item of tasks) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    const total = Math.max(tasks.length, 1);
    return Object.entries(counts)
      .sort((a, b) => (b[1] || 0) - (a[1] || 0))
      .slice(0, 4)
      .map(([cat, count]) => ({
        category: cat as ModuleCategory,
        count: count || 0,
        pct: Math.round(((count || 0) / total) * 100),
      }));
  }, [tasks]);

  const navigatePeriod = (dir: -1 | 1) => {
    if (viewMode === 'month') {
      setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + dir, 1));
    } else if (viewMode === 'week') {
      setSelectedDate(addDays(selectedDate, dir * 7));
    } else {
      setSelectedDate(addDays(selectedDate, dir));
    }
  };

  const openQuickAdd = (date?: Date, hour?: number | null) => {
    if (date) setSelectedDate(date);
    setQuickAddHour(hour ?? null);
    setQuickAddVisible(true);
  };

  const renderTaskBlock = (item: Task, compact = false) => {
    const modColor = colors.modules[item.category] || colors.primary;
    const isCompleted = item.status === 'completed';

    return (
      <Pressable
        key={item.id}
        onPress={() => setSelectedTask(item)}
        style={({ pressed }) => [
          compact ? styles.compactTaskPill : styles.timelineTaskBlock,
          {
            backgroundColor: modColor,
            opacity: isCompleted ? 0.55 : pressed ? 0.85 : 1,
          },
        ]}
      >
        <Text
          style={[
            compact ? styles.compactTaskTitle : styles.timelineTaskTitle,
            isCompleted && styles.strikethrough,
          ]}
          numberOfLines={compact ? 1 : 2}
        >
          {item.title}
        </Text>
        {!compact && item.dueTime ? (
          <Text style={styles.timelineTaskTime}>{item.dueTime}</Text>
        ) : null}
      </Pressable>
    );
  };

  // --- WEEK VIEW (Calmendar-inspired hourly columns) ---
  const renderWeekView = () => (
    <View style={[styles.calendarSurface, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* 7-day Header Strip */}
      <View style={[styles.weekHeaderRow, { borderBottomColor: colors.border }]}>
        <View style={styles.hourGutterHeader}>
          <Text style={[styles.gmtText, { color: colors.textSecondary }]}>UTC+3</Text>
        </View>
        {weekDates.map((d, idx) => {
          const iso = toIsoDate(d);
          const isSelected = iso === selectedIso;
          const isToday = iso === todayIso;
          return (
            <Pressable
              key={iso}
              onPress={() => setSelectedDate(d)}
              style={[
                styles.weekDayPill,
                isSelected && { backgroundColor: isDark ? '#F3F2FF' : '#14173A' },
                !isSelected && isToday && { borderColor: colors.primary, borderWidth: 1.5 },
                !isSelected && !isToday && { backgroundColor: colors.surfaceElevated },
              ]}
            >
              <Text
                style={[
                  styles.weekDayText,
                  {
                    color: isSelected
                      ? isDark
                        ? '#0E1029'
                        : '#FFFFFF'
                      : colors.textPrimary,
                  },
                ]}
              >
                {shortWeekdays[idx]} {d.getDate()}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Hourly Grid */}
      <ScrollView style={styles.weekTimelineScroll} showsVerticalScrollIndicator={false}>
        {/* Untimed / All-Day row */}
        <View style={[styles.hourRow, { borderBottomColor: colors.border, minHeight: 46 }]}>
          <View style={styles.hourGutter}>
            <Text style={[styles.hourLabel, { color: colors.textSecondary }]}>
              {t('calendarAllDay')}
            </Text>
          </View>
          {weekDates.map((d) => {
            const iso = toIsoDate(d);
            const untimed = (tasksByDate[iso] || []).filter((it) => parseHour(it.dueTime) === null);
            return (
              <View key={iso} style={[styles.weekCell, { borderLeftColor: colors.border }]}>
                {untimed.map((it) => renderTaskBlock(it, true))}
              </View>
            );
          })}
        </View>

        {TIMELINE_HOURS.map((hour) => (
          <View key={hour} style={[styles.hourRow, { borderBottomColor: colors.border }]}>
            <View style={styles.hourGutter}>
              <Text style={[styles.hourLabel, { color: colors.textSecondary }]}>
                {`${String(hour).padStart(2, '0')}:00`}
              </Text>
            </View>
            {weekDates.map((d) => {
              const iso = toIsoDate(d);
              const hourTasks = (tasksByDate[iso] || []).filter(
                (it) => parseHour(it.dueTime) === hour
              );
              return (
                <Pressable
                  key={iso}
                  onPress={() => openQuickAdd(d, hour)}
                  style={[styles.weekCell, { borderLeftColor: colors.border }]}
                >
                  {hourTasks.map((it) => renderTaskBlock(it, false))}
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );

  // --- MONTH VIEW ---
  const renderMonthView = () => {
    const grid = getMonthGridDates(selectedDate.getFullYear(), selectedDate.getMonth());
    return (
      <View style={[styles.calendarSurface, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.monthWeekdayHeader, { borderBottomColor: colors.border }]}>
          {shortWeekdays.map((wd) => (
            <Text key={wd} style={[styles.monthWeekdayLabel, { color: colors.textSecondary }]}>
              {wd}
            </Text>
          ))}
        </View>
        <View style={styles.monthGrid}>
          {grid.map(({ date, inMonth }) => {
            const iso = toIsoDate(date);
            const dayTasks = tasksByDate[iso] || [];
            const isSelected = iso === selectedIso;
            const isToday = iso === todayIso;
            return (
              <Pressable
                key={iso}
                onPress={() => {
                  setSelectedDate(date);
                  if (!isWideScreen) setViewMode('day');
                }}
                style={[
                  styles.monthCell,
                  {
                    borderColor: colors.border,
                    backgroundColor: isSelected ? colors.surfaceSubtle : 'transparent',
                  },
                ]}
              >
                <View
                  style={[
                    styles.monthDayNumWrap,
                    isToday && { backgroundColor: colors.primary },
                  ]}
                >
                  <Text
                    style={[
                      styles.monthDayNum,
                      {
                        color: isToday
                          ? colors.primaryText
                          : inMonth
                            ? colors.textPrimary
                            : colors.textSecondary,
                        opacity: inMonth || isToday ? 1 : 0.4,
                      },
                    ]}
                  >
                    {date.getDate()}
                  </Text>
                </View>

                <View style={styles.monthCellTasks}>
                  {dayTasks.slice(0, isWideScreen ? 3 : 2).map((it) => renderTaskBlock(it, true))}
                  {dayTasks.length > (isWideScreen ? 3 : 2) && (
                    <Text style={[styles.moreCount, { color: colors.textSecondary }]}>
                      +{dayTasks.length - (isWideScreen ? 3 : 2)}
                    </Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  };

  // --- DAY VIEW (Mobile-friendly & focused desktop daily view) ---
  const renderDayView = () => {
    const dayTasks = (tasksByDate[selectedIso] || []).sort((a, b) =>
      (a.dueTime ?? '99:99').localeCompare(b.dueTime ?? '99:99')
    );

    return (
      <View style={[styles.calendarSurface, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {/* Horizontal 7-day strip */}
        <View style={[styles.dayStripRow, { borderBottomColor: colors.border }]}>
          {weekDates.map((d, idx) => {
            const iso = toIsoDate(d);
            const isSelected = iso === selectedIso;
            const isToday = iso === todayIso;
            const count = taskCountByDate[iso] || 0;
            return (
              <Pressable
                key={iso}
                onPress={() => setSelectedDate(d)}
                style={[
                  styles.dayStripItem,
                  isSelected && { backgroundColor: colors.primary },
                  !isSelected && isToday && { borderColor: colors.primary, borderWidth: 1.5 },
                ]}
              >
                <Text
                  style={[
                    styles.dayStripWd,
                    { color: isSelected ? colors.primaryText : colors.textSecondary },
                  ]}
                >
                  {shortWeekdays[idx]}
                </Text>
                <Text
                  style={[
                    styles.dayStripNum,
                    { color: isSelected ? colors.primaryText : colors.textPrimary },
                  ]}
                >
                  {d.getDate()}
                </Text>
                {count > 0 && (
                  <View
                    style={[
                      styles.dayStripDot,
                      { backgroundColor: isSelected ? colors.primaryText : colors.warning },
                    ]}
                  />
                )}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.dayDetailBody}>
          <View style={styles.dayHeadingRow}>
            <Text style={[styles.dayHeadingText, { color: colors.textPrimary }]}>
              {formatFullDate(selectedDate, language)}
            </Text>
            <Pressable
              onPress={() => openQuickAdd(selectedDate)}
              style={[styles.miniAddBtn, { backgroundColor: colors.surfaceElevated }]}
            >
              <Plus size={16} color={colors.primary} />
            </Pressable>
          </View>

          {dayTasks.length === 0 ? (
            <View style={styles.emptyDayBox}>
              <Text style={[styles.emptyDayText, { color: colors.textSecondary }]}>
                {t('calendarNoTasksDay')}
              </Text>
              <Pressable
                onPress={() => openQuickAdd(selectedDate)}
                style={[styles.addFirstPill, { backgroundColor: colors.primary }]}
              >
                <Plus size={15} color={colors.primaryText} />
                <Text style={[styles.addFirstPillText, { color: colors.primaryText }]}>
                  {t('calendarAddEvent')}
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.dayCardsStack}>
              {dayTasks.map((item) => {
                const modColor = colors.modules[item.category] || colors.primary;
                const isCompleted = item.status === 'completed';
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => setSelectedTask(item)}
                    style={[
                      styles.dayTaskCard,
                      {
                        backgroundColor: colors.surfaceElevated,
                        borderLeftColor: modColor,
                        opacity: isCompleted ? 0.65 : 1,
                      },
                    ]}
                  >
                    <Pressable
                      onPress={() => toggleTask(item.id)}
                      hitSlop={8}
                      style={[
                        styles.dayCheckCircle,
                        {
                          borderColor: modColor,
                          backgroundColor: isCompleted ? modColor : 'transparent',
                        },
                      ]}
                    >
                      {isCompleted && <Check size={13} color="#0E1029" strokeWidth={3} />}
                    </Pressable>
                    <View style={styles.dayCardContent}>
                      <Text
                        style={[
                          styles.dayCardTitle,
                          { color: colors.textPrimary },
                          isCompleted && styles.strikethrough,
                        ]}
                      >
                        {item.title}
                      </Text>
                      <View style={styles.dayCardMetaRow}>
                        {item.dueTime ? (
                          <View style={styles.metaInline}>
                            <Clock size={12} color={colors.textSecondary} />
                            <Text style={[styles.metaInlineText, { color: colors.textSecondary }]}>
                              {item.dueTime}
                            </Text>
                          </View>
                        ) : null}
                        <Text style={[styles.metaCategory, { color: modColor }]}>
                          {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.root, isWideScreen && styles.rootWide, { backgroundColor: colors.background }]}>
      {isWideScreen && (
        <WebSidebar
          activeTab="calendar"
          onTabChange={(tab) => {
            if (tab === 'home') onNavigateToHome();
            else if (tab === 'tasks') onNavigateToTasks();
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
          {/* Top Calendar Controls Bar */}
          <FadeRiseView delay={0} style={styles.topBar}>
            <View style={styles.topBarLeft}>
              <Text style={[styles.monthHeading, { color: colors.textPrimary }]}>
                {formatMonthYear(selectedDate, language)}
              </Text>
              <View style={styles.navArrowsRow}>
                <Pressable
                  onPress={() => navigatePeriod(-1)}
                  style={[styles.iconCircle, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <ChevronLeft size={16} color={colors.textPrimary} />
                </Pressable>
                <Pressable
                  onPress={() => setSelectedDate(new Date())}
                  style={[styles.todayPill, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <Text style={[styles.todayPillText, { color: colors.textPrimary }]}>
                    {t('calendarToday')}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => navigatePeriod(1)}
                  style={[styles.iconCircle, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <ChevronRight size={16} color={colors.textPrimary} />
                </Pressable>
              </View>
            </View>

            <View style={styles.topBarRight}>
              {/* Month / Week / Day Segmented Switcher */}
              <View style={[styles.segmentedControl, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {(['month', 'week', 'day'] as CalendarViewMode[]).map((mode) => {
                  const active = viewMode === mode;
                  return (
                    <Pressable
                      key={mode}
                      onPress={() => setViewMode(mode)}
                      style={[
                        styles.segmentBtn,
                        active && { backgroundColor: isDark ? '#F3F2FF' : '#14173A' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.segmentText,
                          {
                            color: active
                              ? isDark
                                ? '#0E1029'
                                : '#FFFFFF'
                              : colors.textSecondary,
                          },
                        ]}
                      >
                        {mode === 'month'
                          ? t('calendarMonth')
                          : mode === 'week'
                            ? t('calendarWeek')
                            : t('calendarDay')}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Pressable
                onPress={() => openQuickAdd(selectedDate)}
                style={[styles.addBtnPill, { backgroundColor: colors.primary }]}
              >
                <Plus size={16} color={colors.primaryText} strokeWidth={2.5} />
                <Text style={[styles.addBtnText, { color: colors.primaryText }]}>
                  {t('calendarAddEvent')}
                </Text>
              </Pressable>
            </View>
          </FadeRiseView>

          {/* Category Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChipsRow}
          >
            {FILTER_CATEGORIES.map((cat) => {
              const active = categoryFilter === cat.key;
              const chipColor =
                cat.key === 'all' ? colors.primary : colors.modules[cat.key] || colors.primary;
              return (
                <Pressable
                  key={cat.key}
                  onPress={() => setCategoryFilter(cat.key)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: active ? chipColor : colors.surface,
                      borderColor: active ? chipColor : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      {
                        color: active
                          ? cat.key === 'all'
                            ? colors.primaryText
                            : '#0E1029'
                          : colors.textSecondary,
                      },
                    ]}
                  >
                    {language === 'tr' ? cat.tr : cat.en}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Main Workspace Grid: Left Widgets (Desktop) + Main Calendar */}
          <View style={[styles.workspaceRow, isDesktop && styles.workspaceRowDesktop]}>
            {isDesktop && (
              <FadeRiseView delay={80} style={styles.leftWidgetsCol}>
                <MiniCalendar
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  taskCountByDate={taskCountByDate}
                />

                {/* Upcoming Today Card */}
                <View style={[styles.widgetCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.widgetTitle, { color: colors.textPrimary }]}>
                    {t('calendarUpcoming')}
                  </Text>
                  {todaysTasks.length === 0 ? (
                    <Text style={[styles.widgetEmpty, { color: colors.textSecondary }]}>
                      {t('calendarNoTasksDay')}
                    </Text>
                  ) : (
                    todaysTasks.slice(0, 5).map((item) => {
                      const done = item.status === 'completed';
                      const modColor = colors.modules[item.category] || colors.primary;
                      return (
                        <Pressable
                          key={item.id}
                          onPress={() => toggleTask(item.id)}
                          style={styles.upcomingRow}
                        >
                          <View
                            style={[
                              styles.upcomingCheck,
                              {
                                borderColor: modColor,
                                backgroundColor: done ? modColor : 'transparent',
                              },
                            ]}
                          >
                            {done && <Check size={10} color="#0E1029" strokeWidth={3} />}
                          </View>
                          <Text
                            style={[
                              styles.upcomingTitle,
                              { color: colors.textPrimary },
                              done && styles.strikethrough,
                            ]}
                            numberOfLines={1}
                          >
                            {item.title}
                          </Text>
                          <Text style={[styles.upcomingTime, { color: colors.textSecondary }]}>
                            {item.dueTime || '—'}
                          </Text>
                        </Pressable>
                      );
                    })
                  )}
                </View>

                {/* Category Time Breakdown Card */}
                <View style={[styles.widgetCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.widgetTitle, { color: colors.textPrimary }]}>
                    {t('calendarBreakdown')}
                  </Text>
                  {breakdown.length === 0 ? (
                    <Text style={[styles.widgetEmpty, { color: colors.textSecondary }]}>—</Text>
                  ) : (
                    breakdown.map((b) => {
                      const c = colors.modules[b.category] || colors.primary;
                      return (
                        <View key={b.category} style={styles.breakdownItem}>
                          <View style={styles.breakdownHeader}>
                            <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>
                              {b.category.charAt(0).toUpperCase() + b.category.slice(1)}
                            </Text>
                            <Text style={[styles.breakdownLabel, { color: colors.textPrimary }]}>
                              {b.count}
                            </Text>
                          </View>
                          <View style={[styles.breakdownTrack, { backgroundColor: colors.surfaceElevated }]}>
                            <View
                              style={[
                                styles.breakdownFill,
                                { width: `${Math.max(b.pct, 8)}%`, backgroundColor: c },
                              ]}
                            />
                          </View>
                        </View>
                      );
                    })
                  )}
                </View>
              </FadeRiseView>
            )}

            <FadeRiseView delay={140} style={styles.mainCalendarCol}>
              {viewMode === 'week' && renderWeekView()}
              {viewMode === 'month' && renderMonthView()}
              {viewMode === 'day' && renderDayView()}
            </FadeRiseView>
          </View>

          <View style={{ height: Spacing.xxxl }} />
        </ScrollView>

        {!isWideScreen && (
          <BottomNavigation
            activeTab="calendar"
            onQuickAdd={() => openQuickAdd(selectedDate)}
            onTabChange={(tab) => {
              if (tab === 'home') onNavigateToHome();
              else if (tab === 'tasks') onNavigateToTasks();
            }}
          />
        )}
      </View>

      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onToggle={(id) => {
          toggleTask(id);
        }}
        onRescheduleTomorrow={(task) => {
          updateTask(task.id, { dueDate: getTomorrowDateIso(task.dueDate) });
        }}
        onEdit={onNavigateToEditTask}
        onDelete={(id) => {
          deleteTask(id);
        }}
      />

      <QuickAddCalendarModal
        visible={quickAddVisible}
        initialDate={selectedDate}
        initialHour={quickAddHour}
        onClose={() => setQuickAddVisible(false)}
        onCreate={async (input) => {
          await createTask(input);
        }}
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
    paddingHorizontal: 28,
    paddingTop: 24,
    maxWidth: 1320,
    width: '100%',
    alignSelf: 'center',
  },
  topBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  monthHeading: {
    fontSize: 26,
    fontWeight: '700',
    textTransform: 'capitalize',
    letterSpacing: -0.4,
  },
  navArrowsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayPill: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  segmentedControl: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: Radius.pill,
    borderWidth: 1,
    gap: 2,
  },
  segmentBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.pill,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '700',
  },
  addBtnPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 38,
    paddingHorizontal: 16,
    borderRadius: Radius.pill,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  filterChipsRow: {
    gap: 8,
    paddingBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  workspaceRow: {
    flexDirection: 'column',
    gap: 20,
  },
  workspaceRowDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  leftWidgetsCol: {
    width: 280,
    gap: 16,
  },
  mainCalendarCol: {
    flex: 1,
    minWidth: 0,
  },
  widgetCard: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    gap: 10,
  },
  widgetTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  widgetEmpty: {
    fontSize: 13,
  },
  upcomingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  upcomingCheck: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upcomingTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  upcomingTime: {
    fontSize: 11,
    fontWeight: '600',
  },
  breakdownItem: {
    gap: 5,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  breakdownTrack: {
    height: 7,
    borderRadius: 99,
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    borderRadius: 99,
  },
  calendarSurface: {
    borderRadius: 26,
    borderWidth: 1,
    overflow: 'hidden',
  },
  weekHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingRight: 8,
    borderBottomWidth: 1,
    gap: 4,
  },
  hourGutterHeader: {
    width: 58,
    alignItems: 'center',
  },
  gmtText: {
    fontSize: 10,
    fontWeight: '600',
  },
  weekDayPill: {
    flex: 1,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '700',
  },
  weekTimelineScroll: {
    maxHeight: 620,
  },
  hourRow: {
    flexDirection: 'row',
    minHeight: 62,
    borderBottomWidth: 1,
  },
  hourGutter: {
    width: 58,
    paddingTop: 8,
    alignItems: 'center',
  },
  hourLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  weekCell: {
    flex: 1,
    borderLeftWidth: 1,
    padding: 4,
    gap: 4,
  },
  timelineTaskBlock: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  timelineTaskTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0E1029',
  },
  timelineTaskTime: {
    fontSize: 10,
    fontWeight: '600',
    color: '#14173A',
    marginTop: 2,
  },
  compactTaskPill: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  compactTaskTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0E1029',
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  monthWeekdayHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  monthWeekdayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  monthCell: {
    width: '14.285%',
    minHeight: 96,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    padding: 6,
    gap: 4,
  },
  monthDayNumWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthDayNum: {
    fontSize: 12,
    fontWeight: '700',
  },
  monthCellTasks: {
    gap: 3,
  },
  moreCount: {
    fontSize: 10,
    fontWeight: '700',
    paddingLeft: 4,
  },
  dayStripRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    gap: 4,
  },
  dayStripItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
    gap: 3,
  },
  dayStripWd: {
    fontSize: 11,
    fontWeight: '600',
  },
  dayStripNum: {
    fontSize: 15,
    fontWeight: '700',
  },
  dayStripDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  dayDetailBody: {
    padding: 18,
    gap: 14,
  },
  dayHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayHeadingText: {
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  miniAddBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDayBox: {
    paddingVertical: 36,
    alignItems: 'center',
    gap: 14,
  },
  emptyDayText: {
    fontSize: 14,
  },
  addFirstPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: Radius.pill,
  },
  addFirstPillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  dayCardsStack: {
    gap: 10,
  },
  dayTaskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 18,
    borderLeftWidth: 4,
  },
  dayCheckCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCardContent: {
    flex: 1,
    gap: 4,
  },
  dayCardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  dayCardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaInlineText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metaCategory: {
    fontSize: 12,
    fontWeight: '700',
  },
});
