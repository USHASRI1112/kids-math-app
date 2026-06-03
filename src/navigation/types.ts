export type TopicKey =
  | 'addition'
  | 'subtraction'
  | 'multiplication'
  | 'division'
  | 'decimal'
  | 'fractions'
  | 'percentages'
  | 'roots';

export type ActivityKey = 'learn' | 'practice' | 'quiz' | 'timer' | 'test' | 'play';

export type RootStackParamList = {
  Home: undefined;
  TopicActivity: {
    topicKey: TopicKey;
  };
  ActivityDetail: {
    topicKey: TopicKey;
    activityKey: ActivityKey;
  };
};