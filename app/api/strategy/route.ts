import { NextResponse } from 'next/server'
import { Anthropic } from '@anthropic-ai/sdk'
import { parseStrategyFromMarkdown } from '@/lib/utils/strategy-parser'

// Initialize Anthropic client (server-side only)
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export async function POST(request: Request) {
  try {
    const surveyData = await request.json()

    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 4000,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are an expert social media strategist tasked with creating or improving social media strategies for various businesses and creators. Your goal is to provide tailored advice based on the specific information provided about each client.

Here is the information about the client you'll be creating a strategy for:

<creator_type>
${surveyData.experience}
</creator_type>

<follower_size>
${surveyData.existingPresence.followers.total}
</follower_size>

<main_topic>
${surveyData.businessType}
</main_topic>

<subtopic>
${surveyData.contentPreferences.topicAreas[1] || ''}
</subtopic>

<current_platforms>
${surveyData.existingPresence.platforms.join(', ')}
</current_platforms>

<target_age_ranges>
${surveyData.targetAudienceDetails.demographics.filter((d: string) => d.includes('-') || d.includes('+')).join(', ')}
</target_age_ranges>

<target_gender_focus>
${surveyData.targetAudienceDetails.demographics.find((d: string) => ['male', 'female', 'all'].includes(d.toLowerCase())) || 'all'}
</target_gender_focus>

<target_location>
${surveyData.targetAudienceDetails.location || 'global'}
</target_location>

<target_interests>
${surveyData.targetAudienceDetails.interests.join(', ')}
</target_interests>

<primary_goal>
${surveyData.goals[0]}
</primary_goal>

<current_challenges>
${surveyData.challenges.join(', ')}
</current_challenges>

Please provide a comprehensive social media strategy in the following format:

# High-Level Summary
Focus: [Main Topic]
Subtopic: [Specific Area]

# Platform Strategy
Current Platforms: [List current platforms]
Primary Focus: [List 2-3 main platforms]
Secondary Focus: [List 1-2 supporting platforms]
Experimental: [List 1 platform to test]

# Content Strategy
Content Mix:
- Educational (40%): [Description]
- Entertaining (30%): [Description]
- Promotional (20%): [Description]
- Community (10%): [Description]

Content Ideas:
- [Idea 1]
- [Idea 2]
- [Idea 3]
...

Posting Schedule:
Frequency: [e.g., 3-5 times per week]
Best Times: [List optimal posting times]

# Target Audience
Age Groups: [List age ranges]
Gender: [Specified gender focus]
Location: [Geographic focus]
Interests: [List main interests]
Custom Interests: [List any specific niche interests]

# Strategic Recommendations
Primary Goal: [State main goal]
Goal Details: [Explain how to achieve the goal]

Challenges and Solutions:
- Challenge: [Challenge 1]
  Solution: [Solution 1]
- Challenge: [Challenge 2]
  Solution: [Solution 2]
...

Strategic Recommendations:
- [Recommendation 1]
- [Recommendation 2]
- [Recommendation 3]
...

Please ensure all sections are clearly marked with headers and bullet points for easy parsing.`
            }
          ]
        }
      ]
    })

    // Extract and parse the strategy
    const fullResponse = response.content[0].type === 'text' ? response.content[0].text : ''
    const markdownSection = fullResponse.split('```markdown')[1]?.split('```')[0] || fullResponse
    const strategy = parseStrategyFromMarkdown(markdownSection)

    return NextResponse.json({ strategy })
  } catch (error) {
    console.error('Error generating strategy:', error)
    return NextResponse.json(
      { error: 'Failed to generate strategy' },
      { status: 500 }
    )
  }
} 