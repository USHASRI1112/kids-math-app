import { ActivityKey, TopicKey } from '../navigation/types';

export interface TopicConfig {
  key: TopicKey;
  emoji: string;
}

export interface ActivityConfig {
  key: ActivityKey;
  titleKey: string;
  icon: string;
}

export const TOPICS: TopicConfig[] = [
  { key: 'addition', emoji: '➕' },
  { key: 'subtraction', emoji: '➖' },
  { key: 'multiplication', emoji: '✖️' },
  { key: 'division', emoji: '➗' },
  { key: 'decimal', emoji: '🔢' },
  { key: 'fractions', emoji: '🥧' },
  { key: 'percentages', emoji: '📊' },
  { key: 'roots', emoji: '√' },
];

export const ACTIVITIES: ActivityConfig[] = [
  { key: 'learn', titleKey: 'activities.learn', icon: 'book-open-page-variant-outline' },
  { key: 'practice', titleKey: 'activities.practice', icon: 'pencil-outline' },
  { key: 'quiz', titleKey: 'activities.quiz', icon: 'help-circle-outline' },
  { key: 'timer', titleKey: 'activities.timer', icon: 'timer-outline' },
  { key: 'test', titleKey: 'activities.test', icon: 'clipboard-check-outline' },
  { key: 'play', titleKey: 'activities.play', icon: 'gamepad-variant-outline' },
];