import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import KidBackdrop from '../KidBackdrop';

type Stage = 'single' | 'double';

type ObjectAsset = {
  key: string;
  emoji: string;
  name: string;
};

type AdditionQuestion = {
  left: number;
  right: number;
  total: number;
  object: ObjectAsset;
  stage: Stage;
};

type ObjectGroup = {
  index: number;
  size: number;
  startIndex: number;
};

const STAGES: Array<{ key: Stage; labelKey: string; descriptionKey: string }> = [
  { key: 'single', labelKey: 'addition_learn.single_label', descriptionKey: 'addition_learn.single_description' },
  { key: 'double', labelKey: 'addition_learn.double_label', descriptionKey: 'addition_learn.double_description' },
];

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

function generateQuestion(stage: Stage): AdditionQuestion {
  const object = pickRandom(OBJECTS);

  if (stage === 'single') {
    let left = 0;
    let right = 0;

    do {
      left = randomInt(0, 9);
      right = randomInt(0, 9);
    } while (left + right > 10 || left + right === 0);

    return { left, right, total: left + right, object, stage };
  }

  const left = randomInt(8, 15);
  const right = randomInt(8, 15);

  return { left, right, total: left + right, object, stage };
}

function buildNumbers(count: number) {
  return Array.from({ length: count }, (_, index) => index + 1);
}

function buildGroups(count: number) {
  const groups: ObjectGroup[] = [];
  let remaining = count;
  let index = 0;
  let startIndex = 0;

  while (remaining > 0) {
    const size = Math.min(5, remaining);
    groups.push({ index, size, startIndex });
    remaining -= size;
    startIndex += size;
    index += 1;
  }

  return groups;
}

export default function AdditionLearnEngine() {
  const { t } = useTranslation();
  const [stage, setStage] = useState<Stage>('single');
  const [question, setQuestion] = useState<AdditionQuestion>(() => generateQuestion('single'));
  const [count, setCount] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const nextQuestion = generateQuestion(stage);
    setQuestion(nextQuestion);
    setCount(0);
    setCompleted(false);
  }, [stage]);

  function loadNewQuestion() {
    setQuestion(generateQuestion(stage));
    setCount(0);
    setCompleted(false);
  }

  function handleObjectPress(index: number) {
    if (completed || index !== count) {
      return;
    }

    setCount((current) => {
      const nextCount = current + 1;
      if (nextCount >= question.total) {
        setCompleted(true);
      }
      return nextCount;
    });
  }

  function handleGroupPress(startIndex: number, size: number) {
    if (completed || count !== startIndex) {
      return;
    }

    setCount((current) => {
      const nextCount = current + size;
      if (nextCount >= question.total) {
        setCompleted(true);
      }
      return nextCount;
    });
  }

  const instruction = stage === 'single' ? t('addition_learn.instruction_single') : t('addition_learn.instruction_double');
  const answerText = `${question.left} + ${question.right} = ${question.total}`;

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <KidBackdrop />
      <View style={styles.hero}>
        <Text style={styles.heroKicker}>{t(STAGES.find((item) => item.key === stage)?.labelKey ?? 'addition_learn.single_label')}</Text>
        <Text style={styles.heroTitle}>{t('addition_learn.title')}</Text>
        <Text style={styles.heroBody}>{instruction}</Text>
      </View>

      <View style={styles.stageRow}>
        {STAGES.map((item) => {
          const active = item.key === stage;
          return (
            <Pressable
              key={item.key}
              onPress={() => setStage(item.key)}
              style={[styles.stageChip, active && styles.stageChipActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.stageChipLabel, active && styles.stageChipLabelActive]}>
                {t(item.labelKey)}
              </Text>
              <Text style={[styles.stageChipDescription, active && styles.stageChipDescriptionActive]}>
                {t(item.descriptionKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.questionCard}>
        <Text style={styles.questionLabel}>{t('addition_learn.question_label')}</Text>
        <Text style={styles.questionText}>
          {question.left} + {question.right}
        </Text>
        <View style={styles.totalPill}>
          <Text style={styles.totalPillText}>{t('addition_learn.tap_count_target', { count: question.total })}</Text>
        </View>
      </View>

      <View style={styles.counterCard}>
        <Text style={styles.counterLabel}>{t('addition_learn.count_label')}</Text>
        {stage === 'single' ? (
          <View style={styles.counterRow}>
            {buildNumbers(question.total).map((number) => {
              const active = number <= count;
              return (
                <View key={number} style={[styles.counterBubble, active && styles.counterBubbleActive]}>
                  <Text style={[styles.counterBubbleText, active && styles.counterBubbleTextActive]}>{number}</Text>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.largeCounterPill}>
            <Text style={styles.largeCounterValue}>{count}</Text>
            <Text style={styles.largeCounterSeparator}>/</Text>
            <Text style={styles.largeCounterTotal}>{question.total}</Text>
          </View>
        )}
      </View>

      <View style={styles.groupCard}>
        <Text style={styles.groupTitle}>{t('addition_learn.group_a')}</Text>
        <Text style={styles.groupSubtitle}>
          {t('addition_learn.objects_count', { count: question.left })}
        </Text>
        {stage === 'single' ? (
          <View style={styles.objectGrid}>
            {buildNumbers(question.left).map((number) => {
              const tapped = number <= Math.min(count, question.left);
              return (
                <Pressable
                  key={`left-${number}`}
                  onPress={() => handleObjectPress(number - 1)}
                  accessibilityRole="button"
                  accessibilityLabel={t('addition_learn.object_accessibility', { count: number })}
                  style={({ pressed }) => [
                    styles.objectTile,
                    tapped && styles.objectTileTapped,
                    pressed && !tapped && styles.objectTilePressed,
                  ]}
                >
                  <Text style={styles.objectEmoji}>{question.object.emoji}</Text>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={styles.groupRows}>
            {buildGroups(question.left).map((group) => {
              const tapped = count >= group.startIndex + group.size;
              return (
                <Pressable
                  key={`left-group-${group.index}`}
                  onPress={() => handleGroupPress(group.startIndex, group.size)}
                  accessibilityRole="button"
                  accessibilityLabel={t('addition_learn.objects_count', { count: group.size })}
                  style={({ pressed }) => [
                    styles.groupRow,
                    tapped && styles.groupRowTapped,
                    pressed && !tapped && styles.groupRowPressed,
                  ]}
                >
                  <View style={styles.groupRowCount}>
                    <Text style={styles.groupRowCountValue}>{group.size}</Text>
                  </View>
                  <View style={styles.groupRowObjects}>
                    {buildNumbers(group.size).map((number) => (
                      <View key={`left-group-${group.index}-object-${number}`} style={styles.objectTileCompact}>
                        <Text style={styles.objectEmojiSmall}>{question.object.emoji}</Text>
                      </View>
                    ))}
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      <View style={styles.groupCard}>
        <Text style={styles.groupTitle}>{t('addition_learn.group_b')}</Text>
        <Text style={styles.groupSubtitle}>
          {t('addition_learn.objects_count', { count: question.right })}
        </Text>
        {stage === 'single' ? (
          <View style={styles.objectGrid}>
            {buildNumbers(question.right).map((number) => {
              const objectIndex = question.left + number - 1;
              const tapped = objectIndex < count;
              return (
                <Pressable
                  key={`right-${number}`}
                  onPress={() => handleObjectPress(objectIndex)}
                  accessibilityRole="button"
                  accessibilityLabel={t('addition_learn.object_accessibility', { count: question.left + number })}
                  style={({ pressed }) => [
                    styles.objectTile,
                    tapped && styles.objectTileTapped,
                    pressed && !tapped && styles.objectTilePressed,
                  ]}
                >
                  <Text style={styles.objectEmoji}>{question.object.emoji}</Text>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={styles.groupRows}>
            {buildGroups(question.right).map((group) => {
              const startIndex = question.left + group.startIndex;
              const tapped = count >= startIndex + group.size;
              return (
                <Pressable
                  key={`right-group-${group.index}`}
                  onPress={() => handleGroupPress(startIndex, group.size)}
                  accessibilityRole="button"
                  accessibilityLabel={t('addition_learn.objects_count', { count: group.size })}
                  style={({ pressed }) => [
                    styles.groupRow,
                    tapped && styles.groupRowTapped,
                    pressed && !tapped && styles.groupRowPressed,
                  ]}
                >
                  <View style={styles.groupRowCount}>
                    <Text style={styles.groupRowCountValue}>{group.size}</Text>
                  </View>
                  <View style={styles.groupRowObjects}>
                    {buildNumbers(group.size).map((number) => (
                      <View key={`right-group-${group.index}-object-${number}`} style={styles.objectTileCompact}>
                        <Text style={styles.objectEmojiSmall}>{question.object.emoji}</Text>
                      </View>
                    ))}
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      {completed ? (
        <View style={styles.successCard}>
          <Text style={styles.successTitle}>{t('addition_learn.great_job')}</Text>
          <Text style={styles.successEquation}>{answerText}</Text>
          <Text style={styles.successBody}>{t('addition_learn.counted_all_objects')}</Text>
        </View>
      ) : null}

      <Pressable onPress={loadNewQuestion} style={styles.primaryButton} accessibilityRole="button">
        <Text style={styles.primaryButtonText}>
          {completed ? t('addition_learn.continue_button') : t('addition_learn.new_question')}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 14,
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
  stageRow: {
    flexDirection: 'row',
    gap: 10,
  },
  stageChip: {
    flex: 1,
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FFD2EA',
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
  stageChipDescription: {
    fontSize: 12,
    color: '#704D66',
  },
  stageChipDescriptionActive: {
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
  },
  questionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FF6B9E',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 34,
    fontWeight: '900',
    color: '#7E2D6A',
    marginBottom: 10,
  },
  totalPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF2FA',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  totalPillText: {
    color: '#FF6B9E',
    fontWeight: '700',
  },
  counterCard: {
    backgroundColor: '#FFF8FC',
    borderRadius: 28,
    padding: 18,
    borderWidth: 2,
    borderColor: '#FFD2EA',
  },
  counterLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FF6B9E',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  counterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  largeCounterPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: '#FFD36E',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  largeCounterValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#7E2D6A',
  },
  largeCounterSeparator: {
    fontSize: 20,
    fontWeight: '900',
    color: '#8A6500',
  },
  largeCounterTotal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#8A6500',
  },
  counterBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD36E',
  },
  counterBubbleActive: {
    backgroundColor: '#FF6B9E',
  },
  counterBubbleText: {
    fontWeight: '800',
    color: '#8A6500',
    fontSize: 13,
  },
  counterBubbleTextActive: {
    color: '#FFFFFF',
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 18,
    borderWidth: 2,
    borderColor: '#FFD2EA',
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#7E2D6A',
  },
  groupSubtitle: {
    marginTop: 4,
    marginBottom: 14,
    fontSize: 14,
    color: '#704D66',
  },
  objectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 8,
  },
  groupRows: {
    gap: 10,
  },
  groupRow: {
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FFD2EA',
    backgroundColor: '#FFF8FC',
    padding: 12,
  },
  groupRowPressed: {
    transform: [{ scale: 0.99 }],
  },
  groupRowTapped: {
    backgroundColor: '#FFF2FA',
    borderColor: '#FFB3D1',
  },
  groupRowCount: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF6B9E',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
  },
  groupRowCountValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  groupRowObjects: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  objectTileCompact: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF2FA',
  },
  objectEmojiSmall: {
    fontSize: 18,
  },
  objectTile: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8FC',
    borderWidth: 2,
    borderColor: '#FFD2EA',
  },
  objectTilePressed: {
    transform: [{ scale: 0.97 }],
  },
  objectTileTapped: {
    backgroundColor: '#FFF2FA',
    borderColor: '#FFB3D1',
  },
  objectEmoji: {
    fontSize: 28,
  },
  successCard: {
    backgroundColor: '#FFF0F7',
    borderRadius: 28,
    padding: 18,
    borderWidth: 2,
    borderColor: '#FFB3D1',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FF6B9E',
    marginBottom: 8,
  },
  successEquation: {
    fontSize: 28,
    fontWeight: '900',
    color: '#7E2D6A',
    marginBottom: 6,
  },
  successBody: {
    fontSize: 16,
    color: '#704D66',
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#FF6B9E',
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
