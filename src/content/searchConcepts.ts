// The search "thesaurus": what people type when they describe a need, and which novenas can help.
// Edit THIS FILE to teach search new words. No screen code needs to change.
//
// Each concept has:
//   triggers     words or phrases a person might type (misspellings of single words are caught automatically)
//   suggestions  the "Try searching for" chips shown when nothing matches exactly (each one is itself a trigger below, so tapping it finds novenas)
//   categories   catalog category ids whose novenas are relevant (see assets/catalog.json "categories")
//   keywords     novena keywords/tags that also count as relevant (see each novena's "keywords")
//   themes       short phrases offered in the "Suggestions" list while someone types, in the order they should appear
//                (typing "anxi" offers "anxiety", "anxiety and worry", "anxious thoughts"). Each one is also a trigger,
//                so picking a suggestion always finds novenas.

export interface SearchConcept {
  id: string;
  triggers: string[];
  suggestions: string[];
  categories: string[];
  keywords: string[];
  themes: string[];
}

export const searchConcepts: SearchConcept[] = [
  {
    id: 'physical-health',
    triggers: ['migraine', 'headache', 'pain', 'illness', 'sick', 'sickness', 'cancer', 'surgery', 'disease', 'injury', 'recovery', 'hospital',
      'healing', 'heal', 'health', 'physical health', 'strength during illness', 'wellbeing', 'chronic'],
    suggestions: ['Healing', 'Physical health', 'Strength during illness'],
    categories: ['health'],
    keywords: ['hope', 'mercy', 'protection of a loved one'],
    themes: ['healing', 'healing from illness', 'health', 'strength during illness', 'recovery after surgery', 'chronic pain'],
  },
  {
    id: 'anxiety',
    triggers: ['anxiety', 'anxious', 'worry', 'worried', 'stress', 'stressed', 'panic', 'fear', 'afraid', 'overwhelmed', 'nervous',
      'peace', 'calm', 'comfort', 'strength', 'mental health'],
    suggestions: ['Peace', 'Strength', 'Comfort'],
    categories: ['health', 'difficult-situations'],
    keywords: ['mental health', 'nervous disorders', 'trust', 'hope'],
    themes: ['anxiety', 'anxiety and worry', 'anxious thoughts', 'letting go of worry', 'worry', 'peace for troubled hearts', 'peace of mind', 'stress', 'fear', 'calm', 'comfort', 'mental health'],
  },
  {
    id: 'depression',
    triggers: ['depression', 'depressed', 'sad', 'sadness', 'despair', 'hopeless', 'burnout', 'emotional strength', 'hope'],
    suggestions: ['Hope', 'Comfort', 'Mental health'],
    categories: ['health', 'difficult-situations'],
    keywords: ['mental health', 'nervous disorders', 'hope'],
    themes: ['depression', 'hope', 'hope in dark times', 'sadness', 'emotional strength', 'mental fatigue'],
  },
  {
    id: 'loneliness',
    triggers: ['loneliness', 'lonely', 'alone', 'isolated', 'isolation', 'companionship'],
    suggestions: ['Companionship', 'Hope', 'Emotional strength'],
    categories: ['difficult-situations', 'relationships'],
    keywords: ['hope', 'marian'],
    themes: ['loneliness', 'feeling alone', 'companionship'],
  },
  {
    id: 'marriage',
    triggers: ['marriage', 'married', 'spouse', 'husband', 'wife', 'wedding', 'divorce', 'engaged', 'dating', 'relationships', 'relationship', 'love'],
    suggestions: ['Marriage', 'Relationships', 'Family wellbeing'],
    categories: ['relationships', 'family'],
    keywords: ['marriage', 'protection of a loved one'],
    themes: ['marriage', 'a happy marriage', 'finding a spouse', 'relationships', 'healing a relationship', 'love'],
  },
  {
    id: 'family',
    triggers: ['family', 'children', 'child', 'kids', 'baby', 'parents', 'mother', 'father', 'son', 'daughter', 'family wellbeing', 'protection'],
    suggestions: ['Children', 'Protection', 'Family wellbeing'],
    categories: ['family'],
    keywords: ['fathers', 'protection of a loved one', 'marriage'],
    themes: ['family', 'family wellbeing', 'children', 'protection of a loved one', 'parents', 'fathers'],
  },
  {
    id: 'work',
    triggers: ['job', 'jobs', 'career', 'work', 'employment', 'unemployed', 'interview', 'boss', 'business', 'promotion', 'guidance', 'new beginnings'],
    suggestions: ['Work', 'Guidance', 'New beginnings'],
    categories: ['work-studies'],
    keywords: ['work'],
    themes: ['work', 'finding a job', 'work and employment', 'career', 'guidance', 'new beginnings'],
  },
  {
    id: 'studies',
    triggers: ['exam', 'exams', 'study', 'studies', 'student', 'students', 'school', 'college', 'university', 'test', 'grades', 'homework'],
    suggestions: ['Students', 'Work & studies', 'Guidance'],
    categories: ['work-studies'],
    keywords: ['students', 'youth'],
    themes: ['studies', 'exams', 'students', 'school'],
  },
  {
    id: 'grief',
    triggers: ['grief', 'grieving', 'death', 'died', 'loss', 'funeral', 'bereavement', 'mourning', 'passed away'],
    suggestions: ['Comfort', 'Hope', 'Peace'],
    categories: ['difficult-situations'],
    keywords: ['hope', 'marian', 'mercy'],
    themes: ['grief', 'grief and loss', 'comfort in grief', 'loss of a loved one'],
  },
  {
    id: 'lost',
    triggers: ['lost', 'missing', 'keys', 'wallet', 'misplaced', 'lost items', 'finding things', 'lost articles'],
    suggestions: ['Lost items', 'Finding things'],
    categories: [],
    keywords: ['lost articles'],
    themes: ['lost items', 'lost articles', 'finding things'],
  },
  {
    id: 'trouble',
    triggers: ['trouble', 'struggle', 'struggling', 'crisis', 'problem', 'problems', 'money', 'debt', 'financial', 'finances', 'addiction', 'deliverance', 'difficult', 'courage'],
    suggestions: ['Hope', 'Courage', 'Trust'],
    categories: ['difficult-situations'],
    keywords: ['hope', 'courage', 'marian', 'trust'],
    themes: ['trouble', 'difficult times', 'hopeless causes', 'courage', 'financial worries', 'addiction'],
  },
  {
    id: 'faith',
    triggers: ['faith', 'doubt', 'doubts', 'trust', 'god', 'jesus', 'mary', 'mercy', 'devotion', 'spiritual'],
    suggestions: ['Trust', 'Mercy', 'Devotion'],
    categories: ['faith'],
    keywords: ['trust', 'mercy', 'devotion'],
    themes: ['faith', 'trust in god', 'trust', 'mercy', 'devotion', 'surrender', 'deepening faith'],
  },
];

// Shown when the search box is empty: common needs, each of which finds novenas.
export const popularSearches = ['Healing', 'Anxiety', 'Family', 'Work', 'Peace', 'Marriage'];

// Used when nothing at all matches, so the person still has somewhere to go.
export const fallbackSearches = ['Healing', 'Peace', 'Family', 'Work'];
