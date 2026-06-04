import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import KidBackdrop from '../KidBackdrop';

type TimerDuration = 30 | 60 | 120;

type TimerQuestion = {
  id: string;
  left: number;
  right: number;
  answer: number;
  options: number[];
};

type ResultState = {
  score: number;
  attempted: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  previousBest: number;
  newBest: number;
  isNewHighScore: boolean;
};

const DURATION_OPTIONS: TimerDuration[] = [30, 60, 120];
const STORAGE_PREFIX = 'subtraction-timer-best';

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function uniqueNumbers(count: number, exclude: number) {
  const values = new Set<number>();
  while (values.size < count) {
    const candidate = randomInt(0, 10);
    if (candidate !== exclude) {
      values.add(candidate);
    }
  }
  return [...values];
}

function generatePair() {
  let left = 1;
  let right = 1;

  do {
    left = randomInt(1, 10);
    right = randomInt(1, left);
  } while (left - right < 0);

  return { left, right, answer: left - right };
}

function generateQuestion(): TimerQuestion {
  const { left, right, answer } = generatePair();
  const options = shuffle([answer, ...uniqueNumbers(3, answer)]);

  return {
    id: `subtraction-timer-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    left,
    right,
    answer,
    options,
  };
}

function buildStorageKey(duration: TimerDuration) {
  return `${STORAGE_PREFIX}-${duration}`;
}

function feedbackMessage(t: (key: string, options?: Record<string, unknown>) => string, correct: boolean) {
  return correct
    ? t('subtraction_timer.correct', { defaultValue: 'Correct!' })
    : t('subtraction_timer.incorrect', { defaultValue: 'Try Again!' });
}

function speedMessage(score: number, isNewHighScore: boolean) {
  if (isNewHighScore) {
    return 'New High Score!';
  }
  if (score >= 25) {
    return 'Amazing Speed!';
  }
  if (score >= 15) {
    return 'Excellent Work!';
  }
  return 'Keep Practicing!';
}

export default function SubtractionTimerModule() {
  const { t } = useTranslation();
  const [selectedDuration, setSelectedDuration] = useState<TimerDuration | null>(null);
  const [highScores, setHighScores] = useState<Record<TimerDuration, number>>({
    30: 0,
    60: 0,
    120: 0,
  });
  const [question, setQuestion] = useState<TimerQuestion>(() => generateQuestion());
  const [timeLeft, setTimeLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [attempted, setAttempted] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [lockedOption, setLockedOption] = useState<number | null>(null);
  const [completedResult, setCompletedResult] = useState<ResultState | null>(null);
  const [durationLoaded, setDurationLoaded] = useState(false);
  const nextQuestionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const durationLabel = useMemo(() => {
    if (selectedDuration === 30) return t('subtraction_timer.duration_30', { defaultValue: '30 Seconds' });
    if (selectedDuration === 60) return t('subtraction_timer.duration_60', { defaultValue: '60 Seconds' });
    if (selectedDuration === 120) return t('subtraction_timer.duration_120', { defaultValue: '120 Seconds' });
    return '';
  }, [selectedDuration, t]);

  useEffect(() => {
    let mounted = true;

    async function loadHighScores() {
      try {
        const entries = await Promise.all(
          DURATION_OPTIONS.map(async (duration) => {
            const stored = await AsyncStorage.getItem(buildStorageKey(duration));
            return [duration, stored ? Number(stored) : 0] as const;
          })
        );

        if (mounted) {
          setHighScores({
            30: entries[0][1],
            60: entries[1][1],
            120: entries[2][1],
          });
          setDurationLoaded(true);
        }
      } catch (error) {
        if (mounted) {
          setDurationLoaded(true);
        }
      }
    }

    loadHighScores();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (nextQuestionTimeoutRef.current) {
        clearTimeout(nextQuestionTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!running || timeLeft <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [running, timeLeft]);

  useEffect(() => {
    if (!running || timeLeft > 0 || !selectedDuration) {
      return;
    }

    if (nextQuestionTimeoutRef.current) {
      clearTimeout(nextQuestionTimeoutRef.current);
      nextQuestionTimeoutRef.current = null;
    }

    setRunning(false);

    const previousBest = highScores[selectedDuration] || 0;
    const newBest = Math.max(previousBest, score);
    const isNewHighScore = newBest > previousBest;

    if (isNewHighScore) {
      AsyncStorage.setItem(buildStorageKey(selectedDuration), String(newBest)).catch(() => undefined);
      setHighScores((current) => ({
        ...current,
        [selectedDuration]: newBest,
      }));
    }

    setCompletedResult({
      score,
      attempted,
      correct,
      incorrect,
      accuracy: attempted > 0 ? Math.round((correct / attempted) * 100) : 0,
      previousBest,
      newBest,
      isNewHighScore,
    });
  }, [attempted, correct, incorrect, highScores, running, score, selectedDuration, timeLeft]);

  function startDuration(duration: TimerDuration) {
    if (nextQuestionTimeoutRef.current) {
      clearTimeout(nextQuestionTimeoutRef.current);
      nextQuestionTimeoutRef.current = null;
    }
    setSelectedDuration(duration);
    setQuestion(generateQuestion());
    setTimeLeft(duration);
    setRunning(true);
    setScore(0);
    setAttempted(0);
    setCorrect(0);
    setIncorrect(0);
    setFeedback(null);
    setLockedOption(null);
    setCompletedResult(null);
  }

  function answerQuestion(option: number) {
    if (!running || timeLeft <= 0) {
      return;
    }

    const isCorrect = option === question.answer;
    setAttempted((current) => current + 1);
    setScore((current) => current + (isCorrect ? 1 : 0));
    setCorrect((current) => current + (isCorrect ? 1 : 0));
    setIncorrect((current) => current + (isCorrect ? 0 : 1));
    setFeedback(feedbackMessage(t, isCorrect));
    setLockedOption(option);

    if (nextQuestionTimeoutRef.current) {
      clearTimeout(nextQuestionTimeoutRef.current);
    }

    nextQuestionTimeoutRef.current = setTimeout(() => {
      setQuestion(generateQuestion());
      setFeedback(null);
      setLockedOption(null);
    }, 220);
  }

  function replay() {
    if (!selectedDuration) {
      return;
    }
    startDuration(selectedDuration);
  }

  const bestScore = selectedDuration ? highScores[selectedDuration] || 0 : 0;

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <KidBackdrop />
      <View style={styles.headerCard}>
        <View>
          <Text style={styles.kicker}>{t('activities.timer')}</Text>
          <Text style={styles.headerTitle}>{t('subtraction_timer.title', { defaultValue: 'Subtraction Timer' })}</Text>
          <Text style={styles.headerSubtitle}>{t('subtraction_timer.subtitle', { defaultValue: 'Speed Challenge' })}</Text>
        </View>
      </View>

      {!durationLoaded ? (
        <View style={styles.card}>
          <Text style={styles.cardBody}>{t('subtraction_timer.loading', { defaultValue: 'Loading...' })}</Text>
        </View>
      ) : null}

      {!running && !completedResult ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('subtraction_timer.choose_duration', { defaultValue: 'Select Duration' })}</Text>
          <View style={styles.durationRow}>
            {DURATION_OPTIONS.map((duration) => {
              const active = selectedDuration === duration;
              const highScore = highScores[duration] || 0;
              return (
                <Pressable
                  key={duration}
                  onPress={() => startDuration(duration)}
                  style={[styles.durationCard, active && styles.durationCardActive]}
                  accessibilityRole="button"
                >
                  <Text style={[styles.durationText, active && styles.durationTextActive]}>
                    {duration} {t('subtraction_timer.seconds', { defaultValue: 'Seconds' })}
                  </Text>
                  <Text style={[styles.durationScore, active && styles.durationTextActive]}>
                    {t('subtraction_timer.best', { defaultValue: 'Best' })}: {highScore}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      {running ? (
        <View style={styles.card}>
          <View style={styles.statsRow}>
            <View style={styles.statPill}>
              <Text style={styles.statLabel}>{t('subtraction_timer.time_left', { defaultValue: 'Time Left' })}</Text>
              <Text style={styles.statValue}>{timeLeft}s</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={styles.statLabel}>{t('subtraction_timer.score', { defaultValue: 'Score' })}</Text>
              <Text style={styles.statValue}>{score}</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={styles.statLabel}>{t('subtraction_timer.best', { defaultValue: 'Best' })}</Text>
              <Text style={styles.statValue}>{bestScore}</Text>
            </View>
          </View>

          <Text style={styles.questionText}>
            {question.left} - {question.right} = ?
          </Text>

          <Text style={styles.feedbackText}>{feedback ?? t('subtraction_timer.answer_fast', { defaultValue: 'Answer fast!' })}</Text>

          <View style={styles.optionGrid}>
            {question.options.map((option) => {
              const active = lockedOption === option && option === question.answer;
              const wrong = lockedOption === option && option !== question.answer;
              return (
                <Pressable
                  key={`${question.id}-${option}`}
                  onPress={() => answerQuestion(option)}
                  style={({ pressed }) => [
                    styles.optionCard,
                    active && styles.optionCardCorrect,
                    wrong && styles.optionCardWrong,
                    pressed && !lockedOption && styles.optionCardPressed,
                  ]}
                  accessibilityRole="button"
                >
                  <Text style={[styles.optionText, active && styles.optionTextCorrect]}>{option}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      {completedResult ? (
        <View style={styles.resultsCard}>
          <Text style={styles.completeTitle}>{t('subtraction_timer.time_up', { defaultValue: 'Time Up!' })}</Text>
          <Text style={styles.completeBody}>{speedMessage(completedResult.score, completedResult.isNewHighScore)}</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{completedResult.attempted}</Text>
              <Text style={styles.statLabel}>{t('subtraction_timer.questions_attempted', { defaultValue: 'Questions Attempted' })}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{completedResult.correct}</Text>
              <Text style={styles.statLabel}>{t('subtraction_timer.correct_answers', { defaultValue: 'Correct Answers' })}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{completedResult.incorrect}</Text>
              <Text style={styles.statLabel}>{t('subtraction_timer.incorrect_answers', { defaultValue: 'Incorrect Answers' })}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{completedResult.score}</Text>
              <Text style={styles.statLabel}>{t('subtraction_timer.score', { defaultValue: 'Score' })}</Text>
            </View>
          </View>

          <View style={styles.resultsSummary}>
            <Text style={styles.summaryText}>{t('subtraction_timer.accuracy', { defaultValue: 'Accuracy' })}: {completedResult.accuracy}%</Text>
            <Text style={styles.summaryText}>
              {durationLabel} {t('subtraction_timer.best', { defaultValue: 'Best' })}: {completedResult.newBest}
            </Text>
            {completedResult.isNewHighScore ? (
              <Text style={styles.highScore}>{t('subtraction_timer.new_high_score', { defaultValue: 'New High Score!' })}</Text>
            ) : null}
          </View>

          <View style={styles.actionRow}>
            <Pressable style={styles.secondaryButton} onPress={replay} accessibilityRole="button">
              <Text style={styles.secondaryButtonText}>{t('subtraction_timer.play_again', { defaultValue: 'Play Again' })}</Text>
            </Pressable>
            <Pressable style={styles.primaryButton} onPress={() => setCompletedResult(null)} accessibilityRole="button">
              <Text style={styles.primaryButtonText}>{t('subtraction_timer.change_duration', { defaultValue: 'Change Duration' })}</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 14,
    paddingBottom: 32,
    backgroundColor: '#FFF8FC',
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 18,
    borderWidth: 2,
    borderColor: '#FFD2EA',
    shadowColor: '#D84E9A',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FF6B9E',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerTitle: {
    marginTop: 6,
    fontSize: 28,
    fontWeight: '900',
    color: '#7E2D6A',
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 15,
    color: '#704D66',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 18,
    borderWidth: 2,
    borderColor: '#FFD2EA',
    shadowColor: '#D84E9A',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#7E2D6A',
  },
  cardBody: {
    fontSize: 15,
    color: '#704D66',
  },
  durationRow: {
    gap: 10,
  },
  durationCard: {
    borderRadius: 20,
    backgroundColor: '#FFF8FC',
    borderWidth: 2,
    borderColor: '#FFD2EA',
    padding: 14,
    gap: 4,
  },
  durationCardActive: {
    backgroundColor: '#FFF2FA',
    borderColor: '#FF6B9E',
  },
  durationText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#7E2D6A',
  },
  durationTextActive: {
    color: '#FF6B9E',
  },
  durationScore: {
    fontSize: 13,
    color: '#704D66',
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  statPill: {
    flexGrow: 1,
    minWidth: '30%',
    borderRadius: 16,
    backgroundColor: '#FFF0F7',
    borderWidth: 2,
    borderColor: '#FFD2EA',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#704D66',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#7E2D6A',
  },
  questionText: {
    fontSize: 34,
    fontWeight: '900',
    color: '#7E2D6A',
  },
  feedbackText: {
    fontSize: 15,
    color: '#704D66',
    fontWeight: '700',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    width: '48%',
    minHeight: 72,
    borderRadius: 20,
    backgroundColor: '#FFF8FC',
    borderWidth: 2,
    borderColor: '#FFD2EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionCardPressed: {
    transform: [{ scale: 0.98 }],
  },
  optionCardCorrect: {
    backgroundColor: '#FFF2FA',
    borderColor: '#FFB3D1',
  },
  optionCardWrong: {
    backgroundColor: '#FFE8EF',
    borderColor: '#FF9DB6',
  },
  optionText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#7E2D6A',
  },
  optionTextCorrect: {
    color: '#FF6B9E',
  },
  resultsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 18,
    borderWidth: 2,
    borderColor: '#FFD2EA',
    shadowColor: '#D84E9A',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
    gap: 14,
  },
  completeTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#7E2D6A',
  },
  completeBody: {
    fontSize: 15,
    lineHeight: 22,
    color: '#704D66',
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    flexGrow: 1,
    minWidth: '46%',
    backgroundColor: '#FFF8FC',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFD2EA',
    padding: 14,
    gap: 2,
  },
  resultsSummary: {
    backgroundColor: '#FFF0F7',
    borderRadius: 18,
    padding: 14,
    gap: 6,
  },
  summaryText: {
    fontSize: 14,
    color: '#704D66',
    fontWeight: '700',
  },
  highScore: {
    fontSize: 15,
    color: '#FF6B9E',
    fontWeight: '900',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#FFF2FA',
    borderRadius: 999,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#FF6B9E',
    fontSize: 16,
    fontWeight: '800',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#FF6B9E',
    borderRadius: 999,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
