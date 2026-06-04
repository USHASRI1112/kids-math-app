import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import KidBackdrop from '../KidBackdrop';

type ObjectAsset = {
  key: string;
  emoji: string;
  name: string;
};

type SubtractionQuestion = {
  total: number;
  remove: number;
  remaining: number;
  object: ObjectAsset;
};

type ObjectState = {
  index: number;
  removed: boolean;
};

type StageKey = 1 | 2;

const OBJECTS: ObjectAsset[] = [
  { key: 'apple', emoji: '🍎', name: 'apples' },
  { key: 'star', emoji: '⭐', name: 'stars' },
  { key: 'balloon', emoji: '🎈', name: 'balloons' },
  { key: 'cookie', emoji: '🍪', name: 'cookies' },
  { key: 'flower', emoji: '🌸', name: 'flowers' },
  { key: 'car', emoji: '🚗', name: 'cars' },
  { key: 'heart', emoji: '💛', name: 'hearts' },
  { key: 'leaf', emoji: '🍃', name: 'leaves' },
];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(items: T[]): T {
  return items[randomInt(0, items.length - 1)];
}

function generateQuestion(): SubtractionQuestion {
  const total = randomInt(1, 10);
  const remove = randomInt(1, total);
  return {
    total,
    remove,
    remaining: total - remove,
    object: pickRandom(OBJECTS),
  };
}

