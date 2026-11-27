import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput as RNTextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { Sparkles, ArrowRight, Check, Send } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n';
import { Spacing, Radius } from '../theme/spacing';
import { FadeRiseView } from '../components/common/FadeRiseView';
import { ModuleCategory } from '../types';
import { useLifeProfileStore, useHabitStore } from '../store';

interface OnboardingScreenProps {
  userName?: string;
  onComplete: () => void;
  onSkip: () => void;
}

const LIFE_STAGES = [
  { key: 'student', tr: 'Öğrenci', en: 'Student' },
  { key: 'working', tr: 'Çalışan', en: 'Working Professional' },
  { key: 'job_seeker', tr: 'İş Arayan', en: 'Job Seeker' },
  { key: 'entrepreneur', tr: 'Girişimci', en: 'Entrepreneur' },
  { key: 'freelancer', tr: 'Serbest Çalışan', en: 'Freelancer' },
];

const FOCUS_AREA_OPTIONS: { key: ModuleCategory; color: string; tr: string; en: string }[] = [
  { key: 'career', color: '#FFB454', tr: 'Kariyer', en: 'Career' },
  { key: 'academic', color: '#5FD6E8', tr: 'Akademik', en: 'Academic' },
  { key: 'health', color: '#FF8FA3', tr: 'Sağlık', en: 'Health' },
  { key: 'finance', color: '#7BE3A1', tr: 'Finans', en: 'Finance' },
  { key: 'learning', color: '#C9A6FF', tr: 'Öğrenme', en: 'Learning' },
  { key: 'social', color: '#F5E06B', tr: 'Sosyal', en: 'Social' },
  { key: 'personal', color: '#8FA2FF', tr: 'Kişisel', en: 'Personal' },
];

const GOAL_EXAMPLES = {
  tr: [
    'Kariyerimde ilerlemek ve iş bulmak',
    'Akademik hedeflerime ulaşmak',
    'Daha düzenli ve disiplinli yaşamak',
    'Sağlığıma ve kendime daha fazla zaman ayırmak',
    'Finansal durumumu kontrol altına almak',
  ],
  en: [
    'Advance my career and land a great role',
    'Stay on top of my academic goals',
    'Build a more structured and disciplined routine',
    'Invest more time in health and well-being',
    'Take full control of my personal finances',
  ],
};

const PEAK_TIMES = [
  { key: 'morning', tr: 'Sabahçı (06:00 – 12:00)', en: 'Morning (06:00 – 12:00)' },
  { key: 'afternoon', tr: 'Gündüz (12:00 – 18:00)', en: 'Afternoon (12:00 – 18:00)' },
  { key: 'evening', tr: 'Akşam / Gece (18:00 – 00:00)', en: 'Evening / Night (18:00 – 00:00)' },
];

const MENTOR_STYLES = [
  { key: 'supportive', tr: 'Destekleyici & Sakin', en: 'Supportive & Calm' },
  { key: 'direct', tr: 'Net & Disiplinli', en: 'Direct & Disciplined' },
  { key: 'concise', tr: 'Kısa & Öz', en: 'Short & Concise' },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  userName = 'Merve',
  onComplete,
  onSkip,
}) => {
  const { colors, isDark } = useTheme();
  const { language } = useI18n();
  const saveOnboarding = useLifeProfileStore((s) => s.saveOnboarding);
  const { addHabit, addGoal } = useHabitStore();

  const [step, setStep] = useState(1); // 1..6 (6 = approval summary)
  const [lifeStage, setLifeStage] = useState('');
  const [focusAreas, setFocusAreas] = useState<ModuleCategory[]>([]);
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [customGoalText, setCustomGoalText] = useState('');
  const [peakTime, setPeakTime] = useState('');
  const [mentorStyle, setMentorStyle] = useState('');
  const [includeStarterPlan, setIncludeStarterPlan] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const breatheAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const useNativeDriver = Platform.OS !== 'web';
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1.08,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver,
        }),
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [breatheAnim]);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
  }, [step]);

  const toggleArea = (key: ModuleCategory) => {
    setFocusAreas((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Rule-based starter suggestions derived from user's chosen focus areas
  const starterSuggestions = useMemo(() => {
    const primaryArea: ModuleCategory = focusAreas[0] || 'personal';
    const secondaryArea: ModuleCategory = focusAreas[1] || 'health';

    const habitByArea: Record<ModuleCategory, { tr: string; en: string }> = {
      career: { tr: '45 dk kariyer & proje geliştirme', en: '45m career & portfolio work' },
      academic: { tr: '1 saat ders & konu tekrarı', en: '1h focused study review' },
      health: { tr: '30 dk yürüyüş & 2L su', en: '30m walk & 2L water' },
      finance: { tr: 'Günlük harcama kontrolü (5 dk)', en: 'Daily expense check (5m)' },
      learning: { tr: '20 dk dil / kitap okuma', en: '20m language / reading' },
      social: { tr: 'Sevdiğin birine mesaj at / ara', en: 'Reach out to a friend' },
      personal: { tr: 'Akşam 10 dk gün sonu planlaması', en: '10m evening reflection' },
      ai: { tr: 'Günlük odak özetini incele', en: 'Review daily focus summary' },
    };

    return {
      habits: [
        { title: habitByArea[primaryArea][language], category: primaryArea, targetPerWeek: 5 },
        { title: habitByArea[secondaryArea][language], category: secondaryArea, targetPerWeek: 5 },
      ],
      goal: {
        title: primaryGoal || (language === 'tr' ? 'İlk haftalık odak hedefim' : 'My first weekly focus goal'),
        category: primaryArea,
        period: 'weekly' as const,
        targetCount: 5,
      },
    };
  }, [focusAreas, primaryGoal, language]);

  const handleConfirm = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setError(null);
    try {
      await saveOnboarding({
        lifeStage: lifeStage || 'personal',
        focusAreas: focusAreas.length > 0 ? focusAreas : ['personal'],
        primaryGoal: primaryGoal || (language === 'tr' ? 'Daha düzenli bir yaşam' : 'A more organized life'),
        peakTime: peakTime || 'morning',
        mentorStyle: mentorStyle || 'supportive',
      });

      if (includeStarterPlan) {
        await Promise.all([
          ...starterSuggestions.habits.map((h) => addHabit(h)),
          addGoal(starterSuggestions.goal),
        ]);
      }

      setIsSaving(false);
      onComplete();
    } catch (err) {
      setIsSaving(false);
      setError(err instanceof Error ? err.message : 'Profil kaydedilemedi.');
    }
  };

  const labelForStage = (key: string) => {
    const found = LIFE_STAGES.find((s) => s.key === key);
    return found ? (language === 'tr' ? found.tr : found.en) : key;
  };
  const labelForPeak = (key: string) => {
    const found = PEAK_TIMES.find((p) => p.key === key);
    return found ? (language === 'tr' ? found.tr : found.en) : key;
  };
  const labelForStyle = (key: string) => {
    const found = MENTOR_STYLES.find((m) => m.key === key);
    return found ? (language === 'tr' ? found.tr : found.en) : key;
  };

  const renderMentorBubble = (text: string, delay = 0) => (
    <FadeRiseView delay={delay} style={styles.mentorRow}>
      <View style={[styles.smallAvatar, { backgroundColor: colors.primary }]}>
        <Sparkles size={14} color={colors.primaryText} />
      </View>
      <View
        style={[
          styles.mentorBubble,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.bubbleText, { color: colors.textPrimary }]}>{text}</Text>
      </View>
    </FadeRiseView>
  );

  const renderUserBubble = (text: string) => (
    <FadeRiseView delay={0} style={styles.userRow}>
      <View style={[styles.userBubble, { backgroundColor: colors.primary }]}>
        <Text style={[styles.userBubbleText, { color: colors.primaryText }]}>{text}</Text>
      </View>
    </FadeRiseView>
  );

  const progressPct = Math.min(100, Math.round(((step - 1) / 5) * 100));

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.topHeader, { borderBottomColor: colors.border }]}>
          <View style={styles.mentorBrand}>
            <Animated.View
              style={[
                styles.mentorOrb,
                { backgroundColor: colors.primary, transform: [{ scale: breatheAnim }] },
              ]}
            >
              <Sparkles size={20} color={colors.primaryText} />
            </Animated.View>
            <View>
              <Text style={[styles.mentorName, { color: colors.textPrimary }]}>
                LifeOS Mentor
              </Text>
              <Text style={[styles.mentorRole, { color: colors.textSecondary }]}>
                {language === 'tr' ? 'Kişisel asistanın · Tanışma' : 'Your personal assistant · Onboarding'}
              </Text>
            </View>
          </View>

          <Pressable onPress={onSkip} hitSlop={8}>
            <Text style={[styles.skipText, { color: colors.textSecondary }]}>
              {language === 'tr' ? 'Şimdilik geç' : 'Skip for now'}
            </Text>
          </Pressable>
        </View>

        {/* Progress Bar */}
        <View style={[styles.progressTrack, { backgroundColor: colors.surfaceElevated }]}>
          <View
            style={[
              styles.progressFill,
              { width: `${progressPct}%`, backgroundColor: colors.primary },
            ]}
          />
        </View>

        {/* Conversation Feed */}
        <ScrollView
          ref={scrollRef}
          style={styles.chatScroll}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {/* STEP 1 */}
          {renderMentorBubble(
            language === 'tr'
              ? `Merhaba ${userName}! Ben LifeOS. Seni daha iyi tanıyıp ekranlarını sana göre şekillendirmek istiyorum.\n\nÖncelikle, şu an hayatının hangi dönemindesin?`
              : `Hi ${userName}! I'm LifeOS. I'd love to get to know you so I can tailor your workspace.\n\nFirst, what best describes your current life stage?`
          )}

          {lifeStage ? renderUserBubble(labelForStage(lifeStage)) : null}

          {step === 1 && (
            <FadeRiseView delay={120} style={styles.optionsWrap}>
              {LIFE_STAGES.map((item) => (
                <Pressable
                  key={item.key}
                  onPress={() => {
                    setLifeStage(item.key);
                    setStep(2);
                  }}
                  style={({ pressed }) => [
                    styles.choicePill,
                    {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Text style={[styles.choiceText, { color: colors.textPrimary }]}>
                    {language === 'tr' ? item.tr : item.en}
                  </Text>
                </Pressable>
              ))}
            </FadeRiseView>
          )}

          {/* STEP 2 */}
          {step >= 2 &&
            renderMentorBubble(
              language === 'tr'
                ? 'Harika! Peki şu dönemde en çok hangi yaşam alanlarına odaklanmak istiyorsun? (Birden fazla seçebilirsin)'
                : 'Great! Which life areas do you want to prioritize right now? (Select all that apply)'
            )}

          {step > 2 &&
            renderUserBubble(
              focusAreas
                .map((k) => {
                  const found = FOCUS_AREA_OPTIONS.find((o) => o.key === k);
                  return found ? (language === 'tr' ? found.tr : found.en) : k;
                })
                .join(', ')
            )}

          {step === 2 && (
            <FadeRiseView delay={100} style={styles.stepBlock}>
              <View style={styles.optionsWrap}>
                {FOCUS_AREA_OPTIONS.map((area) => {
                  const active = focusAreas.includes(area.key);
                  return (
                    <Pressable
                      key={area.key}
                      onPress={() => toggleArea(area.key)}
                      style={[
                        styles.choicePill,
                        {
                          backgroundColor: active ? area.color : colors.surfaceElevated,
                          borderColor: active ? area.color : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.choiceText,
                          { color: active ? '#0E1029' : colors.textPrimary },
                        ]}
                      >
                        {language === 'tr' ? area.tr : area.en}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Pressable
                disabled={focusAreas.length === 0}
                onPress={() => setStep(3)}
                style={[
                  styles.continueBtn,
                  {
                    backgroundColor: colors.primary,
                    opacity: focusAreas.length === 0 ? 0.45 : 1,
                  },
                ]}
              >
                <Text style={[styles.continueText, { color: colors.primaryText }]}>
                  {language === 'tr' ? 'Devam et' : 'Continue'}
                </Text>
                <ArrowRight size={16} color={colors.primaryText} />
              </Pressable>
            </FadeRiseView>
          )}

          {/* STEP 3 */}
          {step >= 3 &&
            renderMentorBubble(
              language === 'tr'
                ? 'Şu anda hayatında değiştirmek veya başarmak istediğin en önemli hedef ne? Aşağıdan seçebilir ya da kendi cümlenle yazabilirsin.'
                : 'What is the single most important goal you want to achieve right now? Pick one below or type your own.'
            )}

          {step > 3 && renderUserBubble(primaryGoal)}

          {step === 3 && (
            <FadeRiseView delay={100} style={styles.stepBlock}>
              <View style={styles.optionsWrap}>
                {GOAL_EXAMPLES[language].map((example) => (
                  <Pressable
                    key={example}
                    onPress={() => {
                      setPrimaryGoal(example);
                      setStep(4);
                    }}
                    style={[
                      styles.choicePill,
                      { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                    ]}
                  >
                    <Text style={[styles.choiceText, { color: colors.textPrimary }]}>{example}</Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.customInputRow}>
                <RNTextInput
                  style={[
                    styles.customInput,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                    },
                  ]}
                  placeholder={
                    language === 'tr' ? 'Kendi cümlenle yaz…' : 'Type in your own words…'
                  }
                  placeholderTextColor={colors.textSecondary}
                  value={customGoalText}
                  onChangeText={setCustomGoalText}
                  onSubmitEditing={() => {
                    if (customGoalText.trim()) {
                      setPrimaryGoal(customGoalText.trim());
                      setStep(4);
                    }
                  }}
                />
                <Pressable
                  onPress={() => {
                    if (customGoalText.trim()) {
                      setPrimaryGoal(customGoalText.trim());
                      setStep(4);
                    }
                  }}
                  style={[styles.sendBtn, { backgroundColor: colors.primary }]}
                >
                  <Send size={16} color={colors.primaryText} />
                </Pressable>
              </View>
            </FadeRiseView>
          )}

          {/* STEP 4 */}
          {step >= 4 &&
            renderMentorBubble(
              language === 'tr'
                ? 'Günün hangi saatlerinde zihnin en açık ve en verimli oluyor?'
                : 'What time of day do you feel most focused and energized?'
            )}

          {step > 4 && renderUserBubble(labelForPeak(peakTime))}

          {step === 4 && (
            <FadeRiseView delay={100} style={styles.optionsWrap}>
              {PEAK_TIMES.map((p) => (
                <Pressable
                  key={p.key}
                  onPress={() => {
                    setPeakTime(p.key);
                    setStep(5);
                  }}
                  style={[
                    styles.choicePill,
                    { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                  ]}
                >
                  <Text style={[styles.choiceText, { color: colors.textPrimary }]}>
                    {language === 'tr' ? p.tr : p.en}
                  </Text>
                </Pressable>
              ))}
            </FadeRiseView>
          )}

          {/* STEP 5 */}
          {step >= 5 &&
            renderMentorBubble(
              language === 'tr'
                ? 'Son soru! Sana öneriler sunarken hangi tonda konuşmamı istersin?'
                : 'Last question! What tone would you like me to use when guiding you?'
            )}

          {step > 5 && renderUserBubble(labelForStyle(mentorStyle))}

          {step === 5 && (
            <FadeRiseView delay={100} style={styles.optionsWrap}>
              {MENTOR_STYLES.map((m) => (
                <Pressable
                  key={m.key}
                  onPress={() => {
                    setMentorStyle(m.key);
                    setStep(6);
                  }}
                  style={[
                    styles.choicePill,
                    { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                  ]}
                >
                  <Text style={[styles.choiceText, { color: colors.textPrimary }]}>
                    {language === 'tr' ? m.tr : m.en}
                  </Text>
                </Pressable>
              ))}
            </FadeRiseView>
          )}

          {/* STEP 6: APPROVAL SUMMARY CARD */}
          {step === 6 && (
            <FadeRiseView delay={120}>
              <View
                style={[
                  styles.summaryCard,
                  { backgroundColor: isDark ? '#E7E9FF' : '#FFFFFF', borderColor: colors.border },
                ]}
              >
                <Text style={styles.summaryTitle}>
                  {language === 'tr'
                    ? 'Yörüngen hazır! Onaylarsan bunları kurayım:'
                    : 'Your orbit is ready! Approve to set up:'}
                </Text>

                <Text style={styles.summaryMeta}>
                  {`${labelForStage(lifeStage)} · ${labelForPeak(peakTime)}`}
                </Text>
                <Text style={styles.summaryGoal}>“{primaryGoal}”</Text>

                <Pressable
                  onPress={() => setIncludeStarterPlan((prev) => !prev)}
                  style={styles.starterToggleRow}
                >
                  <View
                    style={[
                      styles.checkbox,
                      includeStarterPlan && { backgroundColor: '#14173A', borderColor: '#14173A' },
                    ]}
                  >
                    {includeStarterPlan && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.starterToggleTitle}>
                      {language === 'tr'
                        ? 'Önerilen 2 alışkanlık ve 1 başlangıç hedefini ekle'
                        : 'Add 2 suggested habits and 1 starter goal'}
                    </Text>
                    <Text style={styles.starterToggleSub}>
                      {starterSuggestions.habits.map((h) => h.title).join(' • ')}
                    </Text>
                  </View>
                </Pressable>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <Pressable
                  onPress={handleConfirm}
                  disabled={isSaving}
                  style={[styles.confirmBtn, isSaving && { opacity: 0.7 }]}
                >
                  {isSaving && <ActivityIndicator size="small" color="#FFFFFF" />}
                  <Text style={styles.confirmBtnText}>
                    {language === 'tr'
                      ? 'Onayla ve Yörüngemi Kur'
                      : 'Approve & Launch My Orbit'}
                  </Text>
                </Pressable>
              </View>
            </FadeRiseView>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 740,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  mentorBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mentorOrb: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mentorName: {
    fontSize: 17,
    fontWeight: '700',
  },
  mentorRole: {
    fontSize: 12,
    fontWeight: '500',
  },
  skipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressTrack: {
    height: 4,
    width: '100%',
  },
  progressFill: {
    height: '100%',
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.xl,
    paddingBottom: 60,
    gap: 16,
  },
  mentorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    maxWidth: '90%',
  },
  smallAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  mentorBubble: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 22,
    borderTopLeftRadius: 6,
    borderWidth: 1,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  userRow: {
    alignItems: 'flex-end',
  },
  userBubble: {
    maxWidth: '82%',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 22,
    borderBottomRightRadius: 6,
  },
  userBubbleText: {
    fontSize: 15,
    fontWeight: '700',
  },
  stepBlock: {
    gap: 14,
    paddingLeft: 38,
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingLeft: 38,
  },
  choicePill: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  choiceText: {
    fontSize: 14,
    fontWeight: '600',
  },
  continueBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 44,
    paddingHorizontal: 22,
    borderRadius: Radius.pill,
    marginLeft: 38,
  },
  continueText: {
    fontSize: 14,
    fontWeight: '700',
  },
  customInputRow: {
    flexDirection: 'row',
    gap: 10,
    paddingLeft: 38,
  },
  customInput: {
    flex: 1,
    height: 48,
    borderRadius: Radius.pill,
    borderWidth: 1,
    paddingHorizontal: 18,
    fontSize: 15,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    gap: 12,
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#14173A',
  },
  summaryMeta: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3E426E',
  },
  summaryGoal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#14173A',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
  },
  starterToggleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#6A6FA8',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  starterToggleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#14173A',
  },
  starterToggleSub: {
    fontSize: 12,
    color: '#3E426E',
    marginTop: 2,
  },
  errorText: {
    color: '#A3123A',
    fontSize: 13,
    fontWeight: '600',
  },
  confirmBtn: {
    height: 52,
    borderRadius: Radius.pill,
    backgroundColor: '#14173A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 6,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
