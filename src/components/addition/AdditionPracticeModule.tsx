import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

type PracticeStage = 1 | 2 | 3;
type Difficulty = 'easy' | 'medium' | 'hard';

type MultipleChoiceQuestion = {
  left: number;
  right: number;
  answer: number;
  options: number[];
};

type MatchPair = {
  id: string;
  left: number;
  right: number;
  answer: number;
};

type BubbleOption = {
  id: string;
  value: number;
};

type BubbleQuestion = {
  left: number;
  right: number;
  answer: number;
  bubbles: BubbleOption[];
};

type MatchRound = {
  questions: MatchPair[];
  answers: BubbleOption[];
};

const STAGE_GOALS: Record<PracticeStage, number> = {
  1: 10,
  2: 5,
  3: 10,
};

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function uniqueNumbers(count: number, exclude: number) {
  const values = new Set<number>();
  while (values.size < count) {
    const value = randomInt(1, 10);
    if (value !== exclude) {
      values.add(value);
    }
  }
  return [...values];
}

function generateMultipleChoiceQuestion(): MultipleChoiceQuestion {
  let left = 1;
  let right = 1;

  do {
    left = randomInt(1, 9);
    right = randomInt(1, 9);
  } while (left + right > 10);

  const answer = left + right;
  const distractors = uniqueNumbers(3, answer);

  return {
    left,
    right,
    answer,
    options: shuffle([answer, ...distractors]),
  };
}

function generateMatchRound(): MatchRound {
  const total = randomInt(4, 6);
  const questions = Array.from({ length: total }, (_, index) => {
    const answer = randomInt(2, 10);
    const left = randomInt(1, answer - 1);
    const right = answer - left;
    return {
      id: `match-${Date.now()}-${index}-${Math.random().toString(16).slice(2)}`,
      left,
      right,
      answer,
    };
  });

  return {
    questions,
    answers: shuffle(questions.map((item) => ({ id: item.id, value: item.answer }))),
  };
}

function generateBubbleQuestion(difficulty: Difficulty): BubbleQuestion {
  let bubbleCount = 4;
  if (difficulty === 'medium') {
    bubbleCount = 6;
  } else if (difficulty === 'hard') {
    bubbleCount = 8;
  }

  let left = 1;
  let right = 1;

  do {
    left = randomInt(1, 9);
    right = randomInt(1, 9);
  } while (left + right > 10);

  const answer = left + right;
  const distractors = uniqueNumbers(bubbleCount - 1, answer);
  const bubbles = shuffle([{ id: `bubble-${Date.now()}-correct`, value: answer }, ...distractors.map((value, index) => ({ id: `bubble-${Date.now()}-${index}`, value }))]);

  return { left, right, answer, bubbles };
}

export default function AdditionPracticeModule() {
  const { t } = useTranslation();
  const [stage, setStage] = useState<PracticeStage>(1);
  const [stars, setStars] = useState(0);
  const [badge, setBadge] = useState<string | null>(null);

  const [mcQuestion, setMcQuestion] = useState<MultipleChoiceQuestion>(() => generateMultipleChoiceQuestion());
  const [mcProgress, setMcProgress] = useState(0);
  const [mcCorrect, setMcCorrect] = useState(false);
  const [mcComplete, setMcComplete] = useState(false);
  const [mcFeedback, setMcFeedback] = useState<string | null>(null);
  const [mcWrongOptionId, setMcWrongOptionId] = useState<number | null>(null);

  const [matchRoundIndex, setMatchRoundIndex] = useState(1);
  const [matchRound, setMatchRound] = useState<MatchRound>(() => generateMatchRound());
  const [matchSelectedEquation, setMatchSelectedEquation] = useState<string | null>(null);
  const [matchMatchedQuestionIds, setMatchMatchedQuestionIds] = useState<string[]>([]);
  const [matchMatchedAnswerIds, setMatchMatchedAnswerIds] = useState<string[]>([]);
  const [matchRoundComplete, setMatchRoundComplete] = useState(false);
  const [matchComplete, setMatchComplete] = useState(false);
  const [matchFeedback, setMatchFeedback] = useState<string | null>(null);
  const [matchWrongAnswerId, setMatchWrongAnswerId] = useState<string | null>(null);

  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [bubbleQuestion, setBubbleQuestion] = useState<BubbleQuestion>(() => generateBubbleQuestion('easy'));
  const [bubbleProgress, setBubbleProgress] = useState(0);
  const [bubblePoppedId, setBubblePoppedId] = useState<string | null>(null);
  const [bubbleShakenId, setBubbleShakenId] = useState<string | null>(null);
  const [bubbleComplete, setBubbleComplete] = useState(false);
  const [bubbleAnswered, setBubbleAnswered] = useState(false);
  const [bubbleFeedback, setBubbleFeedback] = useState<string | null>(null);
  const bubbleMotionMap = useRef<Record<string, Animated.Value>>({});

  function resetMultipleChoiceQuestion() {
    setMcQuestion(generateMultipleChoiceQuestion());
    setMcCorrect(false);
    setMcFeedback(null);
    setMcWrongOptionId(null);
  }

  function handleMultipleChoiceAnswer(option: number) {
    if (mcCorrect || mcComplete) {
      return;
    }

    if (option === mcQuestion.answer) {
      const nextProgress = mcProgress + 1;
      setStars((value) => value + 1);
      setMcCorrect(true);
      setMcFeedback(t('addition_practice.correct'));
      setMcWrongOptionId(null);
      setMcProgress(nextProgress);

      if (nextProgress >= STAGE_GOALS[1]) {
        setMcComplete(true);
        setStars((value) => value + 5);
        setBadge(t('addition_practice.badge_beginner'));
      }
    } else {
      setMcFeedback(t('addition_practice.try_again'));
      setMcWrongOptionId(option);
    }
  }

  function startNextMultipleChoiceQuestion() {
    resetMultipleChoiceQuestion();
  }

  function resetMatchRound(nextRoundIndex = matchRoundIndex + 1) {
    setMatchRound(generateMatchRound());
    setMatchRoundIndex(nextRoundIndex);
    setMatchSelectedEquation(null);
    setMatchMatchedQuestionIds([]);
    setMatchMatchedAnswerIds([]);
    setMatchRoundComplete(false);
    setMatchFeedback(null);
    setMatchWrongAnswerId(null);
  }

  function handleEquationSelect(id: string) {
    if (matchRoundComplete) {
      return;
    }
    if (matchMatchedQuestionIds.includes(id)) {
      return;
    }
    setMatchSelectedEquation(id);
    setMatchFeedback(null);
  }

  function handleAnswerSelect(id: string) {
    if (matchRoundComplete || !matchSelectedEquation) {
      return;
    }

    const equation = matchRound.questions.find((item) => item.id === matchSelectedEquation);
    const answer = matchRound.answers.find((item) => item.id === id);
    if (!equation || !answer) {
      return;
    }

    if (matchMatchedAnswerIds.includes(id)) {
      return;
    }

    if (equation.answer === answer.value) {
      const nextMatchedQuestions = [...matchMatchedQuestionIds, equation.id];
      const nextMatchedAnswers = [...matchMatchedAnswerIds, answer.id];
      setMatchMatchedQuestionIds(nextMatchedQuestions);
      setMatchMatchedAnswerIds(nextMatchedAnswers);
      setMatchSelectedEquation(null);
      setMatchFeedback(t('addition_practice.match_correct'));
      setMatchWrongAnswerId(null);
      setStars((value) => value + 1);

      if (nextMatchedQuestions.length === matchRound.questions.length) {
        setMatchRoundComplete(true);
        setStars((value) => value + 5);
        if (matchRoundIndex >= STAGE_GOALS[2]) {
          setMatchComplete(true);
          setBadge(t('addition_practice.badge_explorer'));
        }
      }
      return;
    }

    setMatchFeedback(t('addition_practice.try_again'));
    setMatchWrongAnswerId(id);
    setMatchSelectedEquation(null);
  }

  function resetBubbleQuestion(nextDifficulty = difficulty) {
    setBubbleQuestion(generateBubbleQuestion(nextDifficulty));
    setBubblePoppedId(null);
    setBubbleShakenId(null);
    setBubbleAnswered(false);
    setBubbleFeedback(null);
  }

  function handleDifficultyChange(nextDifficulty: Difficulty) {
    setDifficulty(nextDifficulty);
    resetBubbleQuestion(nextDifficulty);
  }

  function handleBubbleSelect(id: string, value: number) {
    if (bubbleAnswered || bubbleComplete) {
      return;
    }

    if (value === bubbleQuestion.answer) {
      const nextProgress = bubbleProgress + 1;
      setBubblePoppedId(id);
      setBubbleAnswered(true);
      setBubbleFeedback(t('addition_practice.correct_point'));
      setStars((current) => current + 1);
      setBubbleProgress(nextProgress);

      if (nextProgress >= STAGE_GOALS[3]) {
        setBubbleComplete(true);
        setStars((current) => current + 5);
        setBadge(t('addition_practice.badge_champion'));
      }
      return;
    }

    setBubbleFeedback(t('addition_practice.try_again'));
    setBubbleShakenId(id);
    setTimeout(() => setBubbleShakenId(null), 250);
  }

  function handleNextBubbleQuestion() {
    resetBubbleQuestion();
  }

  function getBubbleMotion(id: string, index: number) {
    if (!bubbleMotionMap.current[id]) {
      bubbleMotionMap.current[id] = new Animated.Value(0);
    }

    const motion = bubbleMotionMap.current[id];
    const phase = index % 2 === 0 ? 1 : -1;

    return motion.interpolate({
      inputRange: [0, 1],
      outputRange: [0, phase * -14],
    });
  }

  useEffect(() => {
    const activeMotionIds = bubbleQuestion.bubbles.map((bubble) => bubble.id);
    const runningLoops: Animated.CompositeAnimation[] = [];

    activeMotionIds.forEach((id, index) => {
      if (!bubbleMotionMap.current[id]) {
        bubbleMotionMap.current[id] = new Animated.Value(0);
      }

      const motion = bubbleMotionMap.current[id];
      motion.stopAnimation();
      motion.setValue(index % 2 === 0 ? 0 : 0.5);

      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(motion, {
            toValue: 1,
            duration: 2200 + index * 140,
            delay: index * 120,
            useNativeDriver: true,
          }),
          Animated.timing(motion, {
            toValue: 0,
            duration: 2200 + index * 140,
            useNativeDriver: true,
          }),
        ])
      );

      runningLoops.push(loop);
      loop.start();
    });

    return () => {
      runningLoops.forEach((loop) => loop.stop());
      activeMotionIds.forEach((id) => {
        bubbleMotionMap.current[id]?.stopAnimation();
      });
    };
  }, [bubbleQuestion]);

  const stage1Current = mcProgress + 1;
  const stage2Current = matchRoundIndex;
  const stage3Current = bubbleProgress + 1;
  const stage1Status = mcComplete ? t('addition_practice.stage_complete') : t('addition_practice.stage_1_label');
  const stage2Status = matchComplete ? t('addition_practice.stage_complete') : t('addition_practice.stage_2_label');
  const stage3Status = bubbleComplete ? t('addition_practice.stage_complete') : t('addition_practice.stage_3_label');

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerCard}>
        <View>
          <Text style={styles.kicker}>{t('addition_practice.title')}</Text>
          <Text style={styles.headerTitle}>{t('addition_practice.subtitle')}</Text>
        </View>
      </View>

      {badge ? (
        <View style={styles.badgeCard}>
          <Text style={styles.badgeLabel}>{t('addition_practice.badge_unlocked')}</Text>
          <Text style={styles.badgeTitle}>{badge}</Text>
        </View>
      ) : null}

      <View style={styles.stageStrip}>
        <Pressable
          onPress={() => setStage(1)}
          style={[styles.stageChip, stage === 1 && styles.stageChipActive]}
          accessibilityRole="button"
          accessibilityState={{ selected: stage === 1 }}
        >
          <Text style={[styles.stageChipTitle, stage === 1 && styles.stageChipTitleActive]}>{stage1Status}</Text>
          <Text style={[styles.stageChipSubtitle, stage === 1 && styles.stageChipSubtitleActive]}>
            {t('addition_practice.stage_1_progress', { current: Math.min(stage1Current, STAGE_GOALS[1]), total: STAGE_GOALS[1] })}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setStage(2)}
          style={[styles.stageChip, stage === 2 && styles.stageChipActive]}
          accessibilityRole="button"
          accessibilityState={{ selected: stage === 2 }}
        >
          <Text style={[styles.stageChipTitle, stage === 2 && styles.stageChipTitleActive]}>{stage2Status}</Text>
          <Text style={[styles.stageChipSubtitle, stage === 2 && styles.stageChipSubtitleActive]}>
            {t('addition_practice.stage_2_progress', { current: Math.min(stage2Current, STAGE_GOALS[2]), total: STAGE_GOALS[2] })}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setStage(3)}
          style={[styles.stageChip, stage === 3 && styles.stageChipActive]}
          accessibilityRole="button"
          accessibilityState={{ selected: stage === 3 }}
        >
          <Text style={[styles.stageChipTitle, stage === 3 && styles.stageChipTitleActive]}>{stage3Status}</Text>
          <Text style={[styles.stageChipSubtitle, stage === 3 && styles.stageChipSubtitleActive]}>
            {t('addition_practice.stage_3_progress', { current: Math.min(stage3Current, STAGE_GOALS[3]), total: STAGE_GOALS[3] })}
          </Text>
        </Pressable>
      </View>

      {stage === 1 ? (
        <View style={styles.stageCard}>
          <Text style={styles.stageHeading}>{t('addition_practice.stage_1_heading')}</Text>
          <Text style={styles.stageDescription}>{t('addition_practice.stage_1_description')}</Text>
          <Text style={styles.questionText}>
            {mcQuestion.left} + {mcQuestion.right} = ?
          </Text>
          <Text style={styles.hintText}>{mcFeedback ?? t('addition_practice.choose_answer')}</Text>
          <View style={styles.optionGrid}>
            {mcQuestion.options.map((option) => {
              const active = mcCorrect && option === mcQuestion.answer;
              return (
                <Pressable
                  key={option}
                  onPress={() => handleMultipleChoiceAnswer(option)}
                  style={({ pressed }) => [
                    styles.optionCard,
                    active && styles.optionCardCorrect,
                    mcWrongOptionId === option && styles.optionCardWrong,
                    pressed && !active && styles.optionCardPressed,
                  ]}
                  accessibilityRole="button"
                >
                  <Text style={[styles.optionValue, active && styles.optionValueCorrect]}>{option}</Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.actionRow}>
            {mcCorrect ? (
              <Pressable style={styles.primaryButton} onPress={startNextMultipleChoiceQuestion} accessibilityRole="button">
                <Text style={styles.primaryButtonText}>{t('addition_practice.next_question')}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}

      {stage === 2 ? (
        <View style={styles.stageCard}>
          <Text style={styles.stageHeading}>{t('addition_practice.stage_2_heading')}</Text>
          <Text style={styles.stageDescription}>{t('addition_practice.stage_2_description')}</Text>
          <Text style={styles.hintText}>{matchFeedback ?? t('addition_practice.match_instruction')}</Text>
          <View style={styles.matchColumns}>
            <View style={styles.matchColumn}>
              <Text style={styles.columnTitle}>{t('addition_practice.equations')}</Text>
              {matchRound.questions.map((item) => {
                const matched = matchMatchedQuestionIds.includes(item.id);
                const selected = matchSelectedEquation === item.id;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => handleEquationSelect(item.id)}
                    style={[
                      styles.matchCard,
                      matched && styles.matchCardMatched,
                      selected && styles.matchCardSelected,
                    ]}
                    accessibilityRole="button"
                  >
                    <Text style={styles.matchText}>{item.left} + {item.right}</Text>
                    {matched ? <Text style={styles.matchMark}>✓</Text> : null}
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.matchColumn}>
              <Text style={styles.columnTitle}>{t('addition_practice.answers')}</Text>
              {matchRound.answers.map((item) => {
                const matched = matchMatchedAnswerIds.includes(item.id);
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => handleAnswerSelect(item.id)}
                    style={[
                      styles.matchCard,
                      matched && styles.matchCardMatched,
                      matchWrongAnswerId === item.id && styles.optionCardWrong,
                    ]}
                    accessibilityRole="button"
                  >
                    <Text style={styles.matchText}>{item.value}</Text>
                    {matched ? <Text style={styles.matchMark}>✓</Text> : null}
                  </Pressable>
                );
              })}
            </View>
          </View>
          {matchRoundComplete ? (
            <Pressable style={styles.primaryButton} onPress={() => resetMatchRound(matchRoundIndex + 1)} accessibilityRole="button">
              <Text style={styles.primaryButtonText}>{t('addition_practice.next_round')}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {stage === 3 ? (
        <View style={styles.stageCard}>
          <Text style={styles.stageHeading}>{t('addition_practice.stage_3_heading')}</Text>
          <Text style={styles.stageDescription}>{t('addition_practice.stage_3_description')}</Text>
          <View style={styles.difficultyRow}>
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => {
              const active = difficulty === level;
              return (
                <Pressable
                  key={level}
                  onPress={() => handleDifficultyChange(level)}
                  style={[styles.difficultyChip, active && styles.difficultyChipActive]}
                  accessibilityRole="button"
                >
                  <Text style={[styles.difficultyText, active && styles.difficultyTextActive]}>
                    {t(`addition_practice.${level}_label`)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.questionText}>
            {bubbleQuestion.left} + {bubbleQuestion.right} = ?
          </Text>
          <Text style={styles.hintText}>{bubbleFeedback ?? t('addition_practice.tap_bubble')}</Text>

          <View style={styles.bubbleGrid}>
            {bubbleQuestion.bubbles.map((bubble, index) => {
              const popped = bubblePoppedId === bubble.id;
              const shaken = bubbleShakenId === bubble.id;
              const floatStyle = { transform: [{ translateY: getBubbleMotion(bubble.id, index) }] };
              return (
                <Animated.View key={bubble.id} style={[floatStyle]}>
                  <Pressable
                    onPress={() => handleBubbleSelect(bubble.id, bubble.value)}
                    style={({ pressed }) => [
                      styles.bubble,
                      popped && styles.bubblePopped,
                      shaken && styles.bubbleShaken,
                      pressed && !popped && styles.bubblePressed,
                    ]}
                    accessibilityRole="button"
                  >
                    <Text style={[styles.bubbleText, popped && styles.bubbleTextPopped]}>{bubble.value}</Text>
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>

          {bubbleAnswered && !bubbleComplete ? (
            <Pressable style={styles.primaryButton} onPress={handleNextBubbleQuestion} accessibilityRole="button">
              <Text style={styles.primaryButtonText}>{t('addition_practice.next_question')}</Text>
            </Pressable>
          ) : null}
          {bubbleComplete ? (
            <Pressable style={styles.primaryButton} onPress={handleNextBubbleQuestion} accessibilityRole="button">
              <Text style={styles.primaryButtonText}>{t('addition_practice.next_question')}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {stage === 3 && bubbleComplete ? (
        <View style={styles.completeCard}>
          <Text style={styles.completeTitle}>{t('addition_practice.practice_complete')}</Text>
          <Text style={styles.completeBody}>{t('addition_practice.stage_complete_message')}</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  rewardLabel: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  badgeCard: {
    borderRadius: 20,
    backgroundColor: '#EAF8EF',
    padding: 16,
    borderWidth: 1,
    borderColor: '#BFE7CC',
  },
  badgeLabel: {
    color: '#2E5E43',
    fontWeight: '800',
    marginBottom: 4,
  },
  badgeTitle: {
    color: '#1E7A3A',
    fontSize: 18,
    fontWeight: '900',
  },
  stageStrip: {
    flexDirection: 'row',
    gap: 10,
  },
  stageChip: {
    flex: 1,
    borderRadius: 18,
    padding: 12,
    backgroundColor: '#F4F7FD',
    borderWidth: 1,
    borderColor: '#D9E3F6',
  },
  stageChipActive: {
    backgroundColor: '#16336C',
    borderColor: '#16336C',
  },
  stageChipTitle: {
    color: '#16336C',
    fontWeight: '900',
    marginBottom: 4,
  },
  stageChipTitleActive: {
    color: '#FFFFFF',
  },
  stageChipSubtitle: {
    color: '#5D7195',
    fontSize: 12,
  },
  stageChipSubtitleActive: {
    color: '#DCE6FF',
  },
  stageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E4EBF7',
    gap: 12,
  },
  stageHeading: {
    fontSize: 22,
    fontWeight: '900',
    color: '#16336C',
  },
  stageDescription: {
    fontSize: 15,
    color: '#4A5A78',
    lineHeight: 22,
  },
  questionText: {
    fontSize: 30,
    fontWeight: '900',
    color: '#16336C',
  },
  hintText: {
    fontSize: 15,
    color: '#5D7195',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionCard: {
    width: '48%',
    borderRadius: 18,
    backgroundColor: '#F7F9FC',
    borderWidth: 1,
    borderColor: '#DCE6F8',
    minHeight: 74,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionCardPressed: {
    transform: [{ scale: 0.98 }],
  },
  optionCardCorrect: {
    backgroundColor: '#EAF8EF',
    borderColor: '#BFE7CC',
  },
  optionCardWrong: {
    backgroundColor: '#FFF0F0',
    borderColor: '#F4B4B4',
  },
  optionValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#16336C',
  },
  optionValueCorrect: {
    color: '#1E7A3A',
  },
  actionRow: {
    flexDirection: 'row',
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
  matchColumns: {
    flexDirection: 'row',
    gap: 12,
  },
  matchColumn: {
    flex: 1,
    gap: 10,
  },
  columnTitle: {
    color: '#5A7DCB',
    fontWeight: '800',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  matchCard: {
    borderRadius: 16,
    backgroundColor: '#F7F9FC',
    borderWidth: 1,
    borderColor: '#DCE6F8',
    padding: 12,
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  matchCardSelected: {
    backgroundColor: '#EEF4FF',
    borderColor: '#8CB2FF',
  },
  matchCardMatched: {
    backgroundColor: '#EAF8EF',
    borderColor: '#BFE7CC',
  },
  matchText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#16336C',
  },
  matchMark: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1E7A3A',
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyChip: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: '#F4F7FD',
    borderWidth: 1,
    borderColor: '#D9E3F6',
    paddingVertical: 10,
    alignItems: 'center',
  },
  difficultyChipActive: {
    backgroundColor: '#16336C',
    borderColor: '#16336C',
  },
  difficultyText: {
    color: '#16336C',
    fontWeight: '800',
  },
  difficultyTextActive: {
    color: '#FFFFFF',
  },
  bubbleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  bubble: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#DCEBFF',
    borderWidth: 1,
    borderColor: '#8CB2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubblePressed: {
    transform: [{ scale: 0.97 }],
  },
  bubblePopped: {
    backgroundColor: '#EAF8EF',
    borderColor: '#BFE7CC',
  },
  bubbleShaken: {
    backgroundColor: '#FFF0F0',
    borderColor: '#F4B4B4',
  },
  bubbleText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#16336C',
  },
  bubbleTextPopped: {
    color: '#1E7A3A',
  },
  completeCard: {
    borderRadius: 22,
    backgroundColor: '#EAF8EF',
    borderWidth: 1,
    borderColor: '#BFE7CC',
    padding: 18,
    alignItems: 'center',
  },
  completeTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1E7A3A',
    marginBottom: 6,
  },
  completeBody: {
    fontSize: 16,
    color: '#2E5E43',
    textAlign: 'center',
  },
});
