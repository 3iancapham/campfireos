export function parseStrategyFromMarkdown(markdown: string): any {
  console.log("=== Starting Strategy Parser ===");
  console.log("Raw markdown received:", markdown);
  
  // Extract strategy analysis section if present
  const strategyAnalysisMatch = markdown.match(/<strategy_analysis>([\s\S]*?)<\/strategy_analysis>/);
  const strategyAnalysis = strategyAnalysisMatch ? strategyAnalysisMatch[1] : markdown;
  
  // Split into sections, including subsections
  const sections = strategyAnalysis.split(/\n[#]+\s+/).filter(Boolean);
  console.log("Found sections:", sections.map(s => s.split('\n')[0]));
  
  // Find each section with error logging
  const summarySection = sections.find(section => 
    section.toLowerCase().startsWith('key highlights')
  );
  console.log("Summary section found:", !!summarySection);
  if (summarySection) {
    console.log("Summary section preview:", summarySection.substring(0, 200));
  }

  const contentSection = sections.find(section =>
    section.toLowerCase().startsWith('content strategy')
  );
  console.log("Content section found:", !!contentSection);
  if (contentSection) {
    console.log("Content section preview:", contentSection.substring(0, 200));
  }

  const audienceSection = sections.find(section => 
    section.toLowerCase().startsWith('target audience strategy')
  );
  console.log("Audience section found:", !!audienceSection);
  if (audienceSection) {
    console.log("Audience section preview:", audienceSection.substring(0, 200));
  }

  const platformSection = sections.find(section =>
    section.toLowerCase().startsWith('platform strategy')
  );
  console.log("Platform section found:", !!platformSection);
  if (platformSection) {
    console.log("Platform section preview:", platformSection.substring(0, 200));
  }

  const recommendationsSection = sections.find(section =>
    section.toLowerCase().startsWith('recommendations strategy')
  );
  console.log("Recommendations section found:", !!recommendationsSection);
  if (recommendationsSection) {
    console.log("Recommendations section preview:", recommendationsSection.substring(0, 200));
  }

  // Extract data with error logging
  const mainTopic = extractMainTopic(summarySection || '');
  console.log("Extracted main topic:", mainTopic);

  const subTopic = extractSubTopic(summarySection || '');
  console.log("Extracted subtopic:", subTopic);

  const currentPlatforms = extractPlatforms(summarySection || platformSection || '');
  console.log("Extracted platforms:", currentPlatforms);

  const contentPillars = extractContentPillars(contentSection || '');
  console.log("Extracted content pillars:", contentPillars);

  // Build and return the strategy object
  const strategy = {
    mainTopic,
    subTopic,
    currentChannels: currentPlatforms,
    targetAudience: {
      ageGroups: extractAgeGroups(summarySection || audienceSection || ''),
      gender: extractGender(summarySection || audienceSection || ''),
      interests: extractInterests(summarySection || audienceSection || ''),
      location: extractLocation(summarySection || audienceSection || ''),
      customInterests: extractCustomInterests(audienceSection || '')
    },
    goal: extractGoal(summarySection || recommendationsSection || ''),
    challenges: extractChallenges(recommendationsSection || ''),
    contentStrategy: {
      pillars: contentPillars,
      toneAndStyle: extractToneAndStyle(contentSection || '')
    },
    recommendations: {
      contentIdeas: extractContentIdeas(contentSection || ''),
      postingSchedule: extractPostingSchedule(platformSection || ''),
      strategic: extractStrategicRecommendations(recommendationsSection || '')
    },
    generatedAt: new Date().toISOString()
  };

  console.log("=== Final Parsed Strategy ===");
  console.log(JSON.stringify(strategy, null, 2));

  return strategy;
}

function extractMainTopic(section: string): string {
  // Look for content line with Main Topic in both formats
  const contentMatch = section.match(/\*\*Content\*\*:\s*([^(,]+)/i) || 
                       section.match(/\*\*Content\*\*:\s*([^,]+)/i);
  if (!contentMatch) {
    console.error("No main topic found in section:", section.substring(0, 200));
    return '';
  }
  return contentMatch[1].trim();
}

function extractSubTopic(section: string): string {
  // Look for content line with Subtopic in both formats
  const subTopicMatch = section.match(/\*\*Content\*\*:[^,]+,\s*([^)]+)/i) ||
                       section.match(/specifically\s+([^.\n]+)/i);
  if (!subTopicMatch) {
    console.error("No subtopic found in section:", section.substring(0, 200));
    return '';
  }
  return subTopicMatch[1].trim();
}

function extractAgeGroups(section: string): string[] {
  // Look for age ranges in target audience section
  const ageMatches = section.match(/(?:ages?\s+)?(\d+(?:-\d+)?(?:\s*,\s*\d+(?:-\d+)?)*)/i);
  if (!ageMatches) {
    console.error("No age groups found in section:", section.substring(0, 200));
    return [];
  }
  return ageMatches[1].split(/\s*,\s*/).map(age => age.trim());
}

function extractGender(section: string): string {
  // Look for gender mentions
  const genderMatches = section.match(/(?:women|men|female|male|all genders)/i);
  if (!genderMatches) {
    console.error("No gender focus found in section:", section.substring(0, 200));
    return '';
  }
  return genderMatches[0].toLowerCase();
}

function extractInterests(section: string): string[] {
  // Look for interests after "Interested in" or in bullet points
  const interestsMatch = section.match(/interested in[^.\n]+/i) || 
                        section.match(/interests?:[^.\n]+/i);
  if (!interestsMatch) {
    console.error("No interests found in section:", section.substring(0, 200));
    return [];
  }
  return interestsMatch[0]
    .replace(/interested in:?\s*/i, '')
    .split(/[,\n]/)
    .map(interest => interest.trim())
    .filter(Boolean);
}

function extractLocation(section: string): string {
  // Look for location mentions
  const locationMatch = section.match(/(?:globally|global|location:\s*([^.\n]+))/i);
  if (!locationMatch) {
    console.error("No location found in section:", section.substring(0, 200));
    return '';
  }
  return (locationMatch[1] || locationMatch[0]).trim().toLowerCase();
}

function extractCustomInterests(section: string): string[] {
  // Look for additional interests in bullet points
  const customInterests = section
    .split('\n')
    .filter(line => 
      line.trim().startsWith('-') && 
      !line.toLowerCase().includes('age') &&
      !line.toLowerCase().includes('gender') &&
      !line.toLowerCase().includes('location')
    )
    .map(line => line.replace(/^-\s*/, '').trim())
    .filter(Boolean);
  
  if (customInterests.length === 0) {
    console.error("No custom interests found in section:", section.substring(0, 200));
  }
  return customInterests;
}

function extractGoal(section: string): string {
  // Look for goal in Goals line or Primary Goal
  const goalMatch = section.match(/\*\*Goals?\*\*:\s*([^(]+)/i) ||
                   section.match(/Primary Goal:\s*([^)\n]+)/i);
  if (!goalMatch) {
    console.error("No goal found in section:", section.substring(0, 200));
    return '';
  }
  return goalMatch[1].trim();
}

function extractChallenges(section: string): string[] {
  // Look for challenges in bullet points
  const challenges = section
    .split('\n')
    .filter(line => 
      line.trim().startsWith('-') || 
      line.trim().startsWith('*')
    )
    .map(line => line.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean);
  
  if (challenges.length === 0) {
    console.error("No challenges found in section:", section.substring(0, 200));
  }
  return challenges;
}

function extractContentIdeas(section: string): string[] {
  // Look for content ideas in bullet points under themes
  const ideas = section
    .split('\n')
    .filter(line => 
      line.trim().startsWith('-') && 
      !line.toLowerCase().includes('pillar')
    )
    .map(line => line.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean);
  
  if (ideas.length === 0) {
    console.error("No content ideas found in section:", section.substring(0, 200));
  }
  return ideas;
}

function extractPostingSchedule(section: string): any {
  // Look for posting schedule information
  const frequencyMatch = section.match(/post(?:ing)?\s+frequency:\s*([^.\n]+)/i);
  const timesMatch = section.match(/best\s+(?:posting\s+)?times?:\s*([^.\n]+)/i);

  if (!frequencyMatch) {
    console.error("No posting frequency found in section:", section.substring(0, 200));
  }
  if (!timesMatch) {
    console.error("No posting times found in section:", section.substring(0, 200));
  }

  return {
    frequency: frequencyMatch ? frequencyMatch[1].trim().toLowerCase() : '',
    bestTimes: timesMatch 
      ? timesMatch[1].split(/[,\n]/).map(time => time.trim()).filter(Boolean)
      : [],
    platforms: {}
  };
}

function extractStrategicRecommendations(section: string): string[] {
  // Look for recommendations in bullet points
  const recommendations = section
    .split('\n')
    .filter(line => 
      line.trim().startsWith('-') || 
      line.trim().startsWith('*')
    )
    .map(line => line.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean);
  
  if (recommendations.length === 0) {
    console.error("No strategic recommendations found in section:", section.substring(0, 200));
  }
  return recommendations;
}

function extractPlatforms(section: string): string[] {
  // Look for platforms in both summary and platform sections
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
  
  // First try to find platforms in the "Current Platform(s)" section
  const currentPlatformsMatch = section.match(/Current Platform\(s\):?\s*([^#]+)/i);
  if (currentPlatformsMatch) {
    const foundPlatforms = platformKeywords
      .filter(p => p.keywords.some(keyword => currentPlatformsMatch[1].toLowerCase().includes(keyword)))
      .map(p => p.name);
    if (foundPlatforms.length > 0) {
      return foundPlatforms;
    }
  }
  
  // Fallback to searching the entire section
  const foundPlatforms = platformKeywords
    .filter(p => p.keywords.some(keyword => lowerSection.includes(keyword)))
    .map(p => p.name);
  
  if (foundPlatforms.length === 0) {
    console.error("No platforms found in section:", section.substring(0, 200));
  }
  return foundPlatforms;
}

function extractContentPillars(section: string): Array<{name: string, description: string, themes: string[]}> {
  const pillars = [];
  
  // Look for numbered content pillars with bold titles
  const pillarMatches = section.match(/\d+\.\s*\*\*[^*]+\*\*/g) || section.match(/\*\*[^*]+\*\*/g);
  
  if (!pillarMatches) {
    console.error("No content pillars found in section:", section.substring(0, 200));
    return [];
  }
  
  for (const match of pillarMatches) {
    const name = match.replace(/\d+\.\s*\*\*|\*\*/g, '').trim();
    
    // Find themes - bullet points after the pillar name
    const themesMatch = section.match(new RegExp(`${name}[\\s\\S]*?(?=\\d+\\.\\s*\\*\\*|\\*\\*|$)`, 'i'));
    if (!themesMatch) {
      console.error(`No themes found for pillar "${name}"`);
      continue;
    }

    const themes = themesMatch[0]
      .split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.replace(/^-\s*/, '').trim())
      .filter(Boolean);
    
    pillars.push({
      name,
      description: '', // Description is often embedded in the themes
      themes
    });
  }
  
  return pillars;
}

function extractToneAndStyle(section: string): string {
  // Look for tone and style mentions
  const toneMatch = section.match(/(?:tone|style|voice)(?:\s+and\s+style)?:\s*([^.\n]+)/i);
  if (!toneMatch) {
    console.error("No tone and style found in section:", section.substring(0, 200));
    return '';
  }
  return toneMatch[1].trim();
} 