import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput as RNTextInput,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useI18n } from '../../i18n';
import { Spacing, Radius } from '../../theme/spacing';
import { ModuleCategory } from '../../types';
import { CreateGoalInput, CreateHabitInput, GoalPeriod } from '../../types/habit';

const CATEGORIES: { key: ModuleCategory; color: string; tr: string; en: string }[] = [
  { key: 'health', color: '#FF8FA3', tr: 'Sağlık', en: 'Health' },
  { key: 'learning', color: '#C9A6FF', tr: 'Öğrenme', en: 'Learning' },
  { key: 'career', color: '#FFB454', tr: 'Kariyer', en: 'Career' },
  { key: 'academic', color: '#5FD6E8', tr: 'Akademik', en: 'Academic' },
  { key: 'finance', color: '#7BE3A1', tr: 'Finans', en: 'Finance' },
  { key: 'personal', color: '#8FA2FF', tr: 'Kişisel', en: 'Personal' },
];

interface NewHabitModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (input: CreateHabitInput) => Promise<void>;
}

export const NewHabitModal: React.FC<NewHabitModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const { colors } = useTheme();
  const { language } = useI18n();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ModuleCategory>('health');
  const [targetPerWeek, setTargetPerWeek] = useState(5);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setTitle('');
      setCategory('health');
      setTargetPerWeek(5);
      setError(null);
    }
  }, [visible]);

  const handleSave = async () => {
    if (!title.trim() || saving) return;
    setSaving(true);
    setError(null);
    try {
      await onSave({ title: title.trim(), category, targetPerWeek });
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
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Text style={[styles.heading, { color: colors.textPrimary }]}>
              {language === 'tr' ? 'Yeni Alışkanlık' : 'New Habit'}
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

          <RNTextInput
            style={[
              styles.input,
              { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.textPrimary },
            ]}
            placeholder={language === 'tr' ? 'ör. 30 dk kitap oku' : 'e.g. Read 30 mins'}
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
            autoFocus
            onSubmitEditing={handleSave}
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {language === 'tr' ? 'Kategori' : 'Category'}
          </Text>
          <View style={styles.chipsWrap}>
            {CATEGORIES.map((c) => {
              const active = category === c.key;
              return (
                <Pressable
                  key={c.key}
                  onPress={() => setCategory(c.key)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? c.color : colors.surfaceElevated,
                      borderColor: active ? c.color : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.chipText, { color: active ? '#0E1029' : colors.textPrimary }]}>
                    {language === 'tr' ? c.tr : c.en}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {language === 'tr' ? `Haftalık hedef: ${targetPerWeek} gün` : `Weekly target: ${targetPerWeek} days`}
          </Text>
          <View style={styles.chipsWrap}>
            {[3, 4, 5, 6, 7].map((n) => (
              <Pressable
                key={n}
                onPress={() => setTargetPerWeek(n)}
                style={[
                  styles.dayPill,
                  {
                    backgroundColor: targetPerWeek === n ? colors.primary : colors.surfaceElevated,
                    borderColor: targetPerWeek === n ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: targetPerWeek === n ? colors.primaryText : colors.textPrimary },
                  ]}
                >
                  {n}
                </Text>
              </Pressable>
            ))}
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: saving ? 0.7 : 1 }]}
          >
            <Text style={[styles.saveBtnText, { color: colors.primaryText }]}>
              {language === 'tr' ? 'Alışkanlığı Kaydet' : 'Save Habit'}
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

interface NewGoalModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (input: CreateGoalInput) => Promise<void>;
}

export const NewGoalModal: React.FC<NewGoalModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const { colors } = useTheme();
  const { language } = useI18n();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ModuleCategory>('career');
  const [period, setPeriod] = useState<GoalPeriod>('weekly');
  const [targetCount, setTargetCount] = useState('5');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setTitle('');
      setDescription('');
      setCategory('career');
      setPeriod('weekly');
      setTargetCount('5');
      setError(null);
    }
  }, [visible]);

  const handleSave = async () => {
    if (!title.trim() || saving) return;
    setSaving(true);
    setError(null);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        period,
        targetCount: Math.max(1, parseInt(targetCount, 10) || 1),
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
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Text style={[styles.heading, { color: colors.textPrimary }]}>
              {language === 'tr' ? 'Yeni Hedef' : 'New Goal'}
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

          <RNTextInput
            style={[
              styles.input,
              { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.textPrimary },
            ]}
            placeholder={language === 'tr' ? 'ör. Haftalık 3 proje modülü bitir' : 'e.g. Finish 3 project modules'}
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
            autoFocus
          />

          <RNTextInput
            style={[
              styles.input,
              { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.textPrimary },
            ]}
            placeholder={language === 'tr' ? 'Açıklama (isteğe bağlı)' : 'Description (optional)'}
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
          />

          <View style={styles.rowGap}>
            {(['weekly', 'monthly'] as GoalPeriod[]).map((p) => (
              <Pressable
                key={p}
                onPress={() => setPeriod(p)}
                style={[
                  styles.periodBtn,
                  {
                    backgroundColor: period === p ? colors.primary : colors.surfaceElevated,
                    borderColor: period === p ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: period === p ? colors.primaryText : colors.textPrimary },
                  ]}
                >
                  {p === 'weekly'
                    ? language === 'tr'
                      ? 'Haftalık'
                      : 'Weekly'
                    : language === 'tr'
                      ? 'Aylık'
                      : 'Monthly'}
                </Text>
              </Pressable>
            ))}

            <RNTextInput
              style={[
                styles.input,
                {
                  width: 84,
                  textAlign: 'center',
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="5"
              keyboardType="number-pad"
              value={targetCount}
              onChangeText={(v) => setTargetCount(v.replace(/[^0-9]/g, ''))}
            />
          </View>

          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {language === 'tr' ? 'Kategori' : 'Category'}
          </Text>
          <View style={styles.chipsWrap}>
            {CATEGORIES.map((c) => {
              const active = category === c.key;
              return (
                <Pressable
                  key={c.key}
                  onPress={() => setCategory(c.key)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? c.color : colors.surfaceElevated,
                      borderColor: active ? c.color : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.chipText, { color: active ? '#0E1029' : colors.textPrimary }]}>
                    {language === 'tr' ? c.tr : c.en}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: saving ? 0.7 : 1 }]}
          >
            <Text style={[styles.saveBtnText, { color: colors.primaryText }]}>
              {language === 'tr' ? 'Hedefi Kaydet' : 'Save Goal'}
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.screenPadding,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
  },
  input: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  dayPill: {
    width: 38,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  rowGap: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  periodBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    height: 48,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  errorText: {
    color: '#FF8FA3',
    fontSize: 13,
    fontWeight: '600',
  },
});
