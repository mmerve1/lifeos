import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { ArrowLeft, ChevronDown } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n';
import { Typography } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { TextInput } from '../components/common/TextInput';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { InlineFeedback } from '../components/common/InlineFeedback';
import { useTaskStore } from '../store/useTaskStore';
import { Task, TaskPriority, CreateTaskInput } from '../types/task';
import { ModuleCategory } from '../types';

interface TaskFormScreenProps {
  taskId?: string;       // If provided → edit mode
  onBack: () => void;
  onSaved: () => void;
}

type PriorityOption = { value: TaskPriority; labelKey: 'taskPriorityLow' | 'taskPriorityMedium' | 'taskPriorityHigh' };
type CategoryOption = { value: ModuleCategory; emoji: string; labelKey: string };

const PRIORITIES: PriorityOption[] = [
  { value: 'high', labelKey: 'taskPriorityHigh' },
  { value: 'medium', labelKey: 'taskPriorityMedium' },
  { value: 'low', labelKey: 'taskPriorityLow' },
];

const CATEGORIES: CategoryOption[] = [
  { value: 'personal', emoji: '🧭', labelKey: 'modulePersonal' },
  { value: 'career', emoji: '💼', labelKey: 'moduleCareer' },
  { value: 'academic', emoji: '🎓', labelKey: 'moduleAcademic' },
  { value: 'finance', emoji: '💰', labelKey: 'moduleFinance' },
  { value: 'health', emoji: '❤️', labelKey: 'moduleHealth' },
  { value: 'learning', emoji: '📚', labelKey: 'moduleLearning' },
  { value: 'social', emoji: '👥', labelKey: 'moduleSocial' },
];

import { TranslationKey } from '../i18n';

export const TaskFormScreen: React.FC<TaskFormScreenProps> = ({
  taskId,
  onBack,
  onSaved,
}) => {
  const { colors, isDark } = useTheme();
  const { t } = useI18n();
  const { tasks, createTask, updateTask } = useTaskStore();

  const isEdit = !!taskId;
  const existing: Task | undefined = isEdit ? tasks.find((t) => t.id === taskId) : undefined;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [priority, setPriority] = useState<TaskPriority>(existing?.priority ?? 'medium');
  const [category, setCategory] = useState<ModuleCategory>(existing?.category ?? 'personal');
  const [dueDate, setDueDate] = useState(existing?.dueDate ?? '');
  const [dueTime, setDueTime] = useState(existing?.dueTime ?? '');
  const [titleError, setTitleError] = useState<string | null>(null);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const priorityColor = (p: TaskPriority) => {
    if (p === 'high') return colors.danger;
    if (p === 'medium') return colors.warning;
    return colors.success;
  };

  const validate = () => {
    if (!title.trim()) {
      setTitleError(t('taskTitleRequired'));
      return false;
    }
    setTitleError(null);
    return true;
  };

  const handleSave = () => {
    if (!validate()) return;
    setIsSaving(true);

    setTimeout(() => {
      if (isEdit && taskId) {
        updateTask(taskId, {
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          category,
          dueDate: dueDate || undefined,
          dueTime: dueTime || undefined,
        });
      } else {
        const input: CreateTaskInput = {
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          category,
          dueDate: dueDate || undefined,
          dueTime: dueTime || undefined,
        };
        createTask(input);
      }
      setIsSaving(false);
      onSaved();
    }, 300);
  };

  const selectedPriority = PRIORITIES.find((p) => p.value === priority)!;
  const selectedCategory = CATEGORIES.find((c) => c.value === category)!;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header bar */}
      <View style={[styles.headerBar, { borderBottomColor: colors.border }]}>
        <Pressable onPress={onBack} hitSlop={8} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={[Typography.h3, { color: colors.textPrimary }]}>
          {isEdit ? t('taskEditTitle') : t('taskNewTitle')}
        </Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <TextInput
          label={t('taskTitleLabel')}
          placeholder={t('taskTitlePlaceholder')}
          value={title}
          onChangeText={(v) => { setTitle(v); setTitleError(null); }}
          error={titleError ?? undefined}
          autoFocus={!isEdit}
        />
        {titleError && <InlineFeedback type="error" message={titleError} />}

        {/* Description */}
        <TextInput
          label={t('taskDescLabel')}
          placeholder={t('taskDescPlaceholder')}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />

        {/* Priority selector */}
        <Text style={[Typography.label, { color: colors.textSecondary, marginBottom: Spacing.xs }]}>
          {t('taskPriorityLabel')}
        </Text>
        <Pressable
          onPress={() => { setShowPriorityPicker(!showPriorityPicker); setShowCategoryPicker(false); }}
          style={[styles.selector, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <View style={[styles.selectorDot, { backgroundColor: priorityColor(priority) }]} />
          <Text style={[Typography.body, { color: colors.textPrimary, flex: 1 }]}>
            {t(selectedPriority.labelKey)}
          </Text>
          <ChevronDown size={18} color={colors.textSecondary} />
        </Pressable>
        {showPriorityPicker && (
          <View style={[styles.pickerDropdown, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            {PRIORITIES.map((p) => (
              <Pressable
                key={p.value}
                onPress={() => { setPriority(p.value); setShowPriorityPicker(false); }}
                style={[
                  styles.pickerOption,
                  p.value === priority && { backgroundColor: colors.surfaceSubtle },
                ]}
              >
                <View style={[styles.selectorDot, { backgroundColor: priorityColor(p.value) }]} />
                <Text style={[Typography.body, { color: colors.textPrimary }]}>{t(p.labelKey)}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Category selector */}
        <Text style={[Typography.label, { color: colors.textSecondary, marginTop: Spacing.md, marginBottom: Spacing.xs }]}>
          {t('taskCategoryLabel')}
        </Text>
        <Pressable
          onPress={() => { setShowCategoryPicker(!showCategoryPicker); setShowPriorityPicker(false); }}
          style={[styles.selector, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Text style={styles.selectorEmoji}>{selectedCategory.emoji}</Text>
          <Text style={[Typography.body, { color: colors.textPrimary, flex: 1 }]}>
            {t(selectedCategory.labelKey as TranslationKey)}
          </Text>
          <ChevronDown size={18} color={colors.textSecondary} />
        </Pressable>
        {showCategoryPicker && (
          <View style={[styles.pickerDropdown, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            {CATEGORIES.map((c) => (
              <Pressable
                key={c.value}
                onPress={() => { setCategory(c.value); setShowCategoryPicker(false); }}
                style={[
                  styles.pickerOption,
                  c.value === category && { backgroundColor: colors.surfaceSubtle },
                ]}
              >
                <Text style={styles.selectorEmoji}>{c.emoji}</Text>
                <Text style={[Typography.body, { color: colors.textPrimary }]}>
                  {t(c.labelKey as TranslationKey)}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Due date & time */}
        <View style={styles.row}>
          <View style={styles.flex}>
            <TextInput
              label={t('taskDueDateLabel')}
              placeholder="YYYY-MM-DD"
              value={dueDate}
              onChangeText={setDueDate}
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.flex, { marginLeft: Spacing.sm }]}>
            <TextInput
              label={t('taskDueTimeLabel')}
              placeholder={t('taskDueTimePlaceholder')}
              value={dueTime}
              onChangeText={setDueTime}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Save button */}
        <View style={styles.saveButton}>
          <PrimaryButton
            label={isSaving ? t('loading') : (isEdit ? t('taskUpdateButton') : t('taskSaveButton'))}
            onPress={handleSave}
            disabled={isSaving}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    borderWidth: 1,
    borderRadius: Radius.input,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  selectorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  selectorEmoji: {
    fontSize: 16,
  },
  pickerDropdown: {
    borderWidth: 1,
    borderRadius: Radius.card,
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    marginTop: Spacing.xs,
  },
  flex: {
    flex: 1,
  },
  saveButton: {
    marginTop: Spacing.lg,
  },
});