function buildObjects(total: number): ObjectState[] {
  return Array.from({ length: total }, (_, index) => ({
    index,
    removed: false,
  }));
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

export default function SubtractionLearnEngine() {
  const { t } = useTranslation();
  const [question, setQuestion] = useState<SubtractionQuestion>(() => generateQuestion());
  const [stage, setStage] = useState<StageKey>(1);

  const [objects, setObjects] = useState<ObjectState[]>(() => buildObjects(question.total));
  const [removedCount, setRemovedCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const [lineValue, setLineValue] = useState(question.total);
  const [lineCompleted, setLineCompleted] = useState(false);
  const [lineRevealed, setLineRevealed] = useState(false);
  const [lineWidth, setLineWidth] = useState(0);
  const [lineMoving, setLineMoving] = useState(false);
  const lineProgress = useRef(new Animated.Value(question.total)).current;

  useEffect(() => {
    setObjects(buildObjects(question.total));
    setRemovedCount(0);
    setCompleted(false);
    setRevealed(false);

    setLineValue(question.total);
    setLineCompleted(false);
    setLineRevealed(false);
    setLineMoving(false);
    lineProgress.stopAnimation();
    lineProgress.setValue(question.total);
  }, [lineProgress, question]);

  function loadNewQuestion() {
    const nextQuestion = generateQuestion();
    setQuestion(nextQuestion);
  }

  function handleObjectPress(index: number) {
    if (completed) {
      return;
    }

    const targetIndex = objects.findIndex((item) => !item.removed);
    if (targetIndex !== index || removedCount >= question.remove) {
      return;
    }

    setObjects((current) =>
      current.map((item) =>
        item.index === index
          ? { ...item, removed: true }
          : item
      )
    );

    setRemovedCount((current) => {
      const nextRemoved = current + 1;
      if (nextRemoved >= question.remove) {
        setCompleted(true);
        setRevealed(true);
      }
      return nextRemoved;
    });
  }

  async function animateToValue(target: number) {
    if (lineMoving || lineCompleted || target > lineValue || target < question.remaining) {
      return;
    }

    setLineMoving(true);

    let current = lineValue;
    while (current > target) {
      const next = current - 1;
      await new Promise<void>((resolve) => {
        Animated.timing(lineProgress, {
          toValue: next,
          duration: 260,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start(() => resolve());
      });
      current = next;
      setLineValue(next);
      if (next === question.remaining) {
        setLineCompleted(true);
        setLineRevealed(true);
        break;
      }
      await wait(90);
    }

    setLineMoving(false);
  }

  function handleLinePress(target: number) {
    if (lineMoving || lineCompleted) {
      return;
    }

    if (target === lineValue - 1 || (target < lineValue && target >= question.remaining)) {
      void animateToValue(target);
    }
  }

  function handleNextStep() {
    if (lineMoving || lineCompleted) {
      return;
    }

    void animateToValue(lineValue - 1);
  }

  function handleLineLayout(event: LayoutChangeEvent) {
    const width = event.nativeEvent.layout.width;
    setLineWidth(width);
  }

  const remainingObjects = useMemo(
    () => objects.filter((item) => !item.removed),
    [objects]
  );

  const answerText = `${question.total} - ${question.remove} = ${question.remaining}`;
  const lineTravelWidth = Math.max(0, lineWidth - 48);
  const indicatorTranslateX = lineProgress.interpolate({
    inputRange: [0, 10],
    outputRange: [0, lineTravelWidth],
    extrapolate: 'clamp',
  });
  const stage1Active = stage === 1;
  const stage2Active = stage === 2;

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <KidBackdrop />
      <View style={styles.hero}>
        <Text style={styles.heroKicker}>{t('subtraction_learn.title', { defaultValue: 'Subtraction Learn' })}</Text>
        <Text style={styles.heroTitle}>{t('subtraction_learn.subtitle', { defaultValue: 'Stage 1 - Taking Away Objects' })}</Text>
        <Text style={styles.heroBody}>
          {t('subtraction_learn.instruction', { defaultValue: 'Tap the objects to take them away.' })}
        </Text>
      </View>

      <View style={styles.stageSwitcher}>
        <Pressable
          onPress={() => setStage(1)}
          style={[styles.stageChip, stage1Active && styles.stageChipActive]}
          accessibilityRole="button"
        >
          <Text style={[styles.stageChipLabel, stage1Active && styles.stageChipLabelActive]}>
            {t('subtraction_learn.stage_1_label', { defaultValue: 'Stage 1' })}
          </Text>
          <Text style={[styles.stageChipSubLabel, stage1Active && styles.stageChipSubLabelActive]}>
            {t('subtraction_learn.stage_1_description', { defaultValue: 'Taking away objects' })}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setStage(2)}
          style={[styles.stageChip, stage2Active && styles.stageChipActive]}
          accessibilityRole="button"
        >
          <Text style={[styles.stageChipLabel, stage2Active && styles.stageChipLabelActive]}>
            {t('subtraction_learn.stage_2_label', { defaultValue: 'Stage 2' })}
          </Text>
          <Text style={[styles.stageChipSubLabel, stage2Active && styles.stageChipSubLabelActive]}>
            {t('subtraction_learn.stage_2_description', { defaultValue: 'Number line jump back' })}
          </Text>
        </Pressable>
      </View>

      <View style={styles.questionCard}>
        <Text style={styles.questionLabel}>{t('subtraction_learn.question_label', { defaultValue: 'Question' })}</Text>
        <Text style={styles.questionText}>
          {question.total} - {question.remove}
        </Text>
        <Text style={styles.questionBody}>
          {stage1Active
            ? t('subtraction_learn.take_away', { defaultValue: 'Take away {{count}} objects.', count: question.remove })
            : t('subtraction_learn.move_back', { defaultValue: 'Move back {{count}} steps.', count: question.remove })}
        </Text>
      </View>

      {stage1Active ? (
        <View style={styles.objectCard}>
          <View style={styles.objectHeader}>
            <Text style={styles.objectTitle}>{t('subtraction_learn.total_objects', { defaultValue: 'Total Objects' })}</Text>
            <Text style={styles.objectCount}>
              {question.total} {t('subtraction_learn.objects_label', { defaultValue: 'objects' })}
            </Text>
          </View>

          <View style={styles.objectGrid}>
            {objects.map((item) => (
              <Pressable
                key={item.index}
                onPress={() => handleObjectPress(item.index)}
                accessibilityRole="button"
                disabled={completed}
                style={({ pressed }) => [
                  styles.objectTile,
                  item.removed && styles.objectTileRemoved,
                  pressed && !item.removed && styles.objectTilePressed,
                ]}
              >
                <Text style={[styles.objectEmoji, item.removed && styles.objectEmojiRemoved]}>{question.object.emoji}</Text>
                {item.removed ? <Text style={styles.crossMark}>✕</Text> : null}
              </Pressable>
            ))}
          </View>

          {revealed ? (
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>{t('subtraction_learn.great_job', { defaultValue: 'Great Job!' })}</Text>
              <Text style={styles.resultBody}>
                {t('subtraction_learn.remaining_message', { defaultValue: 'You found {{count}} objects remaining.', count: question.remaining })}
              </Text>
              <Text style={styles.resultEquation}>{answerText}</Text>
              <View style={styles.remainingWrap}>
                {remainingObjects.map((item) => (
                  <View key={`remaining-${item.index}`} style={styles.remainingTile}>
                    <Text style={styles.objectEmoji}>{question.object.emoji}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </View>
      ) : (
        <View style={styles.lineCard}>
          <View style={styles.lineHeader}>
            <View>
              <Text style={styles.objectTitle}>{t('subtraction_learn.number_line', { defaultValue: 'Number Line' })}</Text>
              <Text style={styles.lineSubtitle}>
                {t('subtraction_learn.move_back_instruction', {
                  defaultValue: 'Tap Next Step or a smaller number to jump back.',
                })}
              </Text>
            </View>
            <View style={styles.lineBadge}>
              <Text style={styles.lineBadgeText}>
                {t('subtraction_learn.current_number', { defaultValue: 'Current' })}: {lineValue}
              </Text>
            </View>
          </View>

          <View style={styles.lineTrackWrap} onLayout={handleLineLayout}>
            <View style={styles.lineTrack} />
            {lineWidth > 0 ? (
              <Animated.View
                style={[
                  styles.lineIndicator,
                  {
                    transform: [{ translateX: indicatorTranslateX }],
                  },
                ]}
              >
                <Text style={styles.lineIndicatorText}>{lineValue}</Text>
              </Animated.View>
            ) : null}

            <View style={styles.lineNumbers}>
              {Array.from({ length: 11 }, (_, number) => {
                const isStart = number === question.total;
                const isResult = number === question.remaining;
                const isCurrent = number === lineValue;
                return (
                  <Pressable
                    key={number}
                    onPress={() => handleLinePress(number)}
                    accessibilityRole="button"
                    style={({ pressed }) => [
                      styles.lineNumberCell,
                      isStart && styles.lineNumberStart,
                      isResult && styles.lineNumberResult,
                      isCurrent && styles.lineNumberCurrent,
                      pressed && styles.lineNumberPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.lineNumberText,
                        isStart && styles.lineNumberTextStart,
                        isResult && styles.lineNumberTextResult,
                        isCurrent && styles.lineNumberTextCurrent,
                      ]}
                    >
                      {number}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.lineControls}>
            <Pressable
              onPress={handleNextStep}
              style={[styles.primaryButton, (lineMoving || lineCompleted) && styles.primaryButtonDisabled]}
              accessibilityRole="button"
              disabled={lineMoving || lineCompleted}
            >
              <Text style={styles.primaryButtonText}>
                {lineRevealed
                  ? t('subtraction_learn.continue_button', { defaultValue: 'Continue' })
                  : t('subtraction_learn.next_step', { defaultValue: 'Next Step' })}
              </Text>
            </Pressable>
          </View>

          {lineRevealed ? (
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>{t('subtraction_learn.excellent', { defaultValue: 'Excellent!' })}</Text>
              <Text style={styles.resultBody}>
                {t('subtraction_learn.moved_back', {
                  defaultValue: 'You moved back {{count}} steps.',
                  count: question.remove,
                })}
              </Text>
              <Text style={styles.resultEquation}>{answerText}</Text>
              <Text style={styles.resultBody}>
                {t('subtraction_learn.result_highlight', {
                  defaultValue: 'Result: {{count}}',
                  count: question.remaining,
                })}
              </Text>
            </View>
          ) : null}
        </View>
      )}

      <Pressable onPress={loadNewQuestion} style={styles.primaryButton} accessibilityRole="button">
        <Text style={styles.primaryButtonText}>
          {revealed || lineRevealed
            ? t('subtraction_learn.continue_button', { defaultValue: 'Continue' })
            : t('subtraction_learn.new_question', { defaultValue: 'New Question' })}
        </Text>
      </Pressable>
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
  hero: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 18,
    borderWidth: 2,
    borderColor: '#FFD2EA',
    shadowColor: '#D84E9A',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  heroKicker: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#FF6B9E',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#7E2D6A',
    marginBottom: 8,
  },
  heroBody: {
    fontSize: 16,
    lineHeight: 22,
    color: '#704D66',
  },
  stageSwitcher: {
    flexDirection: 'row',
    gap: 10,
  },
  stageChip: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: '#FFD2EA',
    gap: 4,
  },
  stageChipActive: {
    backgroundColor: '#FFF2FA',
    borderColor: '#FF6B9E',
  },
  stageChipLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#7E2D6A',
    marginBottom: 4,
  },
  stageChipLabelActive: {
    color: '#FF6B9E',
  },
  stageChipSubLabel: {
    fontSize: 12,
    color: '#704D66',
  },
  stageChipSubLabelActive: {
    color: '#FFB3D1',
  },
  questionCard: {
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
    gap: 10,
  },
  questionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FF6B9E',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  questionText: {
    fontSize: 34,
    fontWeight: '900',
    color: '#7E2D6A',
  },
  questionBody: {
    fontSize: 15,
    color: '#704D66',
    fontWeight: '700',
  },
  objectCard: {
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
  objectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  objectTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#7E2D6A',
  },
  objectCount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FF6B9E',
  },
  objectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  objectTile: {
    width: '28%',
    minWidth: 90,
    aspectRatio: 1,
    borderRadius: 22,
    backgroundColor: '#FFF8FC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFD2EA',
    position: 'relative',
  },
  objectTilePressed: {
    transform: [{ scale: 0.96 }],
  },
  objectTileRemoved: {
    backgroundColor: '#FFE4F1',
    borderColor: '#FFB3D1',
    opacity: 0.5,
    transform: [{ scale: 0.9 }],
  },
  objectEmoji: {
    fontSize: 36,
  },
  objectEmojiRemoved: {
    opacity: 0.45,
  },
  crossMark: {
    position: 'absolute',
    fontSize: 28,
    color: '#FF6B9E',
    fontWeight: '900',
  },
  resultCard: {
    backgroundColor: '#FFF0F7',
    borderRadius: 24,
    padding: 18,
    borderWidth: 2,
    borderColor: '#FFB3D1',
    gap: 10,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FF6B9E',
  },
  resultBody: {
    fontSize: 15,
    lineHeight: 22,
    color: '#704D66',
    fontWeight: '700',
  },
  resultEquation: {
    fontSize: 26,
    fontWeight: '900',
    color: '#7E2D6A',
  },
  remainingWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6,
  },
  remainingTile: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FFD2EA',
  },
  lineCard: {
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
  lineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  lineSubtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: '#704D66',
    fontWeight: '700',
  },
  lineBadge: {
    backgroundColor: '#FFF2FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  lineBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FF6B9E',
  },
  lineTrackWrap: {
    paddingTop: 58,
    paddingBottom: 18,
  },
  lineTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#FFD2EA',
    marginTop: 22,
  },
  lineIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B9E',
    shadowColor: '#D84E9A',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  lineIndicatorText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  lineNumbers: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lineNumberCell: {
    width: 28,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  lineNumberPressed: {
    transform: [{ scale: 0.96 }],
  },
  lineNumberStart: {
    backgroundColor: '#FFD36E',
  },
  lineNumberResult: {
    backgroundColor: '#FFB3D1',
  },
  lineNumberCurrent: {
    backgroundColor: '#FF6B9E',
  },
  lineNumberText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#704D66',
  },
  lineNumberTextStart: {
    color: '#7E2D6A',
  },
  lineNumberTextResult: {
    color: '#7E2D6A',
  },
  lineNumberTextCurrent: {
    color: '#FFFFFF',
  },
  lineControls: {
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
  primaryButtonDisabled: {
    opacity: 0.55,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
