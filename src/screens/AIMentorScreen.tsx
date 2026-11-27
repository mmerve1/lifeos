import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Sparkles,
  Send,
  Plus,
  Check,
  X,
  Trash2,
  ShieldCheck,
  Brain,
  MessageSquare,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n';
import { Typography } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { useResponsive } from '../hooks/useResponsive';
import { WebSidebar } from '../components/web/WebSidebar';
import { BottomNavigation } from '../components/dashboard/BottomNavigation';
import { FadeRiseView } from '../components/common/FadeRiseView';
import { MentorAvatar } from '../components/mentor/MentorAvatar';
import { mentorApi } from '../api/mentorApi';
import { useLifeProfileStore } from '../store/useLifeProfileStore';
import { useTaskStore } from '../store/useTaskStore';
import {
  MentorConversation,
  MentorMemory,
  MentorMessage,
  MentorPermissions,
} from '../types/mentor';
import { NavTabType } from '../types';

interface AIMentorScreenProps {
  userName?: string;
  onNavigateToHome: () => void;
  onNavigateToTasks: () => void;
  onNavigateToCalendar: () => void;
  onNavigateToHabits: () => void;
  onNavigateToProfile?: () => void;
  onLogout: () => void;
}

type SidePanelTab = 'chats' | 'permissions' | 'memories';
type MobileViewTab = 'chat' | 'panel';

const DEFAULT_PERMISSIONS: MentorPermissions = {
  allowCalendar: true,
  allowTasks: true,
  allowHabits: true,
  allowCareer: true,
  allowFinance: false,
  allowHealth: false,
};

