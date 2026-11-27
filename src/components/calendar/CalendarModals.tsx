import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput as RNTextInput,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { X, Calendar, Clock, Check, Trash2, Edit3, ArrowRight } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useI18n } from '../../i18n';
import { Spacing, Radius } from '../../theme/spacing';
import { Task, TaskPriority, CreateTaskInput } from '../../types/task';
import { ModuleCategory } from '../../types';
import { addDays, formatFullDate, parseIsoDate, toIsoDate } from '../../utils/calendarUtils';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onToggle: (id: string) => void;
  onRescheduleTomorrow: (task: Task) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  onToggle,
  onRescheduleTomorrow,
  onEdit,
  onDelete,
}) => {
  const { colors } = useTheme();
  const { t, language } = useI18n();

  if (!task) return null;

  const modColor = colors.modules[task.category] || colors.primary;
  const isCompleted = task.status === 'completed';

  return (
    <Modal visible={!!task} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.overlay, { backgroundColor: colors.overlay }]} onPress={onClose}>
        <Pressable
          style={[styles.detailCard, { backgroundColor: '#FFFFFF' }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.detailTopRow}>
            <Text style={styles.detailTitle} numberOfLines={2}>
              {task.title}
            </Text>
            <Pressable onPress={onClose} hitSlop={8} style={styles.closeBtn}>
              <X size={20} color="#3E426E" />
            </Pressable>
          </View>

          {task.description ? (
            <Text style={styles.detailDesc}>{task.description}</Text>
          ) : null}

          <View style={styles.infoRow}>
            <Calendar size={16} color="#3E426E" />
            <Text style={styles.infoText}>
              {task.dueDate
                ? formatFullDate(parseIsoDate(task.dueDate), language)
                : t('calendarAllDay')}
            </Text>
          </View>

          {task.dueTime ? (
            <View style={styles.infoRow}>
              <Clock size={16} color="#3E426E" />
              <Text style={styles.infoText}>{task.dueTime}</Text>
            </View>
          ) : null}

          <View style={styles.badgesRow}>
            <View style={[styles.tagPill, { backgroundColor: modColor }]}>
              <Text style={styles.tagPillText}>
                {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
              </Text>
            </View>
            <View style={[styles.tagPill, { backgroundColor: '#E7E9FF' }]}>
              <Text style={styles.tagPillText}>
                {task.priority === 'high'
                  ? t('taskPriorityHigh')
                  : task.priority === 'medium'
                    ? t('taskPriorityMedium')
                    : t('taskPriorityLow')}
              </Text>
            </View>
            <View
              style={[
                styles.tagPill,
                { backgroundColor: isCompleted ? '#7BE3A1' : '#F3F4F6' },
              ]}
            >
              <Text style={styles.tagPillText}>
                {isCompleted ? t('taskStatusCompleted') : t('taskStatusActive')}
              </Text>
            </View>
          </View>

          <View style={styles.actionStack}>
            <Pressable
              onPress={() => {
                onToggle(task.id);
                onClose();
              }}
              style={[styles.darkPrimaryBtn, { backgroundColor: '#14173A' }]}
            >
              <Check size={16} color="#FFFFFF" />
              <Text style={styles.darkPrimaryBtnText}>
                {isCompleted ? t('taskMarkActive') : t('taskMarkComplete')}
              </Text>
            </Pressable>

            <View style={styles.secondaryActionsRow}>
              <Pressable
                onPress={() => {
                  onRescheduleTomorrow(task);
                  onClose();
                }}
                style={styles.softActionBtn}
              >
                <ArrowRight size={14} color="#26307A" />
                <Text style={styles.softActionText}>{t('calendarRescheduleTomorrow')}</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  onClose();
                  onEdit(task.id);
                }}
                style={styles.softActionBtn}
              >
                <Edit3 size={14} color="#26307A" />
                <Text style={styles.softActionText}>{t('calendarEdit')}</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  onDelete(task.id);
                  onClose();
                }}
                style={[styles.softActionBtn, { backgroundColor: '#FEE2E2' }]}
              >
                <Trash2 size={14} color="#B91C1C" />
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

interface QuickAddCalendarModalProps {
  visible: boolean;
  initialDate: Date;
  initialHour?: number | null;
  onClose: () => void;
  onCreate: (input: CreateTaskInput) => Promise<void>;
}

const CATEGORIES: { key: ModuleCategory; color: string; tr: string; en: string }[] = [
  { key: 'personal', color: '#8FA2FF', tr: 'Kişisel', en: 'Personal' },
  { key: 'career', color: '#FFB454', tr: 'Kariyer', en: 'Career' },
  { key: 'academic', color: '#5FD6E8', tr: 'Akademik', en: 'Academic' },
  { key: 'finance', color: '#7BE3A1', tr: 'Finans', en: 'Finance' },
  { key: 'health', color: '#FF8FA3', tr: 'Sağlık', en: 'Health' },
  { key: 'learning', color: '#C9A6FF', tr: 'Öğrenme', en: 'Learning' },
  { key: 'social', color: '#F5E06B', tr: 'Sosyal', en: 'Social' },
];

