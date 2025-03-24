import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { parseStrategyFromMarkdown } from '@/lib/utils/strategy-parser'

// Check if API key is available
const ANTHROPIC_API_KEY = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY

// Add debug logging
console.log("API Key available:", !!ANTHROPIC_API_KEY);
console.log("API Key length:", ANTHROPIC_API_KEY?.length);

// Initialize Anthropic client (server-side only) with explicit API key
const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY || '', // This will be checked before making the API call
})

export async function POST(request: Request) {
  try {
    // Check if API key is available
    if (!ANTHROPIC_API_KEY) {
      console.error('NEXT_PUBLIC_ANTHROPIC_API_KEY is not set in environment variables')
      return NextResponse.json(
        { error: 'API key not configured. Please set the NEXT_PUBLIC_ANTHROPIC_API_KEY environment variable.' },
        { status: 500 }
      )
    }

    const surveyData = await request.json()
    console.log("Received survey data:", JSON.stringify(surveyData, null, 2));

    // Now make the API call with proper authentication
    console.log("Making Anthropic API call...");
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 20000,
      temperature: 1,
      system: "You are an expert social media strategist tasked with creating or improving social media strategies for various businesses and creators. Your goal is to provide tailored advice based on the specific information provided about each client.",
      messages: [
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": "<examples>\n<example>\n<creator_type>\nsmall business\n</creator_type>\n<follower_size>\n0-1000\n</follower_size>\n<main_topic>\nmental health, personal growth\n</main_topic>\n<subtopic>\ndetoxing from limiting beliefs and expectations.\n</subtopic>\n<current_platforms>\ninstagram\n</current_platforms>\n<target_age_ranges>\n15 - 40\n</target_age_ranges>\n<target_gender_focus>\nprimarily females\n</target_gender_focus>\n<target_location>\nglobal\n</target_location>\n<target_interests>\nhealth & wellness, fitness, education\n</target_interests>\n<primary_goal>\nGrow followers\n</primary_goal>\n<current_challenges>\nSlow follower growth\n</current_challenges>\n<ideal_output>\n<strategy_analysis>\n\n## Key Highlights\n- **Content**: Mental health and personal development, specifically detoxing from limited beliefs and expectations\n- **Goals**: Grow follower base; currently facing challenge of low follower count (100)\n- **Target Audience**: Females aged 15-40 globally, interested in mental health\n- **Platforms**: Currently only using Instagram\n\n## Content Strategy\n### Content Pillars\n1. **Mental Health Awareness**\n   - Educational posts about recognizing limiting beliefs\n   - Myth-busting common mental health misconceptions\n   - Simple psychological concepts explained in accessible ways\n\n2. **Personal Transformation Journey**\n   - Before-and-after mindset shifts\n   - Personal stories and testimonials (yours or clients')\n   - Visualization techniques and exercises for breaking negative thought patterns\n\n3. **Actionable Self-Development**\n   - Quick daily affirmations\n   - Journaling prompts for self-reflection\n   - Step-by-step guides for identifying and releasing limiting beliefs\n\n**Tone and Style**: Approachable yet authoritative, compassionate, and empowering. Use a warm, conversational tone that feels like advice from a supportive friend rather than clinical instruction. Incorporate encouraging language that inspires action while being mindful of the sensitivity around mental health topics.\n\n## Target Audience Strategy\n### Audience Profiles\n\n1. **The Young Seeker (15-22)**\n   - Characteristics: High school/college student, navigating identity formation, dealing with academic pressure and social media comparison\n   - Why ideal: This demographic is highly active on social media and particularly responsive to mental health content as they're developing self-awareness\n   - Engagement strategy: Use relatable school/early adulthood examples, modern references, and content addressing comparison culture\n\n2. **The Career-Focused Woman (23-32)**\n   - Characteristics: Early to mid-career professional, balancing work ambitions with personal life, experiencing imposter syndrome\n   - Why ideal: This audience has disposable income for potential future products/services and is actively seeking ways to overcome professional obstacles\n   - Engagement strategy: Content about workplace confidence, breaking through career limiting beliefs, balancing ambition with self-care\n\n3. **The Life Transformer (33-40)**\n   - Characteristics: Established in career/family life but seeking meaningful change, reassessing life choices, potentially dealing with burnout\n   - Why ideal: This demographic is often highly motivated to make significant life changes and invested in personal development\n   - Engagement strategy: Deeper, more reflective content about releasing long-held limiting beliefs, reinvention narratives, and finding purpose\n\n## Platform Strategy\n### Current Platform\n- **Instagram**\n  - Best posting times: Tuesday, Wednesday, Friday 11am-1pm and 7-9pm\n  - Posting frequency: 4-5 feed posts per week, 2-3 stories daily\n  - Content format: Mix of carousel educational posts, quote graphics, short video tips, behind-the-scenes content via Stories\n\n### Recommended Additional Platforms\n- **TikTok**\n  - Best posting times: Tuesday, Thursday, Saturday 7-9pm\n  - Posting frequency: 3-4 videos per week\n  - Content format: 15-60 second tips, transformational stories, quick mental health exercises\n  - Rationale: Excellent for reaching younger audience (15-25) and content can be repurposed for Instagram Reels\n\n- **Pinterest**\n  - Best posting times: Saturday and Sunday 8-11pm, Monday and Thursday 2-4pm\n  - Posting frequency: 3-5 pins per week\n  - Content format: Infographics on mental health topics, self-care checklists, affirmation graphics\n  - Rationale: Pinterest users actively search for self-improvement content, and pins have long-term discoverability\n\n## Recommendations Strategy\n### Follower Growth Tactics\n\n1. **Collaboration Strategy**\n   - Identify 10-15 complementary creators in adjacent niches (fitness, nutrition, spirituality) with 1,000-10,000 followers\n   - Initiate collaboration through content swaps, guest appearances in Stories, or joint Lives\n   - Create a \"mental health experts to follow\" collaborative post where multiple creators can contribute and share\n\n2. **Hashtag and SEO Optimization**\n   - Research and use a mix of broad reach hashtags (#mentalhealth, #selflove) and specific niche hashtags (#limitingbeliefs, #mindsetdetox)\n   - Create a branded hashtag for your specific approach to encourage community tagging\n   - Optimize bio and post captions with searchable keywords related to mental health and limiting beliefs\n\n3. **Engagement-Focused Content Series**\n   - Develop a 30-day \"Limiting Belief Detox Challenge\" that encourages daily participation\n   - Create shareable interactive content like \"Which limiting belief is holding you back?\" quiz templates\n   - Implement weekly Q&A sessions where followers can submit their specific mental health questions\n</strategy_analysis>\n\n<weekly_content_plan>\n# Weekly Content Plan\n\n## MONDAY\n- **Platform**: Instagram\n- **Time**: 11:30am\n- **Content**: Mental Health Awareness Pillar\n  - Educational carousel post explaining one common limiting belief and how to identify it in your life\n  - Stories (7-9pm): Poll asking followers which limiting beliefs they struggle with most\n\n## TUESDAY\n- **Platform**: Instagram\n- **Time**: 12:30pm\n- **Content**: Actionable Self-Development Pillar\n  - Single image or short video with journaling prompt related to yesterday's limiting belief topic\n  - Stories (throughout day): Share follower responses to yesterday's poll (anonymously)\n- **Platform**: TikTok\n- **Time**: 8:00pm\n- **Content**: Quick 30-second tip for tackling a limiting belief in real-time\n\n## WEDNESDAY\n- **Platform**: Instagram\n- **Time**: 12:00pm\n- **Content**: Personal Transformation Journey Pillar\n  - Share a personal story or client testimonial (with permission) about overcoming a specific limiting belief\n  - Stories (11am): Behind-the-scenes of your own mental health practice or routine\n- **Platform**: Pinterest\n- **Time**: 3:00pm\n- **Content**: Create and pin an infographic based on Monday's educational content\n\n## THURSDAY\n- **Platform**: Instagram\n- **Time**: 8:00pm\n- **Content**: Engagement-focused content\n  - Post a question or prompt that encourages comments and discussion\n  - Stories (12pm): Share a quick tip or affirmation\n- **Platform**: TikTok\n- **Time**: 7:30pm\n- **Content**: Answer a common question about mental health or limiting beliefs\n\n## FRIDAY\n- **Platform**: Instagram\n- **Time**: 12:00pm\n- **Content**: Actionable Self-Development Pillar\n  - Post a weekend self-care challenge related to releasing limiting beliefs\n  - Stories (8pm): Q&A session where followers can ask questions\n- **Platform**: Pinterest\n- **Time**: 3:30pm\n- **Content**: Create and pin a weekend self-care checklist\n\n## SATURDAY\n- **Platform**: TikTok\n- **Time**: 8:00pm\n- **Content**: Weekend motivation or inspirational message about personal growth\n- **Platform**: Pinterest\n- **Time**: 9:00pm\n- **Content**: Create and pin quotes or affirmations related to mental health\n\n## SUNDAY\n- **Platform**: Instagram\n- **Time**: 7:00pm\n- **Content**: Weekly reflection post or preview of upcoming content\n  - Stories (throughout day): Share useful resources, books, or podcasts for mental health\n- **Platform**: Pinterest\n- **Time**: 8:30pm\n- **Content**: Pin preparation or mindset tips for the week ahead\n\n## ONGOING WEEKLY ACTIVITIES\n- Spend 20 minutes daily engaging with followers' comments\n- Identify and engage with 5-10 potential collaboration accounts weekly\n- Review analytics every Sunday to identify top-performing content\n- Adjust next week's content plan based on engagement data\n</weekly_content_plan>\n</ideal_output>\n</example>\n</examples>\n\n"
            },
            {
              "type": "text",
              "text": `You are an expert social media strategist tasked with creating or improving social media strategies for various businesses and creators. Your goal is to provide tailored advice based on the specific information provided about each client.

Here is the information about the client you'll be creating a strategy for:

<creator_type>
${surveyData.experience || surveyData.creatorType || 'small business'}
</creator_type>

<follower_size>
${surveyData.existingPresence?.followers?.total || surveyData.followerSize || '0-1000'}
</follower_size>

<main_topic>
${surveyData.businessType || surveyData.mainTopic || 'General Content'}
</main_topic>

<subtopic>
${surveyData.contentPreferences?.topicAreas?.[1] || surveyData.subTopic || ''}
</subtopic>

<current_platforms>
${(surveyData.existingPresence?.platforms || surveyData.currentPlatforms || ['instagram']).join(', ')}
</current_platforms>

<target_age_ranges>
${(surveyData.targetAudienceDetails?.demographics?.filter((d: string) => d.includes('-') || d.includes('+')) || surveyData.targetAgeRanges || ['18-35']).join(', ')}
</target_age_ranges>

<target_gender_focus>
${surveyData.targetAudienceDetails?.demographics?.find((d: string) => ['male', 'female', 'all'].includes(d.toLowerCase())) || surveyData.targetGender || 'all'}
</target_gender_focus>

<target_location>
${surveyData.targetAudienceDetails?.location || surveyData.targetLocation || 'global'}
</target_location>

<target_interests>
${(surveyData.targetAudienceDetails?.interests || surveyData.targetInterests || ['general']).join(', ')}
</target_interests>

<primary_goal>
${surveyData.goals?.[0] || surveyData.primaryGoal || 'Growth'}
</primary_goal>

<current_challenges>
${(surveyData.challenges || ['Consistency in posting', 'Finding the right audience']).join(', ')}
</current_challenges>

Your task is to create a comprehensive social media strategy based on this information. Follow these steps:

1. Analyze the provided answers from the user according to their onboarding survey about the current state of their social media. Break the strategy down into the following components/parts:
a) Key highlights of their profile broken down into Content (Main Topic, Subtopic), Goals (Primary Goal, Challenges), Target Audience (bullets of general target audience), and Platforms (list ones they currently use)
b) Then create a more detailed content strategy that identifies 3 content pillars based on the main topic and subtopic to focus on. Break down these content pillars into themes/concepts they can post about. Also provide suggested tone and style of messaging.
c) Then create a more detailed target audience strategy that shows 3 different target audience profiles. for each profile, explain why this would be an ideal target and provide characteristics.
d) The create a more detailed platform strategy that shows which platforms they already use and which ones they should consider adding. For each platform, provide best days and times to post as well as frequency.
e) Then create a more detailed recommendations strategy that addresses their goals and challenges and provides 3 tactics for improving goal outcomes and tackling current challenges. 

2. Based on this strategy, create a social media weekly content plan for the user. It should provide a routine that is easy to follow week to week, and note the platforms they are posting to, times and days, content topics/themes, etc.

Note that the output of your analysis will be taken by a social media management app and parsed into a UI to visually show to the user so please just break down each part as its own paragraph.

Ensure that your strategy is tailored to the specific creator type and incorporates all the provided information. Your recommendations should directly address the stated primary goal and current challenges, while also considering the impact of the creator type and follower size on the overall strategy.`
            }
          ]
        }
      ]
    })

    console.log("Anthropic API call successful");
    
    // Extract and parse the strategy
    const fullResponse = response.content[0].type === 'text' ? response.content[0].text : ''
    console.log("Full response length:", fullResponse.length);
    
    // Extract the strategy analysis and weekly content plan sections
    const strategyAnalysisMatch = fullResponse.match(/<strategy_analysis>([\s\S]*?)<\/strategy_analysis>/);
    const weeklyContentPlanMatch = fullResponse.match(/<weekly_content_plan>([\s\S]*?)<\/weekly_content_plan>/);
    
    const strategyAnalysis = strategyAnalysisMatch ? strategyAnalysisMatch[1] : '';
    const weeklyContentPlan = weeklyContentPlanMatch ? weeklyContentPlanMatch[1] : '';
    
    // Combine them for parsing
    const combinedResponse = strategyAnalysis + '\n\n' + weeklyContentPlan;
    
    // Parse the strategy
    const strategy = parseStrategyFromMarkdown(combinedResponse);
    
    // Ensure the strategy object matches the UserStrategy type
    const validatedStrategy = {
      mainTopic: strategy.mainTopic || surveyData.businessType || surveyData.mainTopic || 'General Content',
      subTopic: strategy.subTopic || surveyData.contentPreferences?.topicAreas?.[1] || surveyData.subTopic || '',
      currentChannels: strategy.currentChannels || surveyData.existingPresence?.platforms || surveyData.currentPlatforms || [],
      targetAudience: {
        ageGroups: strategy.targetAudience?.ageGroups || 
                  (surveyData.targetAudienceDetails?.demographics?.filter((d: string) => d.includes('-') || d.includes('+')) || []),
        gender: strategy.targetAudience?.gender || 
               (surveyData.targetAudienceDetails?.demographics?.find((d: string) => 
                 ['male', 'female', 'all'].includes(d.toLowerCase())) || 'All genders'),
        interests: strategy.targetAudience?.interests || surveyData.targetAudienceDetails?.interests || [],
        location: strategy.targetAudience?.location || surveyData.targetAudienceDetails?.location || 'Global',
        customInterests: strategy.targetAudience?.customInterests || []
      },
      goal: strategy.goal || surveyData.goals?.[0] || 'Growth',
      challenges: strategy.challenges || surveyData.challenges || [],
      contentStrategy: strategy.contentStrategy || {
        pillars: [
          { name: 'Educational Content', description: 'Informative content about your topic', themes: [] },
          { name: 'Engagement Content', description: 'Content to engage with your audience', themes: [] },
          { name: 'Promotional Content', description: 'Content to promote your products or services', themes: [] }
        ],
        toneAndStyle: 'Professional yet approachable'
      },
      recommendations: strategy.recommendations || {
        contentIdeas: [],
        postingSchedule: {
          frequency: 'daily',
          bestTimes: ['9:00 AM', '12:00 PM', '5:00 PM'],
          platforms: {}
        },
        strategic: []
      },
      generatedAt: new Date().toISOString()
    };
    
    console.log("Strategy validated and ready to return");
    
    // Return both the strategy and the raw response
    return NextResponse.json({ 
      strategy: validatedStrategy,
      rawResponse: fullResponse
    });
  } catch (error) {
    console.error('Error generating strategy:', error)
    
    // Provide a more detailed error message
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred while generating strategy';
      
    return NextResponse.json(
      { error: `Failed to generate strategy: ${errorMessage}` },
      { status: 500 }
    )
  }
} 