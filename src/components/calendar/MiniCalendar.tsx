import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useI18n } from '../../i18n';
import { Spacing, Radius } from '../../theme/spacing';
import {
  formatMonthYear,
  getMonthGridDates,
  getSingleLetterWeekdays,
  toIsoDate,
} from '../../utils/calendarUtils';

interface MiniCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  taskCountByDate: Record<string, number>;
}

export const MiniCalendar: React.FC<MiniCalendarProps> = ({
  selectedDate,
  onSelectDate,
  taskCountByDate,
}) => {
  const { colors } = useTheme();
  const { language } = useI18n();

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const selectedIso = toIsoDate(selectedDate);
  const todayIso = toIsoDate(new Date());

  const grid = useMemo(() => getMonthGridDates(year, month), [year, month]);
  const weekdays = useMemo(() => getSingleLetterWeekdays(language), [language]);

  const changeMonth = (delta: number) => {
    onSelectDate(new Date(year, month + delta, 1));
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.monthTitle, { color: colors.textPrimary }]}>
          {formatMonthYear(selectedDate, language)}
        </Text>
        <View style={styles.arrows}>
          <Pressable
            onPress={() => changeMonth(-1)}
            hitSlop={6}
            style={[styles.arrowBtn, { backgroundColor: colors.surfaceElevated }]}
          >
            <ChevronLeft size={16} color={colors.textPrimary} />
          </Pressable>
          <Pressable
            onPress={() => changeMonth(1)}
            hitSlop={6}
            style={[styles.arrowBtn, { backgroundColor: colors.surfaceElevated }]}
          >
            <ChevronRight size={16} color={colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      <View style={styles.weekdayRow}>
        {weekdays.map((letter, idx) => (
          <Text key={idx} style={[styles.weekdayText, { color: colors.textSecondary }]}>
            {letter}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {grid.map(({ date, inMonth }) => {
          const iso = toIsoDate(date);
          const isSelected = iso === selectedIso;
          const isToday = iso === todayIso;
          const count = taskCountByDate[iso] || 0;

          return (
            <Pressable
              key={iso}
              onPress={() => onSelectDate(date)}
              style={[
                styles.dayCell,
                isSelected && { backgroundColor: colors.primary },
                !isSelected && isToday && { borderWidth: 1.5, borderColor: colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.dayText,
                  {
                    color: isSelected
                      ? colors.primaryText
                      : inMonth
                        ? colors.textPrimary
                        : colors.textSecondary,
                    opacity: inMonth || isSelected ? 1 : 0.4,
                    fontWeight: isSelected || isToday ? '700' : '500',
                  },
                ]}
              >
                {date.getDate()}
              </Text>
              {count > 0 && (
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: isSelected ? colors.primaryText : colors.warning },
                  ]}
                />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  arrows: {
    flexDirection: 'row',
    gap: 6,
  },
  arrowBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.285%',
    aspectRatio: 1,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayText: {
    fontSize: 12,
  },
  dot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