export const QuickAddCalendarModal: React.FC<QuickAddCalendarModalProps> = ({
  visible,
  initialDate,
  initialHour,
  onClose,
  onCreate,
}) => {
  const { colors } = useTheme();
  const { t, language } = useI18n();

  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(toIsoDate(initialDate));
  const [dueTime, setDueTime] = useState('');
  const [category, setCategory] = useState<ModuleCategory>('personal');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setTitle('');
      setDueDate(toIsoDate(initialDate));
      setDueTime(initialHour != null ? `${String(initialHour).padStart(2, '0')}:00` : '10:00');
      setCategory('personal');
      setPriority('medium');
      setError(null);
    }
  }, [visible, initialDate, initialHour]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError(t('taskTitleRequired'));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onCreate({
        title: title.trim(),
        priority,
        category,
        dueDate: dueDate.trim() || toIsoDate(initialDate),
        dueTime: dueTime.trim() || undefined,
      });
      setSaving(false);
      onClose();
    } catch (err) {
      setSaving(false);
      setError(err instanceof Error ? err.message : 'Kaydedilemedi.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.overlay, { backgroundColor: colors.overlay }]} onPress={onClose}>
        <Pressable
          style={[styles.detailCard, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.detailTopRow}>
            <Text style={[styles.modalHeading, { color: colors.textPrimary }]}>
              {t('taskNewTitle')}
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

          <RNTextInput
            style={[
              styles.modalInput,
              { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.textPrimary },
            ]}
            placeholder={t('taskTitlePlaceholder')}
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={(v) => {
              setTitle(v);
              if (error) setError(null);
            }}
            autoFocus
            onSubmitEditing={handleSave}
          />

          <View style={styles.dateRow}>
            <RNTextInput
              style={[
                styles.modalInput,
                styles.halfInput,
                { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.textPrimary },
              ]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textSecondary}
              value={dueDate}
              onChangeText={setDueDate}
            />
            <RNTextInput
              style={[
                styles.modalInput,
                styles.halfInput,
                { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.textPrimary },
              ]}
              placeholder="09:00"
              placeholderTextColor={colors.textSecondary}
              value={dueTime}
              onChangeText={setDueTime}
            />
          </View>

          {/* Category Chips */}
          <Text style={[styles.sectionMiniLabel, { color: colors.textSecondary }]}>
            {t('taskCategoryLabel')}
          </Text>
          <View style={styles.chipsWrap}>
            {CATEGORIES.map((c) => {
              const active = category === c.key;
              return (
                <Pressable
                  key={c.key}
                  onPress={() => setCategory(c.key)}
                  style={[
                    styles.selectChip,
                    {
                      backgroundColor: active ? c.color : colors.surfaceElevated,
                      borderColor: active ? c.color : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.selectChipText,
                      { color: active ? '#0E1029' : colors.textPrimary },
                    ]}
                  >
                    {language === 'tr' ? c.tr : c.en}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Priority Chips */}
          <Text style={[styles.sectionMiniLabel, { color: colors.textSecondary }]}>
            {t('taskPriorityLabel')}
          </Text>
          <View style={styles.chipsWrap}>
            {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => {
              const active = priority === p;
              return (
                <Pressable
                  key={p}
                  onPress={() => setPriority(p)}
                  style={[
                    styles.selectChip,
                    {
                      backgroundColor: active ? colors.primary : colors.surfaceElevated,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.selectChipText,
                      { color: active ? colors.primaryText : colors.textPrimary },
                    ]}
                  >
                    {p === 'high'
                      ? t('taskPriorityHigh')
                      : p === 'medium'
                        ? t('taskPriorityMedium')
                        : t('taskPriorityLow')}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={[
              styles.darkPrimaryBtn,
              { backgroundColor: colors.primary, marginTop: 14, opacity: saving ? 0.7 : 1 },
            ]}
          >
            {saving && <ActivityIndicator size="small" color={colors.primaryText} />}
            <Text style={[styles.darkPrimaryBtnText, { color: colors.primaryText }]}>
              {t('taskSaveButton')}
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export function getTomorrowDateIso(dueDate?: string): string {
  const base = dueDate ? parseIsoDate(dueDate) : new Date();
  return toIsoDate(addDays(base, 1));
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.screenPadding,
  },
  detailCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    padding: 22,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
  },
  detailTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#14173A',
  },
  detailDesc: {
    fontSize: 14,
    color: '#3E426E',
    lineHeight: 20,
  },
  closeBtn: {
    padding: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F3F4FF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#14173A',
    textTransform: 'capitalize',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  tagPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.pill,
  },
  tagPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0E1029',
  },
  actionStack: {
    gap: 10,
    marginTop: 6,
  },
  darkPrimaryBtn: {
    height: 48,
    borderRadius: Radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  darkPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  softActionBtn: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF0FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 10,
  },
  softActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#26307A',
  },
  modalHeading: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalInput: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '500',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  sectionMiniLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  selectChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  errorText: {
    color: '#FF8FA3',
    fontSize: 13,
    fontWeight: '600',
  },
});
