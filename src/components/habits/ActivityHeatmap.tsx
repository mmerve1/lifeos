import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useI18n } from '../../i18n';
import { Habit } from '../../types/habit';
import { addDays, toIsoDate } from '../../utils/calendarUtils';

interface ActivityHeatmapProps {
  habits: Habit[];
  weeks?: number;
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  habits,
  weeks = 16,
}) => {
  const { colors, isDark } = useTheme();
  const { language } = useI18n();

  const { columns, totalCheckIns, consistencyPct } = useMemo(() => {
    const countMap: Record<string, number> = {};
    let total = 0;

    for (const h of habits) {
      for (const d of h.completedDates) {
        countMap[d] = (countMap[d] || 0) + 1;
        total += 1;
      }
    }

    const totalDays = weeks * 7;
    const today = new Date();
    const start = addDays(today, -(totalDays - 1));

    const cols: { iso: string; count: number }[][] = [];
    let recentPossible = 0;
    let recentDone = 0;

    for (let w = 0; w < weeks; w++) {
      const col: { iso: string; count: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const dayIndex = w * 7 + d;
        const date = addDays(start, dayIndex);
        const iso = toIsoDate(date);
        const count = countMap[iso] || 0;
        col.push({ iso, count });

        // Last 28 days consistency rate
        if (dayIndex >= totalDays - 28 && habits.length > 0) {
          recentPossible += habits.length;
          recentDone += Math.min(count, habits.length);
        }
      }
      cols.push(col);
    }

    const pct = recentPossible > 0 ? Math.round((recentDone / recentPossible) * 100) : 0;
    return { columns: cols, totalCheckIns: total, consistencyPct: pct };
  }, [habits, weeks]);

  const getCellColor = (count: number) => {
    if (count === 0) return isDark ? '#21255A' : '#E8EBFA';
    const ratio = habits.length > 0 ? count / habits.length : 1;
    if (ratio < 0.35) return isDark ? '#4652A8' : '#C5CEFF';
    if (ratio < 0.7) return isDark ? '#6B7CE8' : '#8FA2FF';
    return isDark ? '#A5B4FF' : '#4E62E8';
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.topRow}>
        <View style={styles.heatmapArea}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {language === 'tr' ? 'Aktivite Isı Haritası' : 'Activity Heatmap'}
            </Text>
            <View style={styles.legendRow}>
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                {language === 'tr' ? 'Az' : 'Less'}
              </Text>
              {[0, 1, 2, 4].map((lvl) => (
                <View
                  key={lvl}
                  style={[styles.legendCell, { backgroundColor: getCellColor(lvl) }]}
                />
              ))}
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                {language === 'tr' ? 'Çok' : 'More'}
              </Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.gridRow}>
              {columns.map((col, wIdx) => (
                <View key={wIdx} style={styles.weekCol}>
                  {col.map((cell) => (
                    <View
                      key={cell.iso}
                      style={[styles.cell, { backgroundColor: getCellColor(cell.count) }]}
                    />
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* KPI Cards */}
        <View style={styles.kpiRow}>
          <View style={[styles.kpiCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <Text style={[styles.kpiValue, { color: colors.warning }]}>{consistencyPct}%</Text>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>
              {language === 'tr' ? 'İSTİKRAR (28G)' : 'CONSISTENCY'}
            </Text>
          </View>

          <View style={[styles.kpiCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <Text style={[styles.kpiValue, { color: colors.primary }]}>{totalCheckIns}</Text>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>
              {language === 'tr' ? 'TOPLAM TAMAMLAMA' : 'TOTAL CHECK-INS'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  topRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    alignItems: 'center',
  },
  heatmapArea: {
    flex: 1,
    minWidth: 260,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendText: {
    fontSize: 11,
  },
  legendCell: {
    width: 11,
    height: 11,
    borderRadius: 3,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 5,
  },
  weekCol: {
    gap: 5,
  },
  cell: {
    width: 14,
    height: 14,
    borderRadius: 4,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 12,
  },
  kpiCard: {
    minWidth: 126,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  kpiValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
});
