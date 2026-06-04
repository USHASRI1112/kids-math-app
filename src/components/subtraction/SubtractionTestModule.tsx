import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

type TestQuestionType = 'multiple_choice' | 'fill_blank' | 'missing_number' | 'true_false';
type TestMode = 'loading' | 'instructions' | 'active' | 'results';

type TestQuestion = {
  id: string;
  type: TestQuestionType;
  prompt: string;
  questionText: string;
  left: number;
  right: number;
  answer: number | 'TRUE' | 'FALSE';
  correctText: string;
  options?: number[];
};

type AnswerEntry = {
  questionId: string;
  selectedAnswer: string | null;
  isCorrect: boolean | null;
};

type SavedState = {
  version: 1;
  questions: TestQuestion[];
  answers: AnswerEntry[];
  currentIndex: number;
  timeLeft: number;
  score: number;
  correct: number;
  incorrect: number;
  startedAt: number;
  mode: Exclude<TestMode, 'loading'>;
};

type ReviewItem = {
  questionText: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
};

const TEST_DURATION_SECONDS = 15 * 60;
const TEST_QUESTION_COUNT = 20;
const STORAGE_KEY = 'subtraction-test-state';

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
    const candidate = randomInt(0, 9);
    if (candidate !== exclude) {
      values.add(candidate);
    }
  }
  return [...values];
}

function generatePair() {
  const left = randomInt(1, 10);
  const right = randomInt(1, left);
  return { left, right, answer: left - right };
}

function createMultipleChoice(index: number): TestQuestion {
  const { left, right, answer } = generatePair();
  return {
    id: `test-mc-${index}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type: 'multiple_choice',
    prompt: `${left} - ${right} = ?`,
    questionText: `${left} - ${right} = ?`,
    left,
    right,
    answer,
    correctText: String(answer),
    options: shuffle([answer, ...uniqueNumbers(3, answer)]),
  };
}

function createFillBlank(index: number): TestQuestion {
  const { left, right, answer } = generatePair();
  return {
    id: `test-fb-${index}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type: 'fill_blank',
    prompt: `${left} - ${right} = __`,
    questionText: `${left} - ${right} = __`,
    left,
    right,
    answer,
    correctText: String(answer),
  };
}

function createMissingNumber(index: number): TestQuestion {
  const { left, right, answer } = generatePair();
  const missingLeft = Math.random() < 0.5;
  const missingValue = missingLeft ? left : right;
  return {
    id: `test-mn-${index}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type: 'missing_number',
    prompt: missingLeft ? `__ - ${right} = ${answer}` : `${left} - __ = ${answer}`,
    questionText: missingLeft ? `__ - ${right} = ${answer}` : `${left} - __ = ${answer}`,
    left,
    right,
    answer: missingValue,
    correctText: String(missingValue),
  };
}

function getFalseResult(correct: number) {
  const pool: number[] = [];
  for (let offset = -3; offset <= 3; offset += 1) {
    if (offset === 0) continue;
    const candidate = correct + offset;
    if (candidate >= 0 && candidate <= 9) {
      pool.push(candidate);
    }
  }
  return pool.length ? pool[randomInt(0, pool.length - 1)] : Math.min(9, correct + 1);
}

function createTrueFalse(index: number): TestQuestion {
  const { left, right, answer } = generatePair();
  const shouldBeTrue = Math.random() < 0.5;
  const shownResult = shouldBeTrue ? answer : getFalseResult(answer);
  return {
    id: `test-tf-${index}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type: 'true_false',
    prompt: `${left} - ${right} = ${shownResult}`,
    questionText: `${left} - ${right} = ${shownResult}`,
    left,
    right,
    answer: shouldBeTrue ? 'TRUE' : 'FALSE',
    correctText: shouldBeTrue ? 'TRUE' : 'FALSE',
  };
}

function buildQuestions() {
  const plan: TestQuestionType[] = shuffle([
    'multiple_choice', 'multiple_choice', 'multiple_choice', 'multiple_choice', 'multiple_choice',
    'fill_blank', 'fill_blank', 'fill_blank', 'fill_blank', 'fill_blank',
    'missing_number', 'missing_number', 'missing_number', 'missing_number', 'missing_number',
    'true_false', 'true_false', 'true_false', 'true_false', 'true_false',
  ]);

  return plan.map((type, index) => {
    if (type === 'multiple_choice') return createMultipleChoice(index);
    if (type === 'fill_blank') return createFillBlank(index);
    if (type === 'missing_number') return createMissingNumber(index);
    return createTrueFalse(index);
  });
}

function emptyAnswers(questions: TestQuestion[]): AnswerEntry[] {
  return questions.map((question) => ({
    questionId: question.id,
    selectedAnswer: null,
    isCorrect: null,
  }));
}

function formatSeconds(total: number) {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function gradeFromAccuracy(accuracy: number) {
  if (accuracy >= 90) return { grade: 'A', label: 'Grade A' };
  if (accuracy >= 75) return { grade: 'B', label: 'Grade B' };
  if (accuracy >= 60) return { grade: 'C', label: 'Grade C' };
  if (accuracy >= 40) return { grade: 'D', label: 'Grade D' };
  return { grade: 'F', label: 'Needs Improvement' };
}

function badgeForScore(accuracy: number, score: number) {
  if (score === TEST_QUESTION_COUNT) {
    return 'Subtraction Champion Badge';
  }
  if (accuracy >= 90) {
    return 'Subtraction Master Badge';
  }
  if (accuracy >= 60) {
    return 'Subtraction Explorer Badge';
  }
  return null;
}

function questionTypeLabel(type: TestQuestionType) {
  if (type === 'multiple_choice') return 'Multiple Choice';
  if (type === 'fill_blank') return 'Fill in the Blank';
  if (type === 'missing_number') return 'Missing Number';
  return 'True or False';
}

function buildResultSnapshot(questions: TestQuestion[], answers: AnswerEntry[], timeLeft: number) {
  const answeredItems = answers.filter((item) => item.selectedAnswer !== null);
  const unanswered = TEST_QUESTION_COUNT - answeredItems.length;
  const correctAnswers = questions.reduce((count, question, index) => {
    const entry = answers[index];
    if (!entry?.selectedAnswer) {
      return count;
    }
    return String(entry.selectedAnswer) === String(question.answer) ? count + 1 : count;
  }, 0);
  const incorrectAnswers = answeredItems.length - correctAnswers;
  const stats: Record<TestQuestionType, { correct: number; total: number }> = {
    multiple_choice: { correct: 0, total: 0 },
    fill_blank: { correct: 0, total: 0 },
    missing_number: { correct: 0, total: 0 },
    true_false: { correct: 0, total: 0 },
  };

  questions.forEach((question, index) => {
    const entry = answers[index];
    if (!entry || entry.selectedAnswer === null) {
      return;
    }
    stats[question.type].total += 1;
    if (String(entry.selectedAnswer) === String(question.answer)) {
      stats[question.type].correct += 1;
    }
  });

  const entries = Object.entries(stats).map(([type, stat]) => ({
    type: type as TestQuestionType,
    accuracy: stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0,
  }));
  entries.sort((a, b) => b.accuracy - a.accuracy);
  const strongest = entries[0]?.type ?? 'multiple_choice';
  entries.sort((a, b) => a.accuracy - b.accuracy);
  const weakest = entries[0]?.type ?? 'multiple_choice';

  const accuracy = questions.length > 0 ? Math.round((correctAnswers / questions.length) * 100) : 0;
  const gradeInfo = gradeFromAccuracy(accuracy);
  const badge = badgeForScore(accuracy, correctAnswers);

  return {
    score: correctAnswers,
    correct: correctAnswers,
    incorrect: incorrectAnswers,
    accuracy,
    timeUsed: TEST_DURATION_SECONDS - timeLeft,
    grade: gradeInfo.label,
    badge,
    unanswered,
    strongArea: questionTypeLabel(strongest),
    needsImprovement: questionTypeLabel(weakest),
  };
}

export default function SubtractionTestModule() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<TestMode>('loading');
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [answers, setAnswers] = useState<AnswerEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION_SECONDS);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [startedAt, setStartedAt] = useState<number>(Date.now());
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [results, setResults] = useState<{
    score: number;
    correct: number;
    incorrect: number;
    accuracy: number;
    timeUsed: number;
    grade: string;
    badge: string | null;
    unanswered: number;
    strongArea: string;
    needsImprovement: string;
  } | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentQuestion = questions[currentIndex];
  const answeredCount = answers.filter((item) => item.selectedAnswer !== null).length;
  const unansweredCount = TEST_QUESTION_COUNT - answeredCount;
  const currentAnswer = answers[currentIndex];
  const currentSelected = currentAnswer?.selectedAnswer ?? null;

  const reviewItems = useMemo(() => {
    return questions.map((question, index) => {
      const answer = answers[index];
      const isCorrect = answer?.selectedAnswer !== null && String(answer.selectedAnswer) === String(question.answer);
      return {
        questionText: question.questionText,
        selectedAnswer: answer?.selectedAnswer ?? '',
        correctAnswer: question.correctText,
        isCorrect,
      };
    });
  }, [answers, questions]);

  function clearSavedState() {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => undefined);
  }

  function persistState(nextState: SavedState) {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextState)).catch(() => undefined);
    }, 150);
  }

  function buildSavedState(nextMode: Exclude<TestMode, 'loading'>): SavedState {
    return {
      version: 1,
      questions,
      answers,
      currentIndex,
      timeLeft,
      score,
      correct,
      incorrect,
      startedAt,
      mode: nextMode,
    };
  }

  function finalizeTest() {
    setResults(buildResultSnapshot(questions, answers, timeLeft));
    setMode('results');
    setReviewMode(true);
    clearSavedState();
  }

  function startNewTest() {
    const nextQuestions = buildQuestions();
    const nextAnswers = emptyAnswers(nextQuestions);
    const now = Date.now();

    setQuestions(nextQuestions);
    setAnswers(nextAnswers);
    setCurrentIndex(0);
    setTimeLeft(TEST_DURATION_SECONDS);
    setScore(0);
    setCorrect(0);
    setIncorrect(0);
    setStartedAt(now);
    setInputValue('');
    setFeedback(null);
    setReviewMode(false);
    setResults(null);
    setMode('active');

    persistState({
      version: 1,
      questions: nextQuestions,
      answers: nextAnswers,
      currentIndex: 0,
      timeLeft: TEST_DURATION_SECONDS,
      score: 0,
      correct: 0,
      incorrect: 0,
      startedAt: now,
      mode: 'active',
    });
  }

  function restoreSavedState(saved: SavedState) {
    setQuestions(saved.questions);
    setAnswers(saved.answers);
    setCurrentIndex(Math.min(saved.currentIndex, saved.questions.length - 1));
    setTimeLeft(saved.timeLeft);
    setScore(saved.score);
    setCorrect(saved.correct);
    setIncorrect(saved.incorrect);
    setStartedAt(saved.startedAt);
    setMode(saved.mode === 'results' ? 'results' : 'active');
    setReviewMode(saved.mode === 'results');
  }

  useEffect(() => {
    let mounted = true;

    async function loadState() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!mounted) {
          return;
        }
        if (!raw) {
          setMode('instructions');
          setLoaded(true);
          return;
        }

        const parsed = JSON.parse(raw) as SavedState;
        if (parsed.version !== 1 || !Array.isArray(parsed.questions) || parsed.questions.length !== TEST_QUESTION_COUNT) {
          await clearSavedState();
          setMode('instructions');
          setLoaded(true);
          return;
        }

        if (parsed.mode === 'results' || parsed.timeLeft <= 0) {
          restoreSavedState(parsed);
          setResults(buildResultSnapshot(parsed.questions, parsed.answers, parsed.timeLeft));
          setMode('results');
          setReviewMode(true);
          await clearSavedState();
          setLoaded(true);
          return;
        }

        restoreSavedState(parsed);
        setLoaded(true);
      } catch {
        if (mounted) {
          setMode('instructions');
          setLoaded(true);
        }
      }
    }

    loadState();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!loaded || mode !== 'active') {
      return;
    }
    persistState(buildSavedState('active'));
  }, [answers, correct, currentIndex, incorrect, loaded, mode, questions, score, startedAt, timeLeft]);

  useEffect(() => {
    if (mode !== 'active') {
      return;
    }

    if (timeLeft <= 0) {
      finalizeTest();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [mode, timeLeft]);

  function recordAnswer(questionIndex: number, selected: string) {
    setAnswers((current) => {
      const next = [...current];
      next[questionIndex] = {
        questionId: questions[questionIndex].id,
        selectedAnswer: selected,
        isCorrect: null,
      };
      return next;
    });
    setFeedback(t('subtraction_test.saved', { defaultValue: 'Saved' }));
    setInputValue('');
  }

  function handleMultipleChoiceSelect(option: number) {
    if (mode !== 'active' || !currentQuestion) {
      return;
    }
    recordAnswer(currentIndex, String(option));
  }

  function handleTrueFalseSelect(option: 'TRUE' | 'FALSE') {
    if (mode !== 'active' || !currentQuestion) {
      return;
    }
    recordAnswer(currentIndex, option);
  }

  function handleNumericInput(value: string) {
    if (value === 'backspace') {
      setInputValue((current) => current.slice(0, -1));
      return;
    }
    if (value === 'clear') {
      setInputValue('');
      return;
    }
    setInputValue((current) => {
      if (current.length >= 2) {
        return current;
      }
      if (current === '0') {
        return value === '0' ? current : value;
      }
      return `${current}${value}`;
    });
  }

  function submitNumericAnswer() {
    if (mode !== 'active' || !currentQuestion || !inputValue) {
      return;
    }
    recordAnswer(currentIndex, inputValue);

    if ((currentQuestion.type === 'fill_blank' || currentQuestion.type === 'missing_number') && currentIndex < TEST_QUESTION_COUNT - 1) {
      setTimeout(() => {
        goToQuestion(currentIndex + 1);
      }, 180);
    }
  }

  function goToQuestion(index: number) {
    const clamped = Math.max(0, Math.min(TEST_QUESTION_COUNT - 1, index));
    setCurrentIndex(clamped);
    setFeedback(null);
    const selected = answers[clamped]?.selectedAnswer ?? '';
    const question = questions[clamped];
    if (question?.type === 'fill_blank' || question?.type === 'missing_number') {
      setInputValue(selected);
    } else {
      setInputValue('');
    }
  }

  function submitTest() {
    finalizeTest();
  }

  function jumpToFirstUnanswered() {
    const firstUnanswered = answers.findIndex((item) => item.selectedAnswer === null);
    if (firstUnanswered >= 0) {
      goToQuestion(firstUnanswered);
      setReviewMode(false);
    }
  }

  function showQuestionNavigator() {
    setReviewMode((current) => !current);
  }

  const unansweredChips = questions.map((question, index) => ({
    id: question.id,
    index,
    unanswered: answers[index]?.selectedAnswer === null,
  }));

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerCard}>
        <View>
          <Text style={styles.kicker}>{t('activities.test')}</Text>
          <Text style={styles.headerTitle}>{t('subtraction_test.title', { defaultValue: 'Subtraction Test' })}</Text>
          <Text style={styles.headerSubtitle}>{t('subtraction_test.subtitle', { defaultValue: '15 minute assessment' })}</Text>
        </View>
      </View>

      {mode === 'instructions' ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('subtraction_test.instructions_title', { defaultValue: 'Instructions' })}</Text>
          <Text style={styles.bodyText}>{t('subtraction_test.instructions_body', { defaultValue: 'Answer 20 mixed subtraction questions. Take your time, review unanswered items, and submit when you are done.' })}</Text>
          <View style={styles.instructionsList}>
            <Text style={styles.bulletText}>• {t('subtraction_test.instructions_time', { defaultValue: 'You have 15 minutes.' })}</Text>
            <Text style={styles.bulletText}>• {t('subtraction_test.instructions_review', { defaultValue: 'You can move back and forth between questions.' })}</Text>
            <Text style={styles.bulletText}>• {t('subtraction_test.instructions_auto', { defaultValue: 'Your answers are saved automatically.' })}</Text>
          </View>
          <Pressable style={styles.primaryButton} onPress={startNewTest} accessibilityRole="button">
            <Text style={styles.primaryButtonText}>{t('subtraction_test.start_test', { defaultValue: 'Start Test' })}</Text>
          </Pressable>
        </View>
      ) : null}

      {mode === 'active' ? (
        <>
          <View style={styles.topStatsCard}>
            <View style={styles.topStat}>
              <Text style={styles.topStatLabel}>{t('subtraction_test.time_remaining', { defaultValue: 'Time Remaining' })}</Text>
              <Text style={styles.topStatValue}>{formatSeconds(timeLeft)}</Text>
            </View>
            <View style={styles.topStat}>
              <Text style={styles.topStatLabel}>{t('subtraction_test.score', { defaultValue: 'Score' })}</Text>
              <Text style={styles.topStatValue}>{score}</Text>
            </View>
            <View style={styles.topStat}>
              <Text style={styles.topStatLabel}>{t('subtraction_test.answered', { defaultValue: 'Answered' })}</Text>
              <Text style={styles.topStatValue}>{answeredCount}/{TEST_QUESTION_COUNT}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.progressHeader}>
              <Text style={styles.sectionTitle}>{t('subtraction_test.question_of', { defaultValue: 'Question {{current}} of {{total}}', current: currentIndex + 1, total: TEST_QUESTION_COUNT })}</Text>
              <Pressable style={styles.secondaryButton} onPress={showQuestionNavigator} accessibilityRole="button">
                <Text style={styles.secondaryButtonText}>
                  {reviewMode ? t('subtraction_test.hide_review', { defaultValue: 'Hide Review' }) : t('subtraction_test.review_unanswered', { defaultValue: 'Review Unanswered' })}
                </Text>
              </Pressable>
            </View>

            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${(answeredCount / TEST_QUESTION_COUNT) * 100}%` }]} />
            </View>

            <Text style={styles.progressMeta}>
              {t('subtraction_test.unanswered', { defaultValue: 'Unanswered' })}: {unansweredCount}
            </Text>

            {reviewMode ? (
              <View style={styles.navigatorWrap}>
                {unansweredChips.map((chip, index) => (
                  <Pressable
                    key={chip.id}
                    onPress={() => goToQuestion(index)}
                    style={[
                      styles.navigatorChip,
                      index === currentIndex && styles.navigatorChipActive,
                      !chip.unanswered && styles.navigatorChipAnswered,
                    ]}
                    accessibilityRole="button"
                  >
                    <Text style={[styles.navigatorChipText, index === currentIndex && styles.navigatorChipTextActive]}>
                      {index + 1}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}

            <Text style={styles.questionTypeLabel}>
              {currentQuestion?.type === 'multiple_choice'
                ? 'Multiple Choice'
                : currentQuestion?.type === 'fill_blank'
                  ? 'Fill in the Blank'
                  : currentQuestion?.type === 'missing_number'
                    ? 'Missing Number'
                    : 'True or False'}
            </Text>
            <Text style={styles.questionText}>{currentQuestion?.questionText}</Text>
            <Text style={styles.feedbackText}>
              {feedback ?? t('subtraction_test.answer_prompt', { defaultValue: 'Take your time and answer carefully.' })}
            </Text>

            {currentQuestion?.type === 'multiple_choice' ? (
              <View style={styles.optionGrid}>
                {currentQuestion.options?.map((option) => {
                  const isSelected = currentSelected === String(option);
                  return (
                    <Pressable
                      key={`${currentQuestion.id}-${option}`}
                      onPress={() => handleMultipleChoiceSelect(option)}
                      style={[
                        styles.optionCard,
                        isSelected && styles.optionCardSelected,
                      ]}
                      accessibilityRole="button"
                    >
                      <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{option}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}

            {currentQuestion?.type === 'fill_blank' || currentQuestion?.type === 'missing_number' ? (
              <View style={styles.numericSection}>
                <View
                  style={[
                    styles.inputDisplay,
                  ]}
                >
                  <Text style={styles.inputText}>{inputValue || ' '}</Text>
                </View>
                {(currentQuestion?.type === 'fill_blank' || currentQuestion?.type === 'missing_number') && currentSelected ? (
                  <View style={styles.savedAnswerPill}>
                    <Text style={styles.savedAnswerText}>
                      {t('subtraction_test.saved_answer', { defaultValue: 'Saved Answer' })}: {currentSelected}
                    </Text>
                  </View>
                ) : null}
                <View style={styles.keypad}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((digit) => (
                    <Pressable key={digit} onPress={() => handleNumericInput(String(digit))} style={styles.keypadKey} accessibilityRole="button">
                      <Text style={styles.keypadText}>{digit}</Text>
                    </Pressable>
                  ))}
                  <Pressable onPress={() => handleNumericInput('backspace')} style={styles.keypadKey} accessibilityRole="button">
                    <Text style={styles.keypadText}>⌫</Text>
                  </Pressable>
                  <Pressable onPress={() => handleNumericInput('clear')} style={styles.keypadKey} accessibilityRole="button">
                    <Text style={styles.keypadText}>C</Text>
                  </Pressable>
                </View>
                <Pressable style={styles.primaryButton} onPress={submitNumericAnswer} accessibilityRole="button">
                  <Text style={styles.primaryButtonText}>
                    {currentQuestion?.type === 'fill_blank' || currentQuestion?.type === 'missing_number'
                      ? t('subtraction_test.save_answer', { defaultValue: 'Save Answer' })
                      : t('subtraction_test.submit_answer', { defaultValue: 'Submit Answer' })}
                  </Text>
                </Pressable>
              </View>
            ) : null}

            {currentQuestion?.type === 'true_false' ? (
              <View style={styles.trueFalseRow}>
                <Pressable
                  style={[
                    styles.trueFalseButton,
                    currentSelected === 'TRUE' && styles.trueFalseButtonSelected,
                  ]}
                  onPress={() => handleTrueFalseSelect('TRUE')}
                  accessibilityRole="button"
                >
                  <Text style={styles.trueFalseText}>{t('subtraction_test.true', { defaultValue: 'TRUE' })}</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.trueFalseButton,
                    currentSelected === 'FALSE' && styles.trueFalseButtonSelected,
                  ]}
                  onPress={() => handleTrueFalseSelect('FALSE')}
                  accessibilityRole="button"
                >
                  <Text style={styles.trueFalseText}>{t('subtraction_test.false', { defaultValue: 'FALSE' })}</Text>
                </Pressable>
              </View>
            ) : null}

            <View style={styles.actionRow}>
              <Pressable
                style={[styles.secondaryButton, currentIndex === 0 && styles.disabledButton]}
                onPress={() => goToQuestion(currentIndex - 1)}
                accessibilityRole="button"
                disabled={currentIndex === 0}
              >
                <Text style={styles.secondaryButtonText}>{t('subtraction_test.previous', { defaultValue: 'Previous' })}</Text>
              </Pressable>
              <Pressable
                style={[styles.secondaryButton, currentIndex === TEST_QUESTION_COUNT - 1 && styles.disabledButton]}
                onPress={() => goToQuestion(currentIndex + 1)}
                accessibilityRole="button"
                disabled={currentIndex === TEST_QUESTION_COUNT - 1}
              >
                <Text style={styles.secondaryButtonText}>{t('subtraction_test.next', { defaultValue: 'Next' })}</Text>
              </Pressable>
              <Pressable style={styles.primaryButton} onPress={submitTest} accessibilityRole="button">
                <Text style={styles.primaryButtonText}>{t('subtraction_test.submit_test', { defaultValue: 'Submit Test' })}</Text>
              </Pressable>
            </View>
            <Pressable style={styles.jumpButton} onPress={jumpToFirstUnanswered} accessibilityRole="button">
              <Text style={styles.jumpButtonText}>{t('subtraction_test.jump_unanswered', { defaultValue: 'Jump to First Unanswered' })}</Text>
            </Pressable>
          </View>
        </>
      ) : null}

      {mode === 'results' && results ? (
        <View style={styles.resultsCard}>
          <Text style={styles.completeTitle}>{t('subtraction_test.complete', { defaultValue: 'Subtraction Test Complete' })}</Text>
          <Text style={styles.completeBody}>
            {t('subtraction_test.score_label', { defaultValue: 'Score' })}: {results.score} / {TEST_QUESTION_COUNT}
          </Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{results.correct}</Text>
              <Text style={styles.statLabel}>{t('subtraction_test.correct_answers', { defaultValue: 'Correct Answers' })}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{results.incorrect}</Text>
              <Text style={styles.statLabel}>{t('subtraction_test.incorrect_answers', { defaultValue: 'Incorrect Answers' })}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{results.accuracy}%</Text>
              <Text style={styles.statLabel}>{t('subtraction_test.accuracy', { defaultValue: 'Accuracy' })}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{formatSeconds(results.timeUsed)}</Text>
              <Text style={styles.statLabel}>{t('subtraction_test.time_used', { defaultValue: 'Time Used' })}</Text>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>{t('subtraction_test.grade', { defaultValue: 'Grade' })}</Text>
            <Text style={styles.summaryValue}>{results.grade}</Text>
            <Text style={styles.summaryBody}>
              {results.unanswered > 0
                ? t('subtraction_test.unanswered_remaining', { defaultValue: 'Some questions were left unanswered.' })
                : t('subtraction_test.all_answered', { defaultValue: 'All questions were answered.' })}
            </Text>
            <Text style={styles.summaryBody}>{t('subtraction_test.strong_areas', { defaultValue: 'Strong Areas' })}: {results.strongArea}</Text>
            <Text style={styles.summaryBody}>{t('subtraction_test.needs_improvement', { defaultValue: 'Needs Improvement' })}: {results.needsImprovement}</Text>
            <Text style={styles.summaryBody}>
              {t('subtraction_test.recommended_practice', { defaultValue: 'Recommended Practice Activities' })}: {t('activities.practice')}
            </Text>
            {results.badge ? <Text style={styles.badgeText}>{results.badge}</Text> : null}
          </View>

          <View style={styles.reviewHeader}>
            <Text style={styles.reviewTitle}>{t('subtraction_test.review_answers', { defaultValue: 'Review Answers' })}</Text>
          </View>

          <View style={styles.reviewList}>
            {reviewItems.map((item, index) => (
              <View key={`${item.questionText}-${index}`} style={styles.reviewItem}>
                <Text style={styles.reviewQuestion}>
                  {index + 1}. {item.questionText}
                </Text>
                <Text style={[styles.reviewOutcome, item.isCorrect ? styles.reviewOutcomeCorrect : styles.reviewOutcomeWrong]}>
                  {item.selectedAnswer || t('subtraction_test.unanswered', { defaultValue: 'Unanswered' })} {item.isCorrect ? '✅' : '❌'}
                </Text>
                <Text style={styles.reviewCorrect}>
                  {t('subtraction_test.correct_answer', { defaultValue: 'Correct Answer' })}: {item.correctAnswer}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.actionRow}>
            <Pressable style={styles.primaryButton} onPress={startNewTest} accessibilityRole="button">
              <Text style={styles.primaryButtonText}>{t('subtraction_test.retry', { defaultValue: 'New Test' })}</Text>
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
  },
  headerCard: {
    backgroundColor: '#EAF2FF',
    borderRadius: 24,
    padding: 18,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '800',
    color: '#5A7DCB',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerTitle: {
    marginTop: 6,
    fontSize: 28,
    fontWeight: '900',
    color: '#16336C',
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 15,
    color: '#4A5A78',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E4EBF7',
    gap: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#16336C',
  },
  bodyText: {
    fontSize: 15,
    color: '#4A5A78',
    lineHeight: 22,
  },
  instructionsList: {
    gap: 6,
  },
  bulletText: {
    fontSize: 14,
    color: '#4A5A78',
    lineHeight: 20,
  },
  topStatsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E4EBF7',
    flexDirection: 'row',
    gap: 10,
  },
  topStat: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#F7F9FC',
    borderWidth: 1,
    borderColor: '#DCE6F8',
    padding: 12,
    gap: 3,
  },
  topStatLabel: {
    fontSize: 11,
    color: '#5D7195',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  topStatValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#16336C',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  progressBarTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#E4EBF7',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#16336C',
  },
  progressMeta: {
    fontSize: 13,
    color: '#5D7195',
    fontWeight: '700',
  },
  navigatorWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  navigatorChip: {
    minWidth: 38,
    minHeight: 38,
    borderRadius: 999,
    backgroundColor: '#F7F9FC',
    borderWidth: 1,
    borderColor: '#DCE6F8',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  navigatorChipAnswered: {
    backgroundColor: '#EAF8EF',
    borderColor: '#BFE7CC',
  },
  navigatorChipActive: {
    backgroundColor: '#16336C',
    borderColor: '#16336C',
  },
  navigatorChipText: {
    color: '#16336C',
    fontWeight: '800',
  },
  navigatorChipTextActive: {
    color: '#FFFFFF',
  },
  questionTypeLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#5A7DCB',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  questionText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#16336C',
  },
  feedbackText: {
    fontSize: 15,
    color: '#5D7195',
    fontWeight: '700',
    minHeight: 20,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionCard: {
    width: '48%',
    minHeight: 76,
    borderRadius: 18,
    backgroundColor: '#F7F9FC',
    borderWidth: 1,
    borderColor: '#DCE6F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionCardSelected: {
    transform: [{ scale: 0.98 }],
    backgroundColor: '#EEF4FF',
    borderColor: '#7D98D6',
  },
  optionCardCorrect: {
    backgroundColor: '#EAF8EF',
    borderColor: '#BFE7CC',
  },
  optionCardWrong: {
    backgroundColor: '#FFF0F0',
    borderColor: '#F4B4B4',
  },
  optionText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#16336C',
  },
  optionTextSelected: {
    color: '#16336C',
  },
  numericSection: {
    gap: 14,
  },
  inputDisplay: {
    minHeight: 72,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DCE6F8',
    backgroundColor: '#F7F9FC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  inputDisplayCorrect: {
    backgroundColor: '#EAF8EF',
    borderColor: '#BFE7CC',
  },
  inputDisplayWrong: {
    backgroundColor: '#FFF0F0',
    borderColor: '#F4B4B4',
  },
  savedAnswerPill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#EEF4FF',
    borderWidth: 1,
    borderColor: '#7D98D6',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  savedAnswerText: {
    color: '#16336C',
    fontWeight: '800',
    fontSize: 13,
  },
  inputText: {
    fontSize: 30,
    fontWeight: '900',
    color: '#16336C',
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  keypadKey: {
    width: '30%',
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: '#F4F7FD',
    borderWidth: 1,
    borderColor: '#D9E3F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#16336C',
  },
  trueFalseRow: {
    flexDirection: 'row',
    gap: 12,
  },
  trueFalseButton: {
    flex: 1,
    minHeight: 64,
    borderRadius: 18,
    backgroundColor: '#F4F7FD',
    borderWidth: 1,
    borderColor: '#D9E3F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trueFalseButtonSelected: {
    backgroundColor: '#EEF4FF',
    borderColor: '#7D98D6',
  },
  trueFalseText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#16336C',
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-end',
  },
  primaryButton: {
    backgroundColor: '#16336C',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: '#EEF4FF',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#16336C',
    fontSize: 16,
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.45,
  },
  jumpButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  jumpButtonText: {
    color: '#5A7DCB',
    fontWeight: '800',
  },
  resultsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E4EBF7',
    gap: 14,
  },
  completeTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#16336C',
  },
  completeBody: {
    fontSize: 16,
    color: '#4A5A78',
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '48%',
    borderRadius: 18,
    backgroundColor: '#F7F9FC',
    borderWidth: 1,
    borderColor: '#DCE6F8',
    padding: 14,
    gap: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#16336C',
  },
  statLabel: {
    fontSize: 13,
    color: '#5D7195',
    fontWeight: '700',
  },
  summaryCard: {
    borderRadius: 18,
    backgroundColor: '#FFF8E6',
    padding: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: '#F2E1A7',
  },
  summaryLabel: {
    color: '#8A6500',
    fontWeight: '800',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  summaryValue: {
    color: '#7A5600',
    fontSize: 18,
    fontWeight: '900',
  },
  summaryBody: {
    color: '#7A5600',
    fontSize: 14,
    fontWeight: '700',
  },
  badgeText: {
    color: '#1E7A3A',
    fontSize: 15,
    fontWeight: '900',
    marginTop: 4,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  reviewTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#16336C',
    flex: 1,
  },
  reviewList: {
    gap: 10,
  },
  reviewItem: {
    borderRadius: 18,
    backgroundColor: '#F7F9FC',
    borderWidth: 1,
    borderColor: '#DCE6F8',
    padding: 14,
    gap: 4,
  },
  reviewQuestion: {
    fontSize: 15,
    fontWeight: '800',
    color: '#16336C',
  },
  reviewOutcome: {
    fontSize: 15,
    fontWeight: '800',
  },
  reviewOutcomeCorrect: {
    color: '#1E7A3A',
  },
  reviewOutcomeWrong: {
    color: '#B02E2E',
  },
  reviewCorrect: {
    fontSize: 13,
    color: '#5D7195',
    fontWeight: '700',
  },
});
