import { Anthropic } from '@anthropic-ai/sdk';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '',
  dangerouslyAllowBrowser: true
});

export async function generateStrategy(surveyData: any) {
  try {
    const response = await fetch('/api/strategy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(surveyData),
    });

    if (!response.ok) {
      throw new Error('Failed to generate strategy');
    }

    const data = await response.json();
    return data.strategy;
  } catch (error) {
    console.error('Error generating strategy:', error);
    throw error;
  }
}

function parseStrategyFromMarkdown(markdown: string): any {
  // Basic parsing of the markdown sections into our strategy format
  const sections = markdown.split('\n## ');
  
  return {
    mainTopic: sections[1]?.match(/High-Level Summary\n(.*?)\n/)?.[1] || '',
    subTopic: sections[1]?.match(/High-Level Summary\n.*?\n(.*?)\n/)?.[1] || '',
    currentChannels: extractPlatforms(sections[2] || ''),
    targetAudience: {
      ageGroups: extractAgeGroups(sections[3] || ''),
      gender: extractGender(sections[3] || ''),
      interests: extractInterests(sections[3] || ''),
      location: extractLocation(sections[3] || ''),
      customInterests: []
    },
    goal: sections[4]?.match(/Strategic Recommendations\n(.*?)\n/)?.[1] || '',
    goalDetails: sections[4]?.split('\n').slice(1).join('\n') || '',
    challenges: extractChallenges(sections[4] || ''),
    recommendations: {
      contentIdeas: extractContentIdeas(sections[2] || ''),
      postingSchedule: {
        frequency: 'daily',
        bestTimes: ['9:00 AM', '12:00 PM', '5:00 PM'],
        platforms: {}
      },
      strategic: extractStrategicRecommendations(sections[4] || '')
    },
    generatedAt: new Date().toISOString()
  };
}

// Helper functions to extract information from markdown sections
function extractPlatforms(contentSection: string): string[] {
  // Extract platforms mentioned in the content strategy section
  const platforms = ['instagram', 'tiktok', 'youtube', 'twitter', 'facebook', 'linkedin'];
  return platforms.filter(p => contentSection.toLowerCase().includes(p));
}

function extractAgeGroups(audienceSection: string): string[] {
  const ageRanges = ['13-17', '18-24', '25-34', '35-44', '45-54', '55+'];
  return ageRanges.filter(age => audienceSection.includes(age));
}

function extractGender(audienceSection: string): string {
  if (audienceSection.toLowerCase().includes('female')) return 'female';
  if (audienceSection.toLowerCase().includes('male')) return 'male';
  return 'all';
}

function extractInterests(audienceSection: string): string[] {
  // Extract interests mentioned in the audience section
  const commonInterests = [
    'technology', 'fashion', 'beauty', 'fitness', 'health',
    'food', 'travel', 'business', 'finance', 'education',
    'entertainment', 'gaming', 'art', 'music', 'diy'
  ];
  return commonInterests.filter(interest => 
    audienceSection.toLowerCase().includes(interest.toLowerCase())
  );
}

function extractLocation(audienceSection: string): string {
  if (audienceSection.toLowerCase().includes('global')) return 'global';
  if (audienceSection.toLowerCase().includes('united states')) return 'us';
  if (audienceSection.toLowerCase().includes('europe')) return 'europe';
  if (audienceSection.toLowerCase().includes('asia')) return 'asia';
  return 'global';
}

function extractContentIdeas(contentSection: string): string[] {
  // Extract content ideas from bullet points or numbered lists
  return contentSection
    .split('\n')
    .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
    .map(line => line.replace(/^[-*]\s*/, '').trim())
    .filter(line => line.length > 0);
}

function extractChallenges(recommendationsSection: string): string[] {
  // Extract challenges from the recommendations section
  return recommendationsSection
    .split('\n')
    .filter(line => line.toLowerCase().includes('challenge'))
    .map(line => line.replace(/^[-*]\s*/, '').trim())
    .filter(line => line.length > 0);
}

function extractStrategicRecommendations(recommendationsSection: string): string[] {
  // Extract strategic recommendations from bullet points or numbered lists
  return recommendationsSection
    .split('\n')
    .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
    .map(line => line.replace(/^[-*]\s*/, '').trim())
    .filter(line => line.length > 0);
} 