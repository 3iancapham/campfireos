import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { parseStrategyFromMarkdown } from '@/lib/utils/strategy-parser'

// Initialize Anthropic client (server-side only)
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export async function POST(request: Request) {
  try {
    const surveyData = await request.json()

    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 20000,
      temperature: 1,
      messages: [
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `You are an expert social media strategist tasked with creating or improving social media strategies for various businesses and creators. Your goal is to provide tailored advice based on the specific information provided about each client.

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

Your task is to create a comprehensive social media strategy based on this information. Follow these steps:

1. Analyze the provided information carefully.
2. Create a high-level summary of the client's social media profile.
3. Develop a content strategy, including content pillars.
4. Define a target audience strategy.
5. Provide strategic recommendations based on the stated goals and challenges.

Before crafting your final strategy, break down the information and show your thought process by wrapping your analysis in <strategy_analysis> tags. Include the following:

a. Summarize key client information
b. Identify 3-5 content pillars based on the main topic and subtopic
c. Define target audience characteristics
d. Analyze current platforms and suggest potential new ones based on the target audience
e. Brainstorm at least 2 specific content ideas for each content pillar
f. List potential platforms based on the target audience and current platforms
g. Brainstorm at least 3 ideas to address the primary goal and current challenges
h. Consider how the creator type and follower size impact the strategy
i. Suggest potential collaborations or partnerships based on the creator type and audience

Ensure that you consider all provided information in your strategy analysis. This will ensure a thorough interpretation of the data and a well-reasoned strategy. It's OK for this section to be quite long.

After your strategy analysis, provide your final output structured as follows:

\`\`\`markdown
# Social Media Strategy for [Creator Type]

## 1. High-Level Summary
[Provide a concise overview of the client's social media profile, including creator type and follower size]

## 2. Content Strategy
[Outline the content strategy, including content pillars and specific content ideas]

## 3. Target Audience Strategy
[Define the strategy for reaching and engaging the target audience]

## 4. Strategic Recommendations
[Provide specific recommendations based on goals, challenges, creator type, and follower size, including platform suggestions and potential collaborations]
\`\`\`

Ensure that your strategy is tailored to the specific creator type and incorporates all the provided information. Your recommendations should directly address the stated primary goal and current challenges, while also considering the impact of the creator type and follower size on the overall strategy.

Please proceed with your strategy analysis and strategy creation.`
            }
          ]
        },
        {
          "role": "assistant",
          "content": [
            {
              "type": "text",
              "text": "<strategy_analysis>"
            }
          ]
        }
      ]
    })

    // Extract and parse the strategy
    const fullResponse = response.content[0].type === 'text' ? response.content[0].text : ''
    
    // Extract the markdown section from the response
    const markdownRegex = /```markdown([\s\S]*?)```/
    const markdownMatch = fullResponse.match(markdownRegex)
    const markdownSection = markdownMatch ? markdownMatch[1] : fullResponse
    
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