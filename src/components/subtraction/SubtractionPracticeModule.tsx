import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import KidBackdrop from '../KidBackdrop';

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

type MatchRound = {
  questions: MatchPair[];
  answers: { id: string; value: number }[];
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

const STAGE_GOALS: Record<PracticeStage, number> = {
  1: 10,
  2: 5,
  3: 5,
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

function uniqueSubtractionPairs(count: number) {
  const seen = new Set<string>();
  const questions: MultipleChoiceQuestion[] = [];

  while (questions.length < count) {
    const left = randomInt(2, 10);
    const right = randomInt(1, left - 1);
    const key = `${left}-${right}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    const answer = left - right;
    questions.push({
      left,
      right,
      answer,
      options: shuffle([answer, ...uniqueNumbers(3, answer)]),
    });
  }

  return questions;
}

function generateMatchRound() {
  const total = randomInt(4, 6);
  const seen = new Set<string>();
  const questions: MatchPair[] = [];

  while (questions.length < total) {
    const left = randomInt(2, 10);
    const right = randomInt(1, left - 1);
    const key = `${left}-${right}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    questions.push({
      id: `match-${Date.now()}-${questions.length}-${Math.random().toString(16).slice(2)}`,
      left,
      right,
      answer: left - right,
    });
  }

  return {
    questions,
    answers: shuffle(questions.map((item) => ({ id: item.id, value: item.answer }))),
  } as MatchRound;
}

function generateBubbleSession(difficulty: Difficulty) {
  const bubbleCount = difficulty === 'hard' ? 8 : difficulty === 'medium' ? 6 : 4;
  const questions = uniqueSubtractionPairs(10);

  return questions.map((question, index) => {
    const distractors = uniqueNumbers(bubbleCount - 1, question.answer);
    return {
      ...question,
      bubbles: shuffle([
        { id: `bubble-${Date.now()}-${index}-correct`, value: question.answer },
        ...distractors.map((value, distractorIndex) => ({
          id: `bubble-${Date.now()}-${index}-${distractorIndex}`,
          value,
        })),
      ]),
    } as BubbleQuestion;
  });
}

export default function SubtractionPracticeModule() {
  const { t } = useTranslation();
  const [stage, setStage] = useState<PracticeStage>(1);
  const [stars, setStars] = useState(0);
  const [badge, setBadge] = useState<string | null>(null);

  const [mcQuestions, setMcQuestions] = useState<MultipleChoiceQuestion[]>(() => uniqueSubtractionPairs(STAGE_GOALS[1]));
  const [mcIndex, setMcIndex] = useState(0);
  const [mcScore, setMcScore] = useState(0);
  const [mcComplete, setMcComplete] = useState(false);
  const [mcWrongOptionId, setMcWrongOptionId] = useState<number | null>(null);
  const [mcCorrect, setMcCorrect] = useState(false);
  const [mcFeedback, setMcFeedback] = useState<string | null>(null);
  const mcAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  const [bubbleQuestions, setBubbleQuestions] = useState<BubbleQuestion[]>(() => generateBubbleSession('easy'));
  const [bubbleIndex, setBubbleIndex] = useState(0);
  const [bubbleScore, setBubbleScore] = useState(0);
  const [bubbleAttempts, setBubbleAttempts] = useState(0);
  const [bubbleComplete, setBubbleComplete] = useState(false);
  const [bubbleAnswered, setBubbleAnswered] = useState(false);
  const [bubblePoppedId, setBubblePoppedId] = useState<string | null>(null);
  const [bubbleShakenId, setBubbleShakenId] = useState<string | null>(null);
  const [bubbleWrongId, setBubbleWrongId] = useState<string | null>(null);
  const [bubbleFeedback, setBubbleFeedback] = useState<string | null>(null);
  const bubbleMotionMap = useRef<Record<string, Animated.Value>>({});
  const bubbleAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (mcAdvanceTimer.current) {
        clearTimeout(mcAdvanceTimer.current);
      }
      if (bubbleAdvanceTimer.current) {
        clearTimeout(bubbleAdvanceTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (stage !== 1 && mcAdvanceTimer.current) {
      clearTimeout(mcAdvanceTimer.current);
      mcAdvanceTimer.current = null;
    }
    if (stage !== 3 && bubbleAdvanceTimer.current) {
      clearTimeout(bubbleAdvanceTimer.current);
      bubbleAdvanceTimer.current = null;
    }
    if (stage !== 3) {
      setBubbleWrongId(null);
      setBubbleShakenId(null);
    }
  }, [stage]);

  function resetMultipleChoiceSession() {
    if (mcAdvanceTimer.current) {
      clearTimeout(mcAdvanceTimer.current);
      mcAdvanceTimer.current = null;
    }
    setMcQuestions(uniqueSubtractionPairs(STAGE_GOALS[1]));
    setMcIndex(0);
    setMcScore(0);
    setMcComplete(false);
    setMcWrongOptionId(null);
    setMcCorrect(false);
    setMcFeedback(null);
  }

  function advanceMultipleChoice() {
    setMcWrongOptionId(null);
    setMcCorrect(false);
    setMcFeedback(null);

    setMcIndex((current) => {
      const next = current + 1;
      if (next >= STAGE_GOALS[1]) {
        setMcComplete(true);
        setStars((value) => value + 5);
        setBadge(t('subtraction_practice.badge_beginner'));
        return current;
      }
      return next;
    });
  }

  function handleMultipleChoiceAnswer(option: number) {
    if (mcComplete || mcCorrect) {
      return;
    }

    const currentQuestion = mcQuestions[mcIndex];
    if (!currentQuestion) {
      return;
    }

    const isCorrect = option === currentQuestion.answer;
    setMcFeedback(isCorrect ? t('subtraction_practice.correct') : t('subtraction_practice.try_again'));
    setMcWrongOptionId(isCorrect ? null : option);

    if (isCorrect) {
      setMcCorrect(true);
      setMcScore((value) => value + 1);
      setStars((value) => value + 1);
    }
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

  function restartMatchSession() {
    setMatchComplete(false);
    resetMatchRound(1);
  }

  function handleEquationSelect(id: string) {
    if (matchRoundComplete || matchMatchedQuestionIds.includes(id)) {
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
    if (!equation || !answer || matchMatchedAnswerIds.includes(id)) {
      return;
    }

    if (equation.answer === answer.value) {
      setMatchMatchedQuestionIds((current) => [...current, equation.id]);
      setMatchMatchedAnswerIds((current) => [...current, answer.id]);
      setMatchSelectedEquation(null);
      setMatchFeedback(t('subtraction_practice.match_correct'));
      setMatchWrongAnswerId(null);
      setStars((value) => value + 1);

      if (matchMatchedQuestionIds.length + 1 === matchRound.questions.length) {
        setMatchRoundComplete(true);
        setStars((value) => value + 5);
        setBadge(t('subtraction_practice.badge_explorer'));
        if (matchRoundIndex >= STAGE_GOALS[2]) {
          setMatchComplete(true);
        }
      }
      return;
    }

    setMatchFeedback(t('subtraction_practice.try_again'));
    setMatchWrongAnswerId(id);
    setMatchSelectedEquation(null);
  }

  function resetBubbleSession(nextDifficulty = difficulty) {
    if (bubbleAdvanceTimer.current) {
      clearTimeout(bubbleAdvanceTimer.current);
      bubbleAdvanceTimer.current = null;
    }
    setBubbleQuestions(generateBubbleSession(nextDifficulty));
    setBubbleIndex(0);
    setBubbleScore(0);
    setBubbleAttempts(0);
    setBubbleComplete(false);
    setBubbleAnswered(false);
    setBubblePoppedId(null);
    setBubbleShakenId(null);
    setBubbleWrongId(null);
    setBubbleFeedback(null);
  }

  function handleDifficultyChange(nextDifficulty: Difficulty) {
    setDifficulty(nextDifficulty);
    resetBubbleSession(nextDifficulty);
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
    const activeMotionIds = bubbleQuestions[bubbleIndex]?.bubbles.map((bubble) => bubble.id) ?? [];
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
            duration: 2200 + index * 120,
            delay: index * 120,
            useNativeDriver: true,
          }),
          Animated.timing(motion, {
            toValue: 0,
            duration: 2200 + index * 120,
            useNativeDriver: true,
          }),
        ])
      );

      runningLoops.push(loop);
      loop.start();
    });

    return () => {
      runningLoops.forEach((loop) => loop.stop());
      activeMotionIds.forEach((id) => bubbleMotionMap.current[id]?.stopAnimation());
    };
  }, [bubbleIndex, bubbleQuestions]);

  function handleBubbleSelect(id: string, value: number) {
    if (bubbleAnswered || bubbleComplete) {
      return;
    }

    const question = bubbleQuestions[bubbleIndex];
    if (!question) {
      return;
    }

    const nextAttempts = bubbleAttempts + 1;
    setBubbleAttempts(nextAttempts);

    if (value === question.answer) {
      const nextScore = bubbleScore + 1;
      const nextIndex = bubbleIndex + 1;
      setBubblePoppedId(id);
      setBubbleAnswered(true);
      setBubbleFeedback(t('subtraction_practice.correct_point'));
      setStars((current) => current + 1);
      setBubbleScore(nextScore);
      setBubbleWrongId(null);

      if (nextScore >= STAGE_GOALS[1]) {
        setStars((current) => current + 5);
        if (nextAttempts === STAGE_GOALS[1]) {
          setBadge(t('subtraction_practice.badge_champion'));
        }
      }

      if (bubbleAdvanceTimer.current) {
        clearTimeout(bubbleAdvanceTimer.current);
      }
      bubbleAdvanceTimer.current = setTimeout(() => {
        if (nextIndex >= bubbleQuestions.length) {
          setBubbleComplete(true);
          return;
        }

        setBubbleIndex(nextIndex);
        setBubbleAnswered(false);
        setBubblePoppedId(null);
        setBubbleShakenId(null);
        setBubbleFeedback(null);
      }, 450);
      return;
    }

    setBubbleFeedback(t('subtraction_practice.try_again'));
    setBubbleShakenId(id);
    setBubbleWrongId(id);
    setTimeout(() => setBubbleShakenId(null), 250);
    setTimeout(() => setBubbleWrongId(null), 350);
  }

  const stage1Current = mcIndex + 1;
  const stage2Current = matchRoundIndex;
  const stage3Current = bubbleIndex + 1;
  const stage1Status = mcComplete ? t('subtraction_practice.stage_complete') : t('subtraction_practice.stage_1_label');
  const stage2Status = matchComplete ? t('subtraction_practice.stage_complete') : t('subtraction_practice.stage_2_label');
  const stage3Status = bubbleComplete ? t('subtraction_practice.stage_complete') : t('subtraction_practice.stage_3_label');
  const currentBubbleQuestion = bubbleQuestions[bubbleIndex];
  const stage1Question = mcQuestions[mcIndex];

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <KidBackdrop />
      <View style={styles.headerCard}>
        <View>
          <Text style={styles.kicker}>{t('subtraction_practice.title')}</Text>
          <Text style={styles.headerTitle}>{t('subtraction_practice.subtitle')}</Text>
        </View>
      </View>

      {badge ? (
        <View style={styles.badgeCard}>
          <Text style={styles.badgeLabel}>{t('subtraction_practice.badge_unlocked')}</Text>
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
            {t('subtraction_practice.stage_1_progress', { current: Math.min(stage1Current, STAGE_GOALS[1]), total: STAGE_GOALS[1] })}
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
            {t('subtraction_practice.stage_2_progress', { current: Math.min(stage2Current, STAGE_GOALS[2]), total: STAGE_GOALS[2] })}
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
            {t('subtraction_practice.stage_3_progress', { current: Math.min(stage3Current, STAGE_GOALS[1]), total: STAGE_GOALS[1] })}
          </Text>
        </Pressable>
      </View>

      {stage === 1 ? (
        <View style={styles.stageCard}>
          <Text style={styles.stageHeading}>{t('subtraction_practice.stage_1_heading')}</Text>
          <Text style={styles.stageDescription}>{t('subtraction_practice.stage_1_description')}</Text>
          <Text style={styles.questionText}>
            {stage1Question?.left} - {stage1Question?.right} = ?
          </Text>
          <Text style={styles.hintText}>{mcFeedback ?? t('subtraction_practice.choose_answer')}</Text>
          <View style={styles.optionGrid}>
            {stage1Question?.options.map((option) => {
              const active = mcCorrect && option === stage1Question.answer;
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
          {mcCorrect ? (
            <Pressable style={styles.primaryButton} onPress={advanceMultipleChoice} accessibilityRole="button">
              <Text style={styles.primaryButtonText}>{t('subtraction_practice.next_question')}</Text>
            </Pressable>
          ) : null}
          {mcComplete ? (
            <View style={styles.completeCard}>
              <Text style={styles.completeTitle}>{t('subtraction_practice.practice_complete')}</Text>
              <Text style={styles.completeBody}>
                {t('subtraction_practice.score', {
                  score: mcScore,
                  total: STAGE_GOALS[1],
                  defaultValue: `Score: ${mcScore} / ${STAGE_GOALS[1]}`,
                })}
              </Text>
              <Pressable style={styles.primaryButton} onPress={resetMultipleChoiceSession} accessibilityRole="button">
                <Text style={styles.primaryButtonText}>{t('subtraction_practice.play_again', { defaultValue: 'Play Again' })}</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      ) : null}

      {stage === 2 ? (
        <View style={styles.stageCard}>
          <Text style={styles.stageHeading}>{t('subtraction_practice.stage_2_heading')}</Text>
          <Text style={styles.stageDescription}>{t('subtraction_practice.stage_2_description')}</Text>
          <Text style={styles.hintText}>{matchFeedback ?? t('subtraction_practice.match_instruction')}</Text>
          <View style={styles.matchColumns}>
            <View style={styles.matchColumn}>
              <Text style={styles.columnTitle}>{t('subtraction_practice.equations')}</Text>
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
                    <Text style={styles.matchText}>{item.left} - {item.right}</Text>
                    {matched ? <Text style={styles.matchMark}>✓</Text> : null}
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.matchColumn}>
              <Text style={styles.columnTitle}>{t('subtraction_practice.answers')}</Text>
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
            <View style={styles.completeCard}>
              <Text style={styles.completeTitle}>{t('subtraction_practice.practice_complete')}</Text>
              <Text style={styles.completeBody}>{t('subtraction_practice.round_complete_reward')}</Text>
              {!matchComplete ? (
                <Pressable style={styles.primaryButton} onPress={() => resetMatchRound(matchRoundIndex + 1)} accessibilityRole="button">
                  <Text style={styles.primaryButtonText}>{t('subtraction_practice.next_round')}</Text>
                </Pressable>
              ) : (
                <Pressable style={styles.primaryButton} onPress={restartMatchSession} accessibilityRole="button">
                  <Text style={styles.primaryButtonText}>{t('subtraction_practice.play_again', { defaultValue: 'Play Again' })}</Text>
                </Pressable>
              )}
            </View>
          ) : null}
        </View>
      ) : null}

      {stage === 3 ? (
        <View style={styles.stageCard}>
          <Text style={styles.stageHeading}>{t('subtraction_practice.stage_3_heading')}</Text>
          <Text style={styles.stageDescription}>{t('subtraction_practice.stage_3_description')}</Text>
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
                    {t(`subtraction_practice.${level}_label`)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {currentBubbleQuestion ? (
            <>
              <Text style={styles.questionText}>
                {currentBubbleQuestion.left} - {currentBubbleQuestion.right} = ?
              </Text>
              <Text style={styles.hintText}>{bubbleFeedback ?? t('subtraction_practice.tap_bubble')}</Text>

              <View style={styles.bubbleGrid}>
                {currentBubbleQuestion.bubbles.map((bubble, index) => {
                  const popped = bubblePoppedId === bubble.id;
                  const shaken = bubbleShakenId === bubble.id;
                  const floatStyle = { transform: [{ translateY: getBubbleMotion(bubble.id, index) }] };
                  return (
                    <Animated.View key={bubble.id} style={floatStyle}>
                      <Pressable
                        onPress={() => handleBubbleSelect(bubble.id, bubble.value)}
                        style={({ pressed }) => [
                          styles.bubble,
                          popped && styles.bubblePopped,
                          shaken && styles.bubbleShaken,
                          bubbleWrongId === bubble.id && styles.bubbleWrong,
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
            </>
          ) : null}

          {bubbleComplete ? (
            <View style={styles.completeCard}>
              <Text style={styles.completeTitle}>{t('subtraction_practice.practice_complete')}</Text>
              <Text style={styles.completeBody}>
                {t('subtraction_practice.score', {
                  score: bubbleScore,
                  total: STAGE_GOALS[1],
                  defaultValue: `Score: ${bubbleScore} / ${STAGE_GOALS[1]}`,
                })}
              </Text>
              <Text style={styles.completeBody}>
                {t('subtraction_practice.accuracy', {
                  accuracy: bubbleAttempts > 0 ? Math.round((bubbleScore / bubbleAttempts) * 100) : 100,
                  defaultValue: `Accuracy: ${bubbleAttempts > 0 ? Math.round((bubbleScore / bubbleAttempts) * 100) : 100}%`,
                })}
              </Text>
              {bubbleScore === STAGE_GOALS[1] && bubbleAttempts === STAGE_GOALS[1] ? (
                <Text style={styles.completeBody}>{t('subtraction_practice.badge_champion')}</Text>
              ) : null}
              <Pressable style={styles.primaryButton} onPress={() => resetBubbleSession(difficulty)} accessibilityRole="button">
                <Text style={styles.primaryButtonText}>{t('subtraction_practice.play_again', { defaultValue: 'Play Again' })}</Text>
              </Pressable>
            </View>
          ) : null}
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
  badgeCard: {
    backgroundColor: '#FFF0F7',
    borderRadius: 24,
    padding: 16,
    borderWidth: 2,
    borderColor: '#FFB3D1',
  },
  badgeLabel: {
    color: '#FF6B9E',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  badgeTitle: {
    color: '#7E2D6A',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 6,
  },
  stageStrip: {
    flexDirection: 'row',
    gap: 10,
  },
  stageChip: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: '#FFD2EA',
    gap: 4,
  },
  stageChipActive: {
    backgroundColor: '#FFF2FA',
    borderColor: '#FF6B9E',
  },
  stageChipTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#7E2D6A',
  },
  stageChipTitleActive: {
    color: '#FF6B9E',
  },
  stageChipSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#704D66',
  },
  stageChipSubtitleActive: {
    color: '#FFB3D1',
  },
  stageCard: {
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
  stageHeading: {
    fontSize: 22,
    fontWeight: '900',
    color: '#7E2D6A',
  },
  stageDescription: {
    fontSize: 15,
    color: '#704D66',
    fontWeight: '700',
  },
  questionText: {
    fontSize: 34,
    fontWeight: '900',
    color: '#7E2D6A',
  },
  hintText: {
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
  optionValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#7E2D6A',
  },
  optionValueCorrect: {
    color: '#FF6B9E',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
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
  completeCard: {
    backgroundColor: '#FFF0F7',
    borderRadius: 24,
    padding: 16,
    gap: 8,
    borderWidth: 2,
    borderColor: '#FFB3D1',
  },
  completeTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FF6B9E',
  },
  completeBody: {
    fontSize: 15,
    lineHeight: 21,
    color: '#704D66',
    fontWeight: '700',
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
    fontSize: 16,
    fontWeight: '900',
    color: '#FF6B9E',
    marginBottom: 2,
  },
  matchCard: {
    backgroundColor: '#FFF8FC',
    borderWidth: 2,
    borderColor: '#FFD2EA',
    borderRadius: 18,
    padding: 14,
    minHeight: 62,
    justifyContent: 'center',
  },
  matchCardSelected: {
    borderColor: '#FF6B9E',
    backgroundColor: '#FFF2FA',
  },
  matchCardMatched: {
    borderColor: '#FFB3D1',
    backgroundColor: '#FFF0F7',
  },
  matchText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#7E2D6A',
  },
  matchMark: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '900',
    color: '#FF6B9E',
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: 10,
  },
  difficultyChip: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FFD2EA',
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: 'center',
  },
  difficultyChipActive: {
    backgroundColor: '#FFF2FA',
    borderColor: '#FF6B9E',
  },
  difficultyText: {
    color: '#7E2D6A',
    fontSize: 14,
    fontWeight: '800',
  },
  difficultyTextActive: {
    color: '#FF6B9E',
  },
  bubbleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 4,
  },
  bubble: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#FFF8FC',
    borderWidth: 2,
    borderColor: '#FFD2EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubblePressed: {
    transform: [{ scale: 0.95 }],
  },
  bubblePopped: {
    backgroundColor: '#FFF2FA',
    borderColor: '#FFB3D1',
    transform: [{ scale: 0.88 }],
    opacity: 0.8,
  },
  bubbleShaken: {
    transform: [{ translateX: 4 }],
  },
  bubbleWrong: {
    backgroundColor: '#FFE8EF',
    borderColor: '#FF9DB6',
  },
  bubbleText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#7E2D6A',
  },
  bubbleTextPopped: {
    color: '#FF6B9E',
  },
});
