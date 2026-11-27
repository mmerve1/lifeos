import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
} from 'react-native';
import {
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  ChevronRight,
  Trash2,
  PauseCircle,
  ArrowLeft,
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n';
import { Typography } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { useTaskStore } from '../store/useTaskStore';
import { Task, TaskStatus, TaskPriority } from '../types/task';
import { ModuleCategory } from '../types';
import { useResponsive } from '../hooks/useResponsive';
import { WebSidebar } from '../components/web/WebSidebar';

interface TaskListScreenProps {
  onNavigateToCreate: () => void;
  onNavigateToEdit: (taskId: string) => void;
  onNavigateToHome?: () => void;
  onNavigateToCalendar?: () => void;
  onNavigateToHabits?: () => void;
  onNavigateToMentor?: () => void;
  onNavigateToProfile?: () => void;
  onLogout?: () => void;
  userName?: string;
}

type FilterTab = 'all' | TaskStatus;

const PRIORITY_ORDER: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };

const CATEGORY_ICONS: Record<ModuleCategory, string> = {
  career: '💼',
  academic: '🎓',
  finance: '💰',
  health: '❤️',
  learning: '📚',
  social: '👥',
  personal: '🧭',
  ai: '✨',
};

export const TaskListScreen: React.FC<TaskListScreenProps> = ({
  onNavigateToCreate,
  onNavigateToEdit,
  onNavigateToHome,
  onNavigateToCalendar,
  onNavigateToHabits,
  onNavigateToMentor,
  onNavigateToProfile,
  onLogout,
  userName,
}) => {
  const { colors, isDark } = useTheme();
  const { t } = useI18n();
  const { tasks, loadTasks, toggleTask, deleteTask } = useTaskStore();
  const { isWideScreen } = useResponsive();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  useEffect(() => {
    loadTasks();
  }, []);

  const filtered = useMemo(() => {
    const list = activeFilter === 'all' ? tasks : tasks.filter((t) => t.status === activeFilter);
    return [...list].sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    });
  }, [tasks, activeFilter]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter((t) => t.dueDate === today);
    const completed = todayTasks.filter((t) => t.status === 'completed').length;
    return { total: todayTasks.length, completed };
  }, [tasks]);

  const priorityColor = (p: TaskPriority) => {
    if (p === 'high') return colors.danger;
    if (p === 'medium') return colors.warning;
    return colors.success;
  };

  const priorityLabel = (p: TaskPriority) => {
    if (p === 'high') return t('taskPriorityHigh');
    if (p === 'medium') return t('taskPriorityMedium');
    return t('taskPriorityLow');
  };

  const handleDelete = (task: Task) => {
    Alert.alert(
      t('taskDeleteButton'),
      t('taskDeleteConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('taskDeleteConfirmYes'),
          style: 'destructive',
          onPress: () => deleteTask(task.id),
        },
      ]
    );
  };

  const filters: { key: FilterTab; label: string }[] = [
    { key: 'all', label: t('tasksFilterAll') },
    { key: 'active', label: t('tasksFilterActive') },
    { key: 'completed', label: t('tasksFilterCompleted') },
    { key: 'deferred', label: t('tasksFilterDeferred') },
  ];

  const renderItem = ({ item }: { item: Task }) => {
    const moduleColor = colors.modules[item.category] || colors.primary;
    const isCompleted = item.status === 'completed';
    const isDeferred = item.status === 'deferred';

    return (
      <Pressable
        onPress={() => onNavigateToEdit(item.id)}
        style={({ pressed }) => [
          styles.taskCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            opacity: pressed ? 0.85 : 1,
          },
          isCompleted && { borderColor: colors.success + '44' },
        ]}
      >
        {/* Priority stripe */}
        <View style={[styles.priorityStripe, { backgroundColor: priorityColor(item.priority) }]} />

        {/* Checkbox */}
        <Pressable
          onPress={() => toggleTask(item.id)}
          hitSlop={8}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isCompleted }}
          style={[
            styles.checkbox,
            {
              borderColor: isCompleted ? colors.success : colors.border,
              backgroundColor: isCompleted ? colors.success : colors.surfaceElevated,
            },
          ]}
        >
          {isCompleted && <CheckCircle2 size={14} color="#fff" />}
          {isDeferred && <PauseCircle size={14} color={colors.textSecondary} />}
          {!isCompleted && !isDeferred && <Circle size={14} color={colors.border} />}
        </Pressable>

        {/* Content */}
        <View style={styles.taskContent}>
          <Text
            style={[
              Typography.bodyBold,
              { color: isCompleted ? colors.textSecondary : colors.textPrimary },
              isCompleted && styles.strikethrough,
            ]}
            numberOfLines={1}
          >
            {item.title}
          </Text>

          {item.description ? (
            <Text
              style={[Typography.caption, { color: colors.textSecondary, marginTop: 2 }]}
              numberOfLines={1}
            >
              {item.description}
            </Text>
          ) : null}

          <View style={styles.taskMeta}>
            {/* Category badge */}
            <View
              style={[
                styles.badge,
                { backgroundColor: moduleColor + '1A', borderColor: moduleColor + '33' },
              ]}
            >
              <Text style={styles.badgeEmoji}>{CATEGORY_ICONS[item.category]}</Text>
            </View>

            {/* Priority badge */}
            <View
              style={[
                styles.badge,
                { backgroundColor: priorityColor(item.priority) + '1A', borderColor: priorityColor(item.priority) + '33' },
              ]}
            >
              <Text style={[Typography.caption, { color: priorityColor(item.priority), fontSize: 10 }]}>
                {priorityLabel(item.priority)}
              </Text>
            </View>

            {/* Time */}
            {item.dueTime ? (
              <View style={styles.timeRow}>
                <Clock size={11} color={colors.textSecondary} />
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>{item.dueTime}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.taskActions}>
          <Pressable onPress={() => handleDelete(item)} hitSlop={8} style={styles.actionBtn}>
            <Trash2 size={16} color={colors.textSecondary} />
          </Pressable>
          <ChevronRight size={16} color={colors.textSecondary} />
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.root, isWideScreen && styles.rootWide, { backgroundColor: colors.background }]}>
      {isWideScreen && (
        <WebSidebar
          activeTab="tasks"
          onTabChange={(tab) => {
            if (tab === 'home' && onNavigateToHome) {
              onNavigateToHome();
            } else if (tab === 'calendar' && onNavigateToCalendar) {
              onNavigateToCalendar();
            } else if (tab === 'habits' && onNavigateToHabits) {
              onNavigateToHabits();
            } else if (tab === 'ai' && onNavigateToMentor) {
              onNavigateToMentor();
            } else if (tab === 'profile' && onNavigateToProfile) {
              onNavigateToProfile();
            }
          }}
          onLogout={onLogout}
          userName={userName}
        />
      )}
      <View style={[styles.innerContainer, isWideScreen && styles.innerContainerWide]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          {!isWideScreen && onNavigateToHome && (
            <Pressable onPress={onNavigateToHome} hitSlop={8} style={styles.backBtn}>
              <ArrowLeft size={20} color={colors.textPrimary} />
            </Pressable>
          )}
          <View>
            <Text style={[Typography.h2, { color: colors.textPrimary }]}>{t('tasksScreenTitle')}</Text>
            {stats.total > 0 && (
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                {stats.completed}/{stats.total} {t('tasksDoneRatio')}
              </Text>
            )}
          </View>
        </View>

        <Pressable
          onPress={onNavigateToCreate}
          style={({ pressed }) => [
            styles.fabInline,
            { backgroundColor: pressed ? colors.primaryPressed : colors.primary },
          ]}
          accessibilityLabel={t('taskNewTitle')}
        >
          <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
        </Pressable>
      </View>

      {/* Filter tabs */}
      <View style={[styles.filterRow, { borderBottomColor: colors.border }]}>
        {filters.map((f) => {
          const isActive = activeFilter === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setActiveFilter(f.key)}
              style={[
                styles.filterTab,
                isActive && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
              ]}
            >
              <Text
                style={[
                  Typography.caption,
                  { color: isActive ? colors.primary : colors.textSecondary, fontWeight: isActive ? '700' : '400' },
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Task list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[Typography.h3, { color: colors.textSecondary, textAlign: 'center' }]}>
              {t('tasksEmpty')}
            </Text>
            <Text style={[Typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm }]}>
              {t('tasksEmptyDesc')}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
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
  innerContainer: {
    flex: 1,
    width: '100%',
  },
  innerContainerWide: {
    maxWidth: 1080,
    alignSelf: 'center',
    paddingHorizontal: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  backBtn: {
    padding: 4,
  },
  fabInline: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.screenPadding,
    borderBottomWidth: 1,
  },
  filterTab: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    marginRight: Spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  listContent: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.card,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  priorityStripe: {
    width: 4,
    alignSelf: 'stretch',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.md,
    marginVertical: Spacing.md,
  },
  taskContent: {
    flex: 1,
    paddingLeft: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  badgeEmoji: {
    fontSize: 11,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: Spacing.md,
    gap: Spacing.sm,
  },
  actionBtn: {
    padding: 4,
  },
  emptyState: {
    paddingTop: Spacing.xxxl * 2,
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
  },
});
