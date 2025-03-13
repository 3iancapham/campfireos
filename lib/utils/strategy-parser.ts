export function parseStrategyFromMarkdown(markdown: string): any {
  // Split into sections, handling both ## and # headers
  const sections = markdown.split(/\n[#]+\s+/).filter(Boolean);
  
  // Find the platform strategy section
  const platformSection = sections.find(section => 
    section.toLowerCase().includes('platform') || 
    section.toLowerCase().includes('channels')
  ) || '';

  // Extract current platforms more flexibly
  const currentPlatformsMatch = platformSection.match(/current (?:platforms|channels):\s*([^.\n]+)/i);
  const currentPlatforms = currentPlatformsMatch 
    ? currentPlatformsMatch[1].toLowerCase().split(/[,\n]/).map(p => p.trim()).filter(Boolean)
    : [];

  // Find the audience section
  const audienceSection = sections.find(section => 
    section.toLowerCase().includes('audience') || 
    section.toLowerCase().includes('demographics')
  ) || '';

  // Find the recommendations section
  const recommendationsSection = sections.find(section =>
    section.toLowerCase().includes('recommendations') ||
    section.toLowerCase().includes('strategy')
  ) || '';

  // Find the content section
  const contentSection = sections.find(section =>
    section.toLowerCase().includes('content') ||
    section.toLowerCase().includes('posts')
  ) || '';

  return {
    mainTopic: extractMainTopic(sections[0] || ''),
    subTopic: extractSubTopic(sections[0] || ''),
    currentChannels: currentPlatforms,
    targetAudience: {
      ageGroups: extractAgeGroups(audienceSection),
      gender: extractGender(audienceSection),
      interests: extractInterests(audienceSection),
      location: extractLocation(audienceSection),
      customInterests: extractCustomInterests(audienceSection)
    },
    goal: extractGoal(recommendationsSection),
    goalDetails: extractGoalDetails(recommendationsSection),
    challenges: extractChallenges(recommendationsSection),
    recommendations: {
      contentIdeas: extractContentIdeas(contentSection),
      postingSchedule: extractPostingSchedule(contentSection),
      strategic: extractStrategicRecommendations(recommendationsSection)
    },
    generatedAt: new Date().toISOString()
  };
}

function extractMainTopic(section: string): string {
  const mainTopicMatch = section.match(/(?:focus|topic|niche):\s*([^.\n]+)/i);
  return mainTopicMatch ? mainTopicMatch[1].trim() : '';
}

function extractSubTopic(section: string): string {
  const subTopicMatch = section.match(/(?:subtopic|specialization|specific area):\s*([^.\n]+)/i);
  return subTopicMatch ? subTopicMatch[1].trim() : '';
}

function extractAgeGroups(section: string): string[] {
  const ageMatch = section.match(/(?:age|demographic)(?:s)?:?\s*([^.\n]+)/i);
  return ageMatch 
    ? ageMatch[1].split(/[,\n]/).map(age => age.trim()).filter(Boolean)
    : [];
}

function extractGender(section: string): string {
  const genderMatch = section.match(/gender:?\s*([^.\n]+)/i);
  return genderMatch ? genderMatch[1].trim().toLowerCase() : 'all';
}

function extractInterests(section: string): string[] {
  const interestsMatch = section.match(/interests?:?\s*([^.\n]+)/i);
  return interestsMatch
    ? interestsMatch[1].split(/[,\n]/).map(interest => interest.trim()).filter(Boolean)
    : [];
}

function extractLocation(section: string): string {
  const locationMatch = section.match(/location:?\s*([^.\n]+)/i);
  return locationMatch ? locationMatch[1].trim() : 'global';
}

function extractCustomInterests(section: string): string[] {
  const customMatch = section.match(/custom interests?:?\s*([^.\n]+)/i);
  return customMatch
    ? customMatch[1].split(/[,\n]/).map(interest => interest.trim()).filter(Boolean)
    : [];
}

function extractGoal(section: string): string {
  const goalMatch = section.match(/(?:primary )?goal:?\s*([^.\n]+)/i);
  return goalMatch ? goalMatch[1].trim() : '';
}

function extractGoalDetails(section: string): string {
  const detailsMatch = section.match(/goal details?:?\s*([^.\n]+)/i);
  return detailsMatch ? detailsMatch[1].trim() : '';
}

function extractChallenges(section: string): string[] {
  return section
    .split('\n')
    .filter(line => 
      line.toLowerCase().includes('challenge') || 
      (line.trim().startsWith('-') && line.toLowerCase().includes('problem'))
    )
    .map(line => line.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean);
}

function extractContentIdeas(section: string): string[] {
  return section
    .split('\n')
    .filter(line => 
      line.trim().startsWith('-') || 
      line.trim().startsWith('*') || 
      line.trim().startsWith('•')
    )
    .map(line => line.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean);
}

function extractPostingSchedule(section: string): any {
  const frequencyMatch = section.match(/frequency:?\s*([^.\n]+)/i);
  const timesMatch = section.match(/(?:best )?times?:?\s*([^.\n]+)/i);

  return {
    frequency: frequencyMatch ? frequencyMatch[1].trim().toLowerCase() : 'daily',
    bestTimes: timesMatch 
      ? timesMatch[1].split(/[,\n]/).map(time => time.trim()).filter(Boolean)
      : ['9:00 AM', '12:00 PM', '5:00 PM'],
    platforms: {}
  };
}

function extractStrategicRecommendations(section: string): string[] {
  return section
    .split('\n')
    .filter(line => 
      line.trim().startsWith('-') || 
      line.trim().startsWith('*') || 
      line.trim().startsWith('•')
    )
    .map(line => line.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean);
}

function extractPlatforms(section: string): string[] {
  const platforms = ['instagram', 'tiktok', 'youtube', 'twitter', 'facebook', 'linkedin', 'pinterest', 'reddit', 'twitch'];
  const foundPlatforms = platforms.filter(p => section.toLowerCase().includes(p));
  return foundPlatforms;
} 