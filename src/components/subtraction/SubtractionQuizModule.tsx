import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import KidBackdrop from '../KidBackdrop';

type QuizQuestionType = 'multiple_choice' | 'fill_blank' | 'missing_number' | 'true_false';

type QuizQuestion = {
  id: string;
  type: QuizQuestionType;
  prompt: string;
  answer: number | 'TRUE' | 'FALSE';
  correctText: string;
  questionText: string;
  left?: number;
  right?: number;
  options?: number[];
  missingSide?: 'left' | 'right';
};

type ReviewItem = {
  id: string;
  questionText: string;
  userAnswerText: string;
  correctAnswerText: string;
  isCorrect: boolean;
};

const QUIZ_SIZE = 10;

const QUESTION_PLAN: QuizQuestionType[] = [
  'multiple_choice',
  'multiple_choice',
  'multiple_choice',
  'fill_blank',
  'fill_blank',
  'fill_blank',
  'missing_number',
  'missing_number',
  'true_false',
  'true_false',
];

const QUESTION_LABELS: Record<QuizQuestionType, string> = {
  multiple_choice: 'Multiple Choice',
  fill_blank: 'Fill in the Blank',
  missing_number: 'Missing Number',
  true_false: 'True or False',
};

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

function uniqueNumbers(count: number, min: number, max: number, exclude: number) {
  const values = new Set<number>();
  while (values.size < count) {
    const value = randomInt(min, max);
    if (value !== exclude) {
      values.add(value);
    }
  }
  return [...values];
}

function generateSubtractionPair() {
  let left = 1;
  let right = 1;

  do {
    left = randomInt(1, 10);
    right = randomInt(1, left);
  } while (left - right < 0);

  return { left, right, answer: left - right };
}

function createMultipleChoiceQuestion(index: number): QuizQuestion {
  const { left, right, answer } = generateSubtractionPair();
  const options = shuffle([answer, ...uniqueNumbers(3, 0, 10, answer)]);

  return {
    id: `mc-${index}-${left}-${right}-${Math.random().toString(16).slice(2)}`,
    type: 'multiple_choice',
    prompt: `${left} - ${right} = ?`,
    questionText: `${left} - ${right} = ?`,
    answer,
    correctText: String(answer),
    left,
    right,
    options,
  };
}

function createFillBlankQuestion(index: number): QuizQuestion {
  const { left, right, answer } = generateSubtractionPair();

  return {
    id: `fb-${index}-${left}-${right}-${Math.random().toString(16).slice(2)}`,
    type: 'fill_blank',
    prompt: `${left} - ${right} = __`,
    questionText: `${left} - ${right} = __`,
    answer,
    correctText: String(answer),
    left,
    right,
  };
}

function createMissingNumberQuestion(index: number): QuizQuestion {
  const answer = randomInt(0, 10);
  const left = randomInt(answer, 10);
  const right = left - answer;
  const missingSide = Math.random() < 0.5 ? 'left' : 'right';

  const prompt = missingSide === 'left'
    ? `__ - ${right} = ${answer}`
    : `${left} - __ = ${answer}`;

  return {
    id: `mn-${index}-${left}-${right}-${Math.random().toString(16).slice(2)}`,
    type: 'missing_number',
    prompt,
    questionText: prompt,
    answer: missingSide === 'left' ? left : right,
    correctText: String(missingSide === 'left' ? left : right),
    left,
    right,
    missingSide,
    options: shuffle(uniqueNumbers(3, 0, 10, missingSide === 'left' ? left : right).concat(missingSide === 'left' ? left : right)),
  };
}

function generateFalseResult(correct: number) {
  const candidates: number[] = [];
  for (let offset = -3; offset <= 3; offset += 1) {
    if (offset === 0) continue;
    const candidate = correct + offset;
    if (candidate >= 0 && candidate <= 10) {
      candidates.push(candidate);
    }
  }

  if (candidates.length === 0) {
    return correct === 0 ? 1 : 0;
  }

  return candidates[randomInt(0, candidates.length - 1)];
}

function createTrueFalseQuestion(index: number): QuizQuestion {
  const { left, right, answer } = generateSubtractionPair();
  const shouldBeTrue = Math.random() < 0.5;
  const shownResult = shouldBeTrue ? answer : generateFalseResult(answer);

  return {
    id: `tf-${index}-${left}-${right}-${Math.random().toString(16).slice(2)}`,
    type: 'true_false',
    prompt: `${left} - ${right} = ${shownResult}`,
    questionText: `${left} - ${right} = ${shownResult}`,
    answer: shouldBeTrue ? 'TRUE' : 'FALSE',
    correctText: shouldBeTrue ? 'TRUE' : 'FALSE',
    left,
    right,
  };
}

function generateQuizQuestions() {
  const plannedTypes = shuffle(QUESTION_PLAN);
  return plannedTypes.map((type, index) => {
    if (type === 'multiple_choice') {
      return createMultipleChoiceQuestion(index);
    }
    if (type === 'fill_blank') {
      return createFillBlankQuestion(index);
    }
    if (type === 'missing_number') {
      return createMissingNumberQuestion(index);
    }
    return createTrueFalseQuestion(index);
  });
}

function ratingForScore(score: number) {
  const accuracy = Math.round((score / QUIZ_SIZE) * 100);

  if (accuracy >= 90) return { label: '⭐⭐⭐ Excellent', accuracy };
  if (accuracy >= 75) return { label: '⭐⭐ Great Job', accuracy };
  if (accuracy >= 50) return { label: '⭐ Keep Practicing', accuracy };
  return { label: 'Try Again', accuracy };
}

export default function SubtractionQuizModule() {
  const { t } = useTranslation();
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => generateQuizQuestions());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [review, setReview] = useState<ReviewItem[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [stars, setStars] = useState(0);
  const [badge, setBadge] = useState<string | null>(null);

  const currentQuestion = questions[currentIndex];
  const progress = Math.min(currentIndex + 1, QUIZ_SIZE);
  const rating = useMemo(() => ratingForScore(score), [score]);

  function resetQuiz() {
    const nextQuestions = generateQuizQuestions();
    setQuestions(nextQuestions);
    setCurrentIndex(0);
    setScore(0);
    setReview([]);
    setInputValue('');
    setLocked(false);
    setFeedback(null);
    setSelectedAnswer(null);
    setCompleted(false);
    setStars(0);
    setBadge(null);
  }

  function commitAnswer(userAnswerText: string, isCorrect: boolean) {
    if (!currentQuestion) {
      return;
    }

    setLocked(true);
    setFeedback(isCorrect ? t('subtraction_quiz.correct', { defaultValue: 'Correct!' }) : t('subtraction_quiz.try_again', { defaultValue: 'Try Again' }));
    setSelectedAnswer(userAnswerText);

    if (isCorrect) {
      setScore((value) => value + 1);
    }

    setReview((value) => [
      ...value,
      {
        id: currentQuestion.id,
        questionText: currentQuestion.questionText,
        userAnswerText,
        correctAnswerText: currentQuestion.correctText,
        isCorrect,
      },
    ]);
  }

  const numericAnswer = Number(inputValue);
  const numericAnswerIsCorrect = locked && currentQuestion?.type !== 'multiple_choice'
    ? inputValue.length > 0 && numericAnswer === Number(currentQuestion.answer)
    : false;
  const numericAnswerIsWrong = locked && currentQuestion?.type !== 'multiple_choice' && inputValue.length > 0 && !numericAnswerIsCorrect;

  function goNextQuestion() {
    if (currentIndex + 1 >= questions.length) {
      const finalScore = score;
      const finalAccuracy = Math.round((finalScore / QUIZ_SIZE) * 100);
      setCompleted(true);
      setStars(5 + (finalAccuracy >= 80 ? 10 : 0));
      if (finalScore === QUIZ_SIZE) {
        setBadge(t('subtraction_quiz.badge_master', { defaultValue: 'Subtraction Quiz Master' }));
      }
      return;
    }

    setCurrentIndex((value) => value + 1);
    setInputValue('');
    setLocked(false);
    setFeedback(null);
    setSelectedAnswer(null);
  }

  function handleMultipleChoiceSelect(option: number) {
    if (locked || !currentQuestion) {
      return;
    }
    const isCorrect = option === currentQuestion.answer;
    commitAnswer(String(option), isCorrect);
  }

  function handleMissingNumberSelect(option: number) {
    if (locked || !currentQuestion) {
      return;
    }
    const isCorrect = option === currentQuestion.answer;
    commitAnswer(String(option), isCorrect);
  }

  function handleTrueFalseSelect(value: 'TRUE' | 'FALSE') {
    if (locked || !currentQuestion) {
      return;
    }
    const isCorrect = value === currentQuestion.answer;
    commitAnswer(value, isCorrect);
  }

  function handleKeypadPress(value: string) {
    if (locked) {
      return;
    }
    setInputValue((current) => {
      if (value === 'backspace') {
        return current.slice(0, -1);
      }
      if (value === 'clear') {
        return '';
      }
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
    if (locked || !currentQuestion) {
      return;
    }

    const parsed = Number(inputValue);
    const isCorrect = inputValue.length > 0 && parsed === Number(currentQuestion.answer);
    commitAnswer(inputValue || '—', isCorrect);
  }

  const correctCount = review.filter((item) => item.isCorrect).length;
  const incorrectCount = review.length - correctCount;

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <KidBackdrop />
      <View style={styles.headerCard}>
        <View>
          <Text style={styles.kicker}>{t('activities.quiz')}</Text>
          <Text style={styles.headerTitle}>{t('subtraction_quiz.title', { defaultValue: 'Subtraction Quiz' })}</Text>
          <Text style={styles.headerSubtitle}>{t('subtraction_quiz.subtitle', { defaultValue: 'Mixed quiz mode' })}</Text>
        </View>
      </View>

      {!completed ? (
        <>
          <View style={styles.progressCard}>
            <Text style={styles.progressLabel}>
              {t('subtraction_quiz.progress', { defaultValue: 'Question {{current}} / {{total}}', current: progress, total: QUIZ_SIZE })}
            </Text>
            <Text style={styles.progressValue}>{progress}/{QUIZ_SIZE}</Text>
          </View>

          <View style={styles.quizCard}>
            <Text style={styles.questionType}>{QUESTION_LABELS[currentQuestion?.type ?? 'multiple_choice']}</Text>
            <Text style={styles.questionText}>{currentQuestion?.questionText}</Text>
            <Text style={styles.hintText}>{feedback ?? t('subtraction_quiz.choose_answer', { defaultValue: 'Choose an answer.' })}</Text>

            {currentQuestion?.type === 'multiple_choice' ? (
              <View style={styles.optionGrid}>
                {currentQuestion.options?.map((option) => {
                  const active = locked && option === Number(currentQuestion.answer);
                  const chosen = locked && selectedAnswer === String(option) && !active;
                  return (
                    <Pressable
                      key={`${currentQuestion.id}-${option}`}
                      onPress={() => handleMultipleChoiceSelect(option)}
                      style={({ pressed }) => [
                        styles.optionCard,
                        active && styles.optionCardCorrect,
                        chosen && styles.optionCardWrong,
                        pressed && !locked && styles.optionCardPressed,
                      ]}
                      accessibilityRole="button"
                    >
                      <Text style={[styles.optionValue, active && styles.optionValueCorrect]}>{option}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}

            {currentQuestion?.type === 'fill_blank' ? (
              <View style={styles.numericSection}>
                <View style={[
                  styles.inputDisplay,
                  numericAnswerIsCorrect && styles.inputDisplayCorrect,
                  numericAnswerIsWrong && styles.inputDisplayWrong,
                ]}>
                  <Text style={[
                    styles.inputText,
                    numericAnswerIsCorrect && styles.inputTextCorrect,
                    numericAnswerIsWrong && styles.inputTextWrong,
                  ]}>
                    {locked && inputValue.length > 0 ? inputValue : inputValue || ' '}
                  </Text>
                </View>
                {locked ? (
                  <Text style={styles.correctAnswerText}>
                    {t('subtraction_quiz.correct_answer', { defaultValue: 'Correct Answer' })}: {currentQuestion?.answer}
                  </Text>
                ) : null}
                <View style={styles.keypad}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((digit) => (
                    <Pressable
                      key={digit}
                      onPress={() => handleKeypadPress(String(digit))}
                      style={styles.keypadKey}
                      accessibilityRole="button"
                    >
                      <Text style={styles.keypadText}>{digit}</Text>
                    </Pressable>
                  ))}
                  <Pressable onPress={() => handleKeypadPress('backspace')} style={styles.keypadKey} accessibilityRole="button">
                    <Text style={styles.keypadText}>⌫</Text>
                  </Pressable>
                  <Pressable onPress={() => handleKeypadPress('clear')} style={styles.keypadKey} accessibilityRole="button">
                    <Text style={styles.keypadText}>C</Text>
                  </Pressable>
                </View>
                <Pressable style={styles.primaryButton} onPress={submitNumericAnswer} accessibilityRole="button">
                  <Text style={styles.primaryButtonText}>{t('subtraction_quiz.submit', { defaultValue: 'Save Answer' })}</Text>
                </Pressable>
              </View>
            ) : null}

            {currentQuestion?.type === 'missing_number' ? (
              <View style={styles.optionGrid}>
                {currentQuestion.options?.map((option) => {
                  const active = locked && option === Number(currentQuestion.answer);
                  const chosen = locked && selectedAnswer === String(option) && !active;
                  return (
                    <Pressable
                      key={`${currentQuestion.id}-${option}`}
                      onPress={() => handleMissingNumberSelect(option)}
                      style={({ pressed }) => [
                        styles.optionCard,
                        active && styles.optionCardCorrect,
                        chosen && styles.optionCardWrong,
                        pressed && !locked && styles.optionCardPressed,
                      ]}
                      accessibilityRole="button"
                    >
                      <Text style={[styles.optionValue, active && styles.optionValueCorrect]}>{option}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}

            {currentQuestion?.type === 'true_false' ? (
              <View style={styles.trueFalseRow}>
                <Pressable
                  style={[
                    styles.trueFalseButton,
                    locked && currentQuestion.answer === 'TRUE' && styles.trueFalseButtonCorrect,
                    locked && selectedAnswer === 'TRUE' && currentQuestion.answer !== 'TRUE' && styles.trueFalseButtonWrong,
                  ]}
                  onPress={() => handleTrueFalseSelect('TRUE')}
                  accessibilityRole="button"
                >
                  <Text style={styles.trueFalseText}>{t('subtraction_quiz.true', { defaultValue: 'TRUE' })}</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.trueFalseButton,
                    locked && currentQuestion.answer === 'FALSE' && styles.trueFalseButtonCorrect,
                    locked && selectedAnswer === 'FALSE' && currentQuestion.answer !== 'FALSE' && styles.trueFalseButtonWrong,
                  ]}
                  onPress={() => handleTrueFalseSelect('FALSE')}
                  accessibilityRole="button"
                >
                  <Text style={styles.trueFalseText}>{t('subtraction_quiz.false', { defaultValue: 'FALSE' })}</Text>
                </Pressable>
              </View>
            ) : null}

            {locked ? (
              <View style={styles.actionRow}>
                <Pressable style={styles.primaryButton} onPress={goNextQuestion} accessibilityRole="button">
                  <Text style={styles.primaryButtonText}>
                    {currentIndex + 1 >= questions.length
                      ? t('subtraction_quiz.results', { defaultValue: 'See Results' })
                      : t('subtraction_quiz.next_question', { defaultValue: 'Next Question' })}
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        </>
      ) : (
        <View style={styles.resultsCard}>
          <Text style={styles.completeTitle}>{t('subtraction_quiz.quiz_complete', { defaultValue: 'Quiz Complete' })}</Text>
          <Text style={styles.completeBody}>{rating.label}</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{score}/{QUIZ_SIZE}</Text>
              <Text style={styles.statLabel}>{t('subtraction_quiz.score', { defaultValue: 'Score' })}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{rating.accuracy}%</Text>
              <Text style={styles.statLabel}>{t('subtraction_quiz.accuracy', { defaultValue: 'Accuracy' })}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{correctCount}</Text>
              <Text style={styles.statLabel}>{t('subtraction_quiz.correct_answers', { defaultValue: 'Correct Answers' })}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{incorrectCount}</Text>
              <Text style={styles.statLabel}>{t('subtraction_quiz.incorrect_answers', { defaultValue: 'Incorrect Answers' })}</Text>
            </View>
          </View>

          <View style={styles.rewardCard}>
            <Text style={styles.rewardLabel}>{t('subtraction_quiz.rewards', { defaultValue: 'Rewards' })}</Text>
            <Text style={styles.rewardValue}>+5 Stars</Text>
            {rating.accuracy >= 80 ? <Text style={styles.rewardValue}>+10 Bonus Stars</Text> : null}
            {badge ? <Text style={styles.rewardValue}>{badge}</Text> : null}
          </View>

          <View style={styles.reviewHeader}>
            <Text style={styles.reviewTitle}>{t('subtraction_quiz.review_title', { defaultValue: 'Review Answers' })}</Text>
            <Pressable style={styles.secondaryButton} onPress={resetQuiz} accessibilityRole="button">
              <Text style={styles.secondaryButtonText}>{t('subtraction_quiz.replay', { defaultValue: 'Replay Quiz' })}</Text>
            </Pressable>
          </View>

          <View style={styles.reviewList}>
            {review.map((item, index) => (
              <View key={item.id} style={styles.reviewItem}>
                <Text style={styles.reviewQuestion}>
                  {index + 1}. {item.questionText}
                </Text>
                <Text style={[styles.reviewOutcome, item.isCorrect ? styles.reviewOutcomeCorrect : styles.reviewOutcomeWrong]}>
                  {item.userAnswerText} {item.isCorrect ? '✅' : '❌'}
                </Text>
                {!item.isCorrect ? (
                  <Text style={styles.reviewCorrectAnswer}>
                    {t('subtraction_quiz.correct_answer', { defaultValue: 'Correct Answer' })}: {item.correctAnswerText}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        </View>
      )}
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
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 2,
    borderColor: '#FFD2EA',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 15,
    color: '#704D66',
    fontWeight: '700',
  },
  progressValue: {
    fontSize: 16,
    color: '#7E2D6A',
    fontWeight: '900',
  },
  quizCard: {
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
  questionType: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FF6B9E',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  questionText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#7E2D6A',
  },
  hintText: {
    fontSize: 15,
    color: '#704D66',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionCard: {
    width: '48%',
    minHeight: 76,
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
  optionValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#7E2D6A',
  },
  optionValueCorrect: {
    color: '#FF6B9E',
  },
  numericSection: {
    gap: 14,
  },
  inputDisplay: {
    minHeight: 72,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FFD2EA',
    backgroundColor: '#FFF8FC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  inputDisplayCorrect: {
    backgroundColor: '#FFF2FA',
    borderColor: '#FFB3D1',
  },
  inputDisplayWrong: {
    backgroundColor: '#FFE8EF',
    borderColor: '#FF9DB6',
  },
  inputText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#7E2D6A',
  },
  inputTextCorrect: {
    color: '#FF6B9E',
  },
  inputTextWrong: {
    color: '#C94B4B',
  },
  correctAnswerText: {
    fontSize: 14,
    color: '#FF6B9E',
    fontWeight: '800',
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  keypadKey: {
    width: '30%',
    minHeight: 56,
    borderRadius: 14,
    backgroundColor: '#FFF0F7',
    borderWidth: 2,
    borderColor: '#FFD2EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#7E2D6A',
  },
  trueFalseRow: {
    flexDirection: 'row',
    gap: 12,
  },
  trueFalseButton: {
    flex: 1,
    minHeight: 72,
    borderRadius: 18,
    backgroundColor: '#FFF8FC',
    borderWidth: 2,
    borderColor: '#FFD2EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trueFalseButtonCorrect: {
    backgroundColor: '#FFF2FA',
    borderColor: '#FFB3D1',
  },
  trueFalseButtonWrong: {
    backgroundColor: '#FFE8EF',
    borderColor: '#FF9DB6',
  },
  trueFalseText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#7E2D6A',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  primaryButton: {
    backgroundColor: '#FF6B9E',
    borderRadius: 999,
    paddingVertical: 15,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
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
  rewardCard: {
    backgroundColor: '#FFF0F7',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FFB3D1',
    padding: 14,
    gap: 4,
  },
  rewardLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FF6B9E',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  rewardValue: {
    fontSize: 15,
    color: '#7E2D6A',
    fontWeight: '800',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#7E2D6A',
  },
  secondaryButton: {
    backgroundColor: '#FFF2FA',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  secondaryButtonText: {
    color: '#FF6B9E',
    fontSize: 14,
    fontWeight: '800',
  },
  reviewList: {
    gap: 10,
  },
  reviewItem: {
    backgroundColor: '#FFF8FC',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FFD2EA',
    padding: 14,
    gap: 6,
  },
  reviewQuestion: {
    fontSize: 15,
    color: '#7E2D6A',
    fontWeight: '800',
  },
  reviewOutcome: {
    fontSize: 14,
    fontWeight: '900',
  },
  reviewOutcomeCorrect: {
    color: '#FF6B9E',
  },
  reviewOutcomeWrong: {
    color: '#C94B4B',
  },
  reviewCorrectAnswer: {
    fontSize: 14,
    color: '#704D66',
    fontWeight: '700',
  },
});
