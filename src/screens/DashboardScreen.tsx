import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Modal,
} from 'react-native';
import { Plus, SlidersHorizontal, LogOut, CheckCircle2 } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { AppTopBar } from '../components/dashboard/AppTopBar';
import { ProgressCard } from '../components/dashboard/ProgressCard';
import { StatCard } from '../components/dashboard/StatCard';
import { AgendaItem } from '../components/dashboard/AgendaItem';
import { ModuleCard } from '../components/dashboard/ModuleCard';
import { BottomNavigation } from '../components/dashboard/BottomNavigation';
import { EmptyState } from '../components/common/EmptyState';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { SecondaryButton } from '../components/common/SecondaryButton';
import {
  mockUser,
  mockProgress,
  mockStats,
  mockAgendaItems,
  mockModules,
} from '../data/mockData';
import { NavTabType, AgendaItemType } from '../types';

interface DashboardScreenProps {
  userName?: string;
  onLogout: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  userName = 'Merve',
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<NavTabType>('home');
  const [agenda, setAgenda] = useState<AgendaItemType[]>(mockAgendaItems);
  const [showEmptyAgenda, setShowEmptyAgenda] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [activeModuleModal, setActiveModuleModal] = useState<string | null>(null);

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleToggleAgenda = (id: string) => {
    setAgenda((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleNotificationPress = () => {
    Alert.alert(
      'Notification Center',
      'You have 2 pending items:\n• 11:00 Project development coming up\n• Weekly goal review reminder'
    );
  };

  const handleModulePress = (moduleId: string) => {
    const mod = mockModules.find((m) => m.id === moduleId);
    setActiveModuleModal(mod ? mod.name : moduleId);
  };

  const handleAddSampleTask = () => {
    const newTask: AgendaItemType = {
      id: Date.now().toString(),
      time: '18:00',
      title: 'Evening workout & reflection',
      module: 'Health',
      category: 'health',
      completed: false,
    };
    setAgenda((prev) => [...prev, newTask]);
    setShowEmptyAgenda(false);
  };

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top App Bar */}
        <AppTopBar
          user={{ ...mockUser, name: userName }}
          notificationCount={2}
          onNotificationPress={handleNotificationPress}
          onAvatarPress={() => setProfileModalVisible(true)}
        />

        {/* Welcome Header */}
        <View style={styles.welcomeSection}>
          <Text style={[Typography.pageTitle, styles.welcomeTitle]}>
            {getGreeting()}, {userName}!
          </Text>
          <Text style={[Typography.body, styles.welcomeSubtitle]}>
            Let's make today count.
          </Text>
        </View>

        {/* Weekly Progress Card */}
        <ProgressCard
          progress={mockProgress}
          onPress={() => {
            Alert.alert(
              'Weekly Progress Details',
              `Current Completion: ${mockProgress.percentage}%\nTasks Done: ${mockProgress.tasksCompleted}/${mockProgress.tasksTotal}\nActive Goals: ${mockProgress.activeGoals}\n\nCalculated strictly from defined goals and completed tasks.`
            );
          }}
        />

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          {mockStats.map((stat) => (
            <StatCard
              key={stat.id}
              item={stat}
              onPress={() => {
                Alert.alert(
                  stat.label,
                  `Details for ${stat.label}: ${stat.value} (${stat.subtitle})`
                );
              }}
            />
          ))}
        </View>

        {/* Today's Agenda Section */}
        <View style={styles.sectionHeader}>
          <Text style={[Typography.sectionTitle, styles.sectionTitle]}>
            Today's agenda
          </Text>
          <View style={styles.headerRightActions}>
            {/* Dev toggle to inspect empty state */}
            <Pressable
              onPress={() => setShowEmptyAgenda(!showEmptyAgenda)}
              style={styles.filterPill}
              hitSlop={6}
            >
              <SlidersHorizontal size={12} color={Colors.textSecondary} />
              <Text style={[Typography.caption, styles.filterText]}>
                {showEmptyAgenda ? 'Show Data' : 'Test Empty'}
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                Alert.alert(
                  "Today's Agenda",
                  'Chronological view of all tasks and events scheduled for today.'
                )
              }
              hitSlop={8}
            >
              <Text style={[Typography.captionBold, styles.viewAllText]}>
                View all
              </Text>
            </Pressable>
          </View>
        </View>

        {showEmptyAgenda || agenda.length === 0 ? (
          <EmptyState
            title="No tasks scheduled today"
            description="Your agenda is clear for today. Plan your next milestone or review your active goals."
            actionLabel="Add your first task"
            onAction={handleAddSampleTask}
          />
        ) : (
          agenda.map((item) => (
            <AgendaItem
              key={item.id}
              item={item}
              onToggle={handleToggleAgenda}
              onPress={(id) => {
                Alert.alert('Agenda Item', `Details for: ${item.title} (${item.module})`);
              }}
            />
          ))
        )}

        {/* Your Spaces (Modules) Section */}
        <View style={[styles.sectionHeader, { marginTop: Spacing.xl }]}>
          <Text style={[Typography.sectionTitle, styles.sectionTitle]}>
            Your spaces
          </Text>
          <Text style={[Typography.caption, styles.spacesSubtitle]}>
            8 Modular Hubs
          </Text>
        </View>

        {mockModules.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            onPress={handleModulePress}
          />
        ))}

        {/* Bottom padding so content is not obscured */}
        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      {/* Profile & Settings Modal */}
      <Modal
        visible={profileModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.profileHeader}>
              <View style={styles.modalAvatarCircle}>
                <Text style={styles.modalAvatarText}>
                  {userName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={[Typography.cardTitle, styles.modalName]}>
                {userName}
              </Text>
              <Text style={[Typography.caption, styles.modalEmail]}>
                {mockUser.email}
              </Text>
            </View>

            <View style={styles.modalDivider} />

            <View style={styles.modalInfoRow}>
              <Text style={[Typography.body, styles.modalInfoLabel]}>
                Platform Version
              </Text>
              <Text style={[Typography.captionBold, styles.modalInfoValue]}>
                LifeOS v1.0 (MVP)
              </Text>
            </View>

            <View style={styles.modalInfoRow}>
              <Text style={[Typography.body, styles.modalInfoLabel]}>
                Theme
              </Text>
              <Text style={[Typography.captionBold, styles.modalInfoValue]}>
                Dark Premium (Violet)
              </Text>
            </View>

            <View style={styles.modalActions}>
              <SecondaryButton
                label="Log out"
                icon={<LogOut size={16} color={Colors.danger} />}
                textStyle={{ color: Colors.danger }}
                onPress={() => {
                  setProfileModalVisible(false);
                  onLogout();
                }}
              />
              <PrimaryButton
                label="Close"
                onPress={() => setProfileModalVisible(false)}
                style={{ marginTop: Spacing.sm }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Module Detail Sheet Modal */}
      <Modal
        visible={!!activeModuleModal}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModuleModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.moduleModalHeader}>
              <CheckCircle2 size={24} color={Colors.primary} />
              <Text style={[Typography.cardTitle, styles.moduleModalTitle]}>
                {activeModuleModal} Module
              </Text>
            </View>

            <Text style={[Typography.body, styles.moduleModalDesc]}>
              This space will host modular business rules, data sets, and views for{' '}
              {activeModuleModal}. Clean Architecture & .NET 10 API endpoints will bind to this hub.
            </Text>

            <PrimaryButton
              label="Understood"
              onPress={() => setActiveModuleModal(null)}
              style={{ marginTop: Spacing.lg }}
            />
          </View>
        </View>
      </Modal>

      {/* Fixed Bottom Navigation (5 items) */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== 'home') {
            Alert.alert(
              tab.charAt(0).toUpperCase() + tab.slice(1),
              `Navigating to the ${tab} view. In this MVP release, Main Dashboard is the primary interactive hub.`
            );
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.xl,
  },
  welcomeSection: {
    marginBottom: Spacing.lg,
  },
  welcomeTitle: {
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  welcomeSubtitle: {
    color: Colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    color: Colors.textPrimary,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterText: {
    color: Colors.textSecondary,
    fontSize: 11,
  },
  viewAllText: {
    color: Colors.primary,
  },
  spacesSubtitle: {
    color: Colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.screenPadding,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
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
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  modalAvatarText: {
    color: Colors.secondaryViolet,
    fontSize: 24,
    fontWeight: '700',
  },
  modalName: {
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  modalEmail: {
    color: Colors.textSecondary,
  },
  modalDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  modalInfoLabel: {
    color: Colors.textSecondary,
  },
  modalInfoValue: {
    color: Colors.textPrimary,
  },
  modalActions: {
    marginTop: Spacing.md,
  },
  moduleModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  moduleModalTitle: {
    color: Colors.textPrimary,
  },
  moduleModalDesc: {
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