export const AIMentorScreen: React.FC<AIMentorScreenProps> = ({
  userName = 'Merve',
  onNavigateToHome,
  onNavigateToTasks,
  onNavigateToCalendar,
  onNavigateToHabits,
  onNavigateToProfile,
  onLogout,
}) => {
  const { colors, isDark } = useTheme();
  const { language } = useI18n();
  const { isWideScreen } = useResponsive();
  const { profile, loadProfile } = useLifeProfileStore();
  const { loadTasks } = useTaskStore();
  const isTr = language === 'tr';

  const [conversations, setConversations] = useState<MentorConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const [memories, setMemories] = useState<MentorMemory[]>([]);
  const [permissions, setPermissions] = useState<MentorPermissions>(DEFAULT_PERMISSIONS);

  const [inputText, setInputText] = useState('');
  const [newMemoryText, setNewMemoryText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [sideTab, setSideTab] = useState<SidePanelTab>('chats');
  const [mobileView, setMobileView] = useState<MobileViewTab>('chat');

  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);

  const quickPrompts = isTr
    ? [
        'Haftamı planla',
        'Hedeflerimi değerlendir',
        'İlerlememi analiz et',
        'Yarın 10:00 İngilizce görevi oluştur',
      ]
    : [
        'Plan my week',
        'Review my goals',
        'Analyze my progress',
        'Create a task to study English tomorrow at 10:00',
      ];

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 80);
  }, []);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [convList, memList, perms] = await Promise.all([
        mentorApi.getConversations(),
        mentorApi.getMemories(),
        mentorApi.getPermissions(),
      ]);
      setConversations(convList);
      setMemories(memList);
      setPermissions(perms);

      if (convList.length > 0) {
        const latest = convList[0];
        setActiveConversationId(latest.id);
        const msgs = await mentorApi.getMessages(latest.id);
        setMessages(msgs);
      } else {
        setActiveConversationId(null);
        setMessages([]);
      }
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : isTr
          ? 'Mentor verileri yüklenemedi.'
          : 'Failed to load mentor data.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [isTr]);

  useEffect(() => {
    loadProfile();
    loadInitialData();
  }, [loadProfile, loadInitialData]);

  const handleSelectConversation = async (convId: string) => {
    setActiveConversationId(convId);
    setMobileView('chat');
    try {
      const msgs = await mentorApi.getMessages(convId);
      setMessages(msgs);
      scrollToBottom();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error');
    }
  };

  const handleNewConversation = () => {
    setActiveConversationId(null);
    setMessages([]);
    setMobileView('chat');
  };

  const handleSend = async (overrideText?: string) => {
    const text = (overrideText ?? inputText).trim();
    if (!text || isSending) return;

    setInputText('');
    setIsSending(true);
    setErrorMsg(null);
    try {
      const res = await mentorApi.sendMessage({
        conversationId: activeConversationId,
        message: text,
        language,
      });

      setActiveConversationId(res.conversation.id);
      setMessages((prev) => [...prev, res.userMessage, res.assistantMessage]);
      setConversations((prev) => {
        const filtered = prev.filter((c) => c.id !== res.conversation.id);
        return [res.conversation, ...filtered];
      });
      scrollToBottom();
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : isTr
          ? 'Mesaj gönderilemedi.'
          : 'Failed to send message.'
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleResolveAction = async (messageId: string, approve: boolean) => {
    if (resolvingId) return;
    setResolvingId(messageId);
    setErrorMsg(null);
    try {
      const updated = await mentorApi.resolveAction(messageId, approve);
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? updated : m))
      );
      if (approve) {
        await loadTasks();
      }
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : isTr
          ? 'Aksiyon işlenemedi.'
          : 'Failed to process action.'
      );
    } finally {
      setResolvingId(null);
    }
  };

  const handleTogglePermission = async (key: keyof MentorPermissions) => {
    const next: MentorPermissions = {
      ...permissions,
      [key]: !permissions[key],
    };
    setPermissions(next);
    try {
      const saved = await mentorApi.updatePermissions(next);
      setPermissions(saved);
    } catch {
      setPermissions(permissions);
    }
  };

  const handleAddMemory = async () => {
    const trimmed = newMemoryText.trim();
    if (trimmed.length < 2) return;
    try {
      const created = await mentorApi.addMemory({
        content: trimmed,
        category: 'preference',
      });
      setMemories((prev) => [created, ...prev]);
      setNewMemoryText('');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error');
    }
  };

  const handleDeleteMemory = async (id: string) => {
    try {
      await mentorApi.deleteMemory(id);
      setMemories((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error');
    }
  };

  const handleNavTab = (tab: NavTabType) => {
    if (tab === 'home') onNavigateToHome();
    else if (tab === 'tasks') onNavigateToTasks();
    else if (tab === 'calendar') onNavigateToCalendar();
    else if (tab === 'habits') onNavigateToHabits();
    else if (tab === 'profile' && onNavigateToProfile) onNavigateToProfile();
  };

  const permissionItems: {
    key: keyof MentorPermissions;
    label: string;
    desc: string;
    accent: string;
  }[] = [
    {
      key: 'allowTasks',
      label: isTr ? 'Görevler' : 'Tasks',
      desc: isTr ? 'Aktif ve tamamlanan görevlerin' : 'Active & completed tasks',
      accent: '#8FA2FF',
    },
    {
      key: 'allowCalendar',
      label: isTr ? 'Takvim' : 'Calendar',
      desc: isTr ? 'Günlük ve haftalık programın' : 'Daily & weekly schedule',
      accent: '#5FD6E8',
    },
    {
      key: 'allowHabits',
      label: isTr ? 'Alışkanlık & Hedefler' : 'Habits & Goals',
      desc: isTr ? 'Seriler ve hedef ilerlemelerin' : 'Streaks & goal progress',
      accent: '#7BE3A1',
    },
    {
      key: 'allowCareer',
      label: isTr ? 'Kariyer' : 'Career',
      desc: isTr ? 'Başvurular ve kariyer hedefleri' : 'Applications & career goals',
      accent: '#FFB454',
    },
    {
      key: 'allowFinance',
      label: isTr ? 'Finans' : 'Finance',
      desc: isTr ? 'Bütçe ve harcama özetleri' : 'Budget & expense summaries',
      accent: '#C9A6FF',
    },
    {
      key: 'allowHealth',
      label: isTr ? 'Sağlık' : 'Health',
      desc: isTr ? 'Uyku ve iyi yaşam rutinleri' : 'Sleep & wellness routines',
      accent: '#FF8FA3',
    },
  ];

  const renderSidePanel = () => (
    <View
      style={[
        styles.sidePanel,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          width: isWideScreen ? 320 : '100%',
        },
      ]}
    >
      {/* Side Panel Tabs */}
      <View
        style={[
          styles.sideTabBar,
          { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
        ]}
      >
        {(
          [
            {
              key: 'chats' as SidePanelTab,
              label: isTr ? 'Sohbetler' : 'Chats',
              icon: MessageSquare,
            },
            {
              key: 'permissions' as SidePanelTab,
              label: isTr ? 'İzinler' : 'Access',
              icon: ShieldCheck,
            },
            {
              key: 'memories' as SidePanelTab,
              label: isTr ? 'Hafıza' : 'Memory',
              icon: Brain,
            },
          ] as const
        ).map((item) => {
          const active = sideTab === item.key;
          const Icon = item.icon;
          return (
            <Pressable
              key={item.key}
              onPress={() => setSideTab(item.key)}
              style={[
                styles.sideTabBtn,
                active && { backgroundColor: colors.primary },
              ]}
            >
              <Icon
                size={14}
                color={active ? colors.primaryText : colors.textSecondary}
              />
              <Text
                style={[
                  Typography.captionBold,
                  {
                    color: active ? colors.primaryText : colors.textSecondary,
                    fontSize: 12,
                  },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Side Panel Content */}
      <ScrollView
        style={styles.sideScroll}
        contentContainerStyle={{ gap: 10, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {sideTab === 'chats' && (
          <>
            <Pressable
              onPress={handleNewConversation}
              style={({ pressed }) => [
                styles.newChatBtn,
                {
                  backgroundColor: isDark
                    ? 'rgba(143, 162, 255, 0.14)'
                    : 'rgba(99, 102, 241, 0.1)',
                  borderColor: colors.primary,
                },
                pressed && { opacity: 0.85 },
              ]}
            >
              <Plus size={16} color={colors.primary} />
              <Text style={[Typography.bodyBold, { color: colors.primary, fontSize: 13 }]}>
                {isTr ? 'Yeni sohbet başlat' : 'Start new chat'}
              </Text>
            </Pressable>

            {conversations.length === 0 ? (
              <Text
                style={[
                  Typography.caption,
                  { color: colors.textSecondary, textAlign: 'center', marginTop: 20 },
                ]}
              >
                {isTr
                  ? 'Henüz sohbet geçmişin yok. İlk mesajını gönder!'
                  : 'No chat history yet. Send your first message!'}
              </Text>
            ) : (
              conversations.map((conv) => {
                const isSelected = conv.id === activeConversationId;
                return (
                  <Pressable
                    key={conv.id}
                    onPress={() => handleSelectConversation(conv.id)}
                    style={[
                      styles.convItem,
                      {
                        backgroundColor: isSelected
                          ? colors.surfaceElevated
                          : 'transparent',
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        Typography.bodyBold,
                        { color: colors.textPrimary, fontSize: 13 },
                      ]}
                      numberOfLines={1}
                    >
                      {conv.title}
                    </Text>
                    <Text
                      style={[
                        Typography.caption,
                        { color: colors.textSecondary, fontSize: 11, marginTop: 2 },
                      ]}
                    >
                      {new Date(conv.updatedAt).toLocaleDateString(
                        isTr ? 'tr-TR' : 'en-US',
                        { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }
                      )}
                    </Text>
                  </Pressable>
                );
              })
            )}
          </>
        )}

        {sideTab === 'permissions' && (
          <>
            <Text style={[Typography.caption, { color: colors.textSecondary, lineHeight: 18 }]}>
              {isTr
                ? 'AI Mentor yalnızca izin verdiğin alanlardaki verilerini kullanarak sana öneri sunar.'
                : 'AI Mentor only reads data from the areas you explicitly enable.'}
            </Text>
            {permissionItems.map((item) => (
              <View
                key={item.key}
                style={[
                  styles.permRow,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={[styles.permDot, { backgroundColor: item.accent }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[Typography.bodyBold, { color: colors.textPrimary, fontSize: 13 }]}>
                    {item.label}
                  </Text>
                  <Text style={[Typography.caption, { color: colors.textSecondary, fontSize: 11 }]}>
                    {item.desc}
                  </Text>
                </View>
                <Switch
                  value={permissions[item.key]}
                  onValueChange={() => handleTogglePermission(item.key)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            ))}
          </>
        )}

        {sideTab === 'memories' && (
          <>
            <Text style={[Typography.caption, { color: colors.textSecondary, lineHeight: 18 }]}>
              {isTr
                ? 'Mentorun hakkında hatırlamasını istediğin tercihleri veya kuralları ekleyebilir, dilediğini silebilirsin.'
                : 'Add personal rules or preferences for your mentor to remember, or delete them anytime.'}
            </Text>

            <View style={styles.memoryInputRow}>
              <TextInput
                value={newMemoryText}
                onChangeText={setNewMemoryText}
                placeholder={
                  isTr ? 'Örn: Akşam 21:00 sonrası iş koyma' : 'e.g. No work tasks after 9 PM'
                }
                placeholderTextColor={colors.textSecondary}
                style={[
                  styles.memoryInput,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
                onSubmitEditing={handleAddMemory}
              />
              <Pressable
                onPress={handleAddMemory}
                style={[styles.memoryAddBtn, { backgroundColor: colors.primary }]}
              >
                <Plus size={18} color={colors.primaryText} />
              </Pressable>
            </View>

            {memories.length === 0 ? (
              <Text
                style={[
                  Typography.caption,
                  { color: colors.textSecondary, textAlign: 'center', marginTop: 16 },
                ]}
              >
                {isTr ? 'Henüz kayıtlı hafıza yok.' : 'No saved memories yet.'}
              </Text>
            ) : (
              memories.map((mem) => (
                <View
                  key={mem.id}
                  style={[
                    styles.memoryCard,
                    {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      Typography.body,
                      { color: colors.textPrimary, fontSize: 13, flex: 1 },
                    ]}
                  >
                    {mem.content}
                  </Text>
                  <Pressable
                    onPress={() => handleDeleteMemory(mem.id)}
                    hitSlop={8}
                    style={{ padding: 4 }}
                  >
                    <Trash2 size={15} color={colors.danger} />
                  </Pressable>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );

  const renderChatArea = () => (
    <KeyboardAvoidingView
      style={styles.chatArea}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Hero Header with Cute Animated Mentor Avatar */}
      <FadeRiseView delay={0}>
        <View
          style={[
            styles.mentorHeader,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <MentorAvatar size={62} isThinking={isSending} />
          <View style={styles.mentorHeaderText}>
            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.liveBadge,
                  {
                    backgroundColor: isDark
                      ? 'rgba(123, 227, 161, 0.16)'
                      : 'rgba(16, 185, 129, 0.12)',
                  },
                ]}
              >
                <Sparkles size={12} color="#7BE3A1" />
                <Text style={[Typography.captionBold, { color: '#7BE3A1', fontSize: 11 }]}>
                  LifeOS · AI Mentor
                </Text>
              </View>
              {isSending && (
                <Text style={[Typography.caption, { color: '#5FD6E8', fontSize: 11 }]}>
                  {isTr ? 'Düşünüyor...' : 'Thinking...'}
                </Text>
              )}
            </View>
            <Text style={[Typography.h2, { color: colors.textPrimary, fontSize: 20 }]}>
              {isTr ? `Merhaba ${userName}!` : `Hello ${userName}!`}
            </Text>
            <Text
              style={[Typography.caption, { color: colors.textSecondary, marginTop: 2 }]}
              numberOfLines={2}
            >
              {profile?.primaryGoal
                ? isTr
                  ? `Odak hedefin: “${profile.primaryGoal}” — birlikte planlayalım.`
                  : `Your focus goal: “${profile.primaryGoal}” — let's plan together.`
                : isTr
                ? 'Haftanı planlayabilir, ilerlemeni analiz edebilir veya onayınla görev oluşturabilirim.'
                : 'I can plan your week, analyze your progress, or draft tasks for your approval.'}
            </Text>
          </View>
        </View>
      </FadeRiseView>

      {/* Quick Prompt Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScroll}
        contentContainerStyle={styles.chipsContent}
      >
        {quickPrompts.map((prompt) => (
          <Pressable
            key={prompt}
            onPress={() => handleSend(prompt)}
            disabled={isSending}
            style={({ pressed }) => [
              styles.promptChip,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
              pressed && { opacity: 0.8 },
            ]}
          >
            <Sparkles size={13} color={colors.primary} />
            <Text style={[Typography.captionBold, { color: colors.textPrimary, fontSize: 12 }]}>
              {prompt}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

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

      {/* Messages Feed */}
      <ScrollView
        ref={scrollRef}
        style={styles.messagesScroll}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyChatBox}>
            <MentorAvatar size={84} isThinking={false} />
            <Text
              style={[
                Typography.h3,
                { color: colors.textPrimary, textAlign: 'center', marginTop: 12 },
              ]}
            >
              {isTr ? 'Bugün sana nasıl yardımcı olayım?' : 'How can I help you today?'}
            </Text>
            <Text
              style={[
                Typography.body,
                {
                  color: colors.textSecondary,
                  textAlign: 'center',
                  maxWidth: 420,
                  marginTop: 6,
                },
              ]}
            >
              {isTr
                ? 'Yukarıdaki hızlı önerilerden birini seçebilir ya da “Yarın 10:00 İngilizce görevi oluştur” yazarak onaylı görev önerisi alabilirsin.'
                : 'Pick a quick prompt above or say “Create a task to study English tomorrow at 10:00” to try an interactive approval card.'}
            </Text>
          </View>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <View
                key={msg.id}
                style={[
                  styles.msgRow,
                  isUser ? styles.msgRowUser : styles.msgRowAssistant,
                ]}
              >
                <View
                  style={[
                    styles.bubble,
                    isUser
                      ? {
                          backgroundColor: colors.primary,
                          borderBottomRightRadius: 6,
                        }
                      : {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                          borderWidth: 1,
                          borderBottomLeftRadius: 6,
                        },
                  ]}
                >
                  <Text
                    style={[
                      Typography.body,
                      {
                        color: isUser ? colors.primaryText : colors.textPrimary,
                        lineHeight: 22,
                      },
                    ]}
                  >
                    {msg.content}
                  </Text>

                  {/* Interactive Action Approval Card (Model A) */}
                  {msg.proposedAction && (
                    <View
                      style={[
                        styles.actionCard,
                        {
                          backgroundColor: isDark ? '#1D2152' : '#EEF0FF',
                          borderColor: isDark ? '#3B428A' : '#C7CEFF',
                        },
                      ]}
                    >
                      <View style={styles.actionCardHeader}>
                        <Sparkles size={15} color={colors.primary} />
                        <Text
                          style={[
                            Typography.captionBold,
                            { color: colors.primary, fontSize: 12 },
                          ]}
                        >
                          {isTr ? 'Önerilen Görev Aksiyonu' : 'Proposed Task Action'}
                        </Text>
                      </View>

                      <Text
                        style={[
                          Typography.bodyBold,
                          { color: colors.textPrimary, fontSize: 15, marginTop: 6 },
                        ]}
                      >
                        {msg.proposedAction.title}
                      </Text>

                      <View style={styles.actionMetaRow}>
                        {msg.proposedAction.dueDate && (
                          <View style={styles.actionMetaChip}>
                            <Calendar size={12} color={colors.textSecondary} />
                            <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                              {msg.proposedAction.dueDate}
                            </Text>
                          </View>
                        )}
                        {msg.proposedAction.dueTime && (
                          <View style={styles.actionMetaChip}>
                            <Clock size={12} color={colors.textSecondary} />
                            <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                              {msg.proposedAction.dueTime}
                            </Text>
                          </View>
                        )}
                        <View
                          style={[
                            styles.categoryPill,
                            { backgroundColor: 'rgba(143, 162, 255, 0.2)' },
                          ]}
                        >
                          <Text
                            style={[
                              Typography.captionBold,
                              { color: colors.primary, fontSize: 11 },
                            ]}
                          >
                            {msg.proposedAction.category}
                          </Text>
                        </View>
                      </View>

                      {msg.actionStatus === 'pending' ? (
                        <View style={styles.actionBtnRow}>
                          <Pressable
                            onPress={() => handleResolveAction(msg.id, true)}
                            disabled={resolvingId === msg.id}
                            style={({ pressed }) => [
                              styles.approveBtn,
                              { backgroundColor: '#7BE3A1' },
                              pressed && { opacity: 0.85 },
                            ]}
                          >
                            {resolvingId === msg.id ? (
                              <ActivityIndicator size="small" color="#0E1029" />
                            ) : (
                              <>
                                <Check size={15} color="#0E1029" />
                                <Text
                                  style={[
                                    Typography.captionBold,
                                    { color: '#0E1029', fontSize: 12 },
                                  ]}
                                >
                                  {isTr ? 'Onayla ve Görev Ekle' : 'Approve & Add Task'}
                                </Text>
                              </>
                            )}
                          </Pressable>
                          <Pressable
                            onPress={() => handleResolveAction(msg.id, false)}
                            disabled={resolvingId === msg.id}
                            style={({ pressed }) => [
                              styles.rejectBtn,
                              { borderColor: colors.border },
                              pressed && { opacity: 0.8 },
                            ]}
                          >
                            <X size={15} color={colors.textSecondary} />
                            <Text
                              style={[
                                Typography.captionBold,
                                { color: colors.textSecondary, fontSize: 12 },
                              ]}
                            >
                              {isTr ? 'Reddet' : 'Dismiss'}
                            </Text>
                          </Pressable>
                        </View>
                      ) : msg.actionStatus === 'approved' ? (
                        <View style={styles.statusRow}>
                          <CheckCircle2 size={15} color="#7BE3A1" />
                          <Text
                            style={[
                              Typography.captionBold,
                              { color: '#7BE3A1', fontSize: 12 },
                            ]}
                          >
                            {isTr
                              ? 'Onaylandı · Görevler ve Takvim’e eklendi'
                              : 'Approved · Added to Tasks & Calendar'}
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.statusRow}>
                          <XCircle size={15} color={colors.textSecondary} />
                          <Text
                            style={[
                              Typography.caption,
                              { color: colors.textSecondary, fontSize: 12 },
                            ]}
                          >
                            {isTr ? 'İptal edildi' : 'Dismissed'}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Input Composer */}
      <View
        style={[
          styles.composer,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder={
            isTr
              ? 'Mentoruna yaz... (örn. Yarın 10:00 İngilizce görevi oluştur)'
              : 'Ask your mentor... (e.g. Create a task for tomorrow at 10:00)'
          }
          placeholderTextColor={colors.textSecondary}
          style={[styles.composerInput, { color: colors.textPrimary }]}
          multiline={false}
          returnKeyType="send"
          onSubmitEditing={() => handleSend()}
          editable={!isSending}
        />
        <Pressable
          onPress={() => handleSend()}
          disabled={!inputText.trim() || isSending}
          style={({ pressed }) => [
            styles.sendBtn,
            {
              backgroundColor:
                inputText.trim() && !isSending ? colors.primary : colors.surfaceElevated,
            },
            pressed && { opacity: 0.85 },
          ]}
        >
          {isSending ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Send
              size={18}
              color={inputText.trim() ? colors.primaryText : colors.textSecondary}
            />
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {isWideScreen && (
        <WebSidebar
          activeTab="ai"
          onTabChange={handleNavTab}
          onLogout={onLogout}
          userName={userName}
        />
      )}

      <View style={styles.mainContent}>
        {/* Mobile View Switcher (Chat vs Panel) */}
        {!isWideScreen && (
          <View
            style={[
              styles.mobileSwitchBar,
              { backgroundColor: colors.surface, borderBottomColor: colors.border },
            ]}
          >
            <Pressable
              onPress={() => setMobileView('chat')}
              style={[
                styles.mobileSwitchBtn,
                mobileView === 'chat' && { backgroundColor: colors.primary },
              ]}
            >
              <Text
                style={[
                  Typography.captionBold,
                  {
                    color:
                      mobileView === 'chat' ? colors.primaryText : colors.textSecondary,
                  },
                ]}
              >
                {isTr ? 'AI Sohbet' : 'AI Chat'}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setMobileView('panel')}
              style={[
                styles.mobileSwitchBtn,
                mobileView === 'panel' && { backgroundColor: colors.primary },
              ]}
            >
              <Text
                style={[
                  Typography.captionBold,
                  {
                    color:
                      mobileView === 'panel' ? colors.primaryText : colors.textSecondary,
                  },
                ]}
              >
                {isTr ? 'Sohbetler · İzinler · Hafıza' : 'Chats · Access · Memory'}
              </Text>
            </Pressable>
          </View>
        )}

        <View style={[styles.splitLayout, !isWideScreen && { paddingBottom: 78 }]}>
          {isWideScreen ? (
            <>
              {renderChatArea()}
              {renderSidePanel()}
            </>
          ) : mobileView === 'chat' ? (
            renderChatArea()
          ) : (
            renderSidePanel()
          )}
        </View>

        {!isWideScreen && (
          <BottomNavigation activeTab="ai" onTabChange={handleNavTab} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
  },
  mainContent: {
    flex: 1,
  },
  mobileSwitchBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.OS === 'ios' ? 52 : Spacing.md,
    paddingBottom: Spacing.sm,
    gap: 8,
    borderBottomWidth: 1,
  },
  mobileSwitchBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: Radius.pill,
    alignItems: 'center',
  },
  splitLayout: {
    flex: 1,
    flexDirection: 'row',
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  chatArea: {
    flex: 1,
    minWidth: 0,
  },
  mentorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 22,
    borderWidth: 1,
    gap: 14,
  },
  mentorHeaderText: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  chipsScroll: {
    flexGrow: 0,
    marginTop: 12,
    marginBottom: 8,
  },
  chipsContent: {
    gap: 8,
    paddingVertical: 2,
  },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  errorBanner: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 12,
    gap: 12,
  },
  centerBox: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyChatBox: {
    paddingVertical: 48,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgRow: {
    flexDirection: 'row',
    width: '100%',
  },
  msgRowUser: {
    justifyContent: 'flex-end',
  },
  msgRowAssistant: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 20,
  },
  actionCard: {
    marginTop: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  actionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  actionMetaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  approveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  rejectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 8,
    gap: 8,
    marginTop: 8,
  },
  composerInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 6,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidePanel: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 14,
  },
  sideTabBar: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
    marginBottom: 14,
  },
  sideTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 10,
  },
  sideScroll: {
    flex: 1,
  },
  newChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  convItem: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  permRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 11,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  permDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  memoryInputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  memoryInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
  },
  memoryAddBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
});
