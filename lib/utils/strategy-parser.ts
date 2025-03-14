export function parseStrategyFromMarkdown(markdown: string): any {
  // Remove any strategy_analysis section if present
  markdown = markdown.replace(/<strategy_analysis>[\s\S]*?<\/strategy_analysis>/g, '');
  
  // Split into sections, handling both ## and # headers
  const sections = markdown.split(/\n[#]+\s+/).filter(Boolean);
  
  // Find the high-level summary section (section 1)
  const summarySection = sections.find(section => 
    section.toLowerCase().includes('high-level summary') || 
    section.toLowerCase().includes('summary')
  ) || sections[1] || '';

  // Find the content strategy section (section 2)
  const contentSection = sections.find(section =>
    section.toLowerCase().includes('content strategy') ||
    section.toLowerCase().includes('content')
  ) || sections[2] || '';

  // Find the target audience section (section 3)
  const audienceSection = sections.find(section => 
    section.toLowerCase().includes('target audience') || 
    section.toLowerCase().includes('audience strategy')
  ) || sections[3] || '';

  // Find the strategic recommendations section (section 4)
  const recommendationsSection = sections.find(section =>
    section.toLowerCase().includes('strategic recommendations') ||
    section.toLowerCase().includes('recommendations')
  ) || sections[4] || '';

  // Extract current platforms from the summary or content sections
  const currentPlatforms = extractPlatforms(summarySection + contentSection);

  return {
    mainTopic: extractMainTopic(summarySection),
    subTopic: extractSubTopic(summarySection),
    currentChannels: currentPlatforms,
    targetAudience: {
      ageGroups: extractAgeGroups(audienceSection),
      gender: extractGender(audienceSection),
      interests: extractInterests(audienceSection),
      location: extractLocation(audienceSection),
      customInterests: extractCustomInterests(audienceSection)
    },
    goal: extractGoal(recommendationsSection || summarySection),
    goalDetails: extractGoalDetails(recommendationsSection || summarySection),
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
  const platformKeywords = [
    { name: 'instagram', keywords: ['instagram', 'ig'] },
    { name: 'tiktok', keywords: ['tiktok', 'tik tok'] },
    { name: 'youtube', keywords: ['youtube', 'yt'] },
    { name: 'twitter', keywords: ['twitter', 'x'] },
    { name: 'facebook', keywords: ['facebook', 'fb'] },
    { name: 'linkedin', keywords: ['linkedin'] },
    { name: 'pinterest', keywords: ['pinterest'] },
    { name: 'reddit', keywords: ['reddit'] },
    { name: 'twitch', keywords: ['twitch'] }
  ];
  
  const lowerSection = section.toLowerCase();
  const foundPlatforms = platformKeywords
    .filter(p => p.keywords.some(keyword => lowerSection.includes(keyword)))
    .map(p => p.name);
  
  return foundPlatforms;
} 