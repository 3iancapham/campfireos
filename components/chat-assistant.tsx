"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MessageSquare, X, Send, Loader2, MinusCircle, Maximize2, Flame } from 'lucide-react'
import { useUserData } from '@/lib/hooks/useUserData'
import { useAuth } from '@/components/providers/auth'
import { usePathname, useRouter } from 'next/navigation'

type Message = {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '🔥 Hi, I\'m Sparky! I\'m here to help spark your creativity, growth, and ideation for your social media strategy. What would you like to explore today?',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { userData } = useUserData()
  const { user } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const navigateToStrategyTab = (tab: string) => {
    if (pathname.includes('/strategy')) {
      // If already on strategy page, use client-side navigation
      const tabLinks = document.querySelectorAll('[role="tab"]')
      for (let i = 0; i < tabLinks.length; i++) {
        const link = tabLinks[i] as HTMLElement
        if (link.textContent?.toLowerCase().includes(tab.toLowerCase())) {
          link.click()
          return true
        }
      }
      return false
    } else {
      // Navigate to strategy page with tab parameter
      router.push(`/strategy?tab=${tab}`)
      return true
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Prepare context about the user's strategy
      let context = "The user is asking about their social media strategy."
      
      if (userData?.strategy) {
        const strategy = userData.strategy
        context = `The user has a social media strategy focused on ${strategy.mainTopic} with a goal of ${strategy.goal}. 
        Their target audience includes ${strategy.targetAudience.ageGroups.join(', ')} age groups 
        and they're currently using ${strategy.currentChannels.join(', ')} platforms.
        Their main challenges include: ${strategy.challenges.join(', ')}.`
      }

      // Check if we should navigate to a specific tab
      let shouldNavigate = false
      let tabToNavigate = ''
      
      const lowerMessage = userMessage.content.toLowerCase()
      if (lowerMessage.includes('content') && !lowerMessage.includes('plan')) {
        tabToNavigate = 'content'
        shouldNavigate = true
      } else if (lowerMessage.includes('audience')) {
        tabToNavigate = 'audience'
        shouldNavigate = true
      } else if (lowerMessage.includes('platform')) {
        tabToNavigate = 'platforms'
        shouldNavigate = true
      } else if (lowerMessage.includes('recommend')) {
        tabToNavigate = 'recommendations'
        shouldNavigate = true
      } else if (lowerMessage.includes('plan')) {
        tabToNavigate = 'plan'
        shouldNavigate = true
      }

      // In a real implementation, you would call the Anthropic API here
      // For now, we'll simulate a response with a timeout
      setTimeout(() => {
        let responseContent = generateResponse(userMessage.content, context)
        
        // Add navigation suggestion if appropriate
        if (shouldNavigate && userData?.strategy) {
          const didNavigate = navigateToStrategyTab(tabToNavigate)
          if (didNavigate) {
            responseContent += `\n\nI've opened the ${tabToNavigate} tab for you to explore more details.`
          }
        }
        
        const assistantMessage: Message = {
          role: 'assistant',
          content: responseContent,
          timestamp: new Date()
        }
        
        setMessages(prev => [...prev, assistantMessage])
        setIsLoading(false)
      }, 1500)
      
    } catch (error) {
      console.error('Error sending message:', error)
      setIsLoading(false)
      
      // Add error message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again later.',
        timestamp: new Date()
      }])
    }
  }

  // Simple response generator for demo purposes
  // In production, this would be replaced with an actual API call to Anthropic
  const generateResponse = (message: string, context: string): string => {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "🔥 Hello! I'm Sparky, your creative assistant. I'm here to spark ideas and help you build an amazing social media presence. What aspect of your strategy would you like to ignite today?"
    }
    
    if (lowerMessage.includes('who are you') || lowerMessage.includes('your name')) {
      return "🔥 I'm Sparky! I'm your AI-powered creative companion, designed to spark fresh ideas and help ignite your social media strategy. I can help with content ideas, audience targeting, platform selection, and more!"
    }
    
    if (lowerMessage.includes('strategy')) {
      if (userData?.strategy) {
        return `Your social media strategy is focused on ${userData.strategy.mainTopic} with a goal of ${userData.strategy.goal}. I'd love to help you spark new ideas! Would you like to explore content creation, audience engagement, or platform optimization?`
      } else {
        return "A great social media strategy is like kindling for your brand's fire! Let's start by identifying your main goals - are you looking to build awareness, drive engagement, or convert followers into customers?"
      }
    }
    
    if (lowerMessage.includes('content')) {
      if (lowerMessage.includes('idea') || lowerMessage.includes('suggestion')) {
        return `Let's spark some content ideas for your social media! 🔥\n\n1. Behind-the-scenes: Show your creative process\n2. Success stories: Highlight customer transformations\n3. Educational: Teach something about ${userData?.strategy?.mainTopic || 'your industry'}\n4. Trending topics: Put your unique spin on what's hot\n5. Interactive: Create polls or questions to engage your audience`
      }
      
      return "To ignite engagement with your content, try the 4-1-1 rule: for every 6 posts, share 4 educational/entertaining posts, 1 soft promotion, and 1 direct promotion. This balanced approach keeps your audience engaged while still promoting your offerings. What type of content sparks the most joy for you to create?"
    }
    
    if (lowerMessage.includes('creative') || lowerMessage.includes('creativity') || lowerMessage.includes('idea')) {
      return "Need to spark your creativity? Try these idea starters:\n\n1. What's a common misconception about your industry?\n2. What's the story behind why you started your business?\n3. What's a day-in-the-life look like for you?\n4. What's a before-and-after transformation you can showcase?\n5. What's a question your audience frequently asks?\n\nWhich of these sparks your interest?"
    }
    
    if (lowerMessage.includes('stuck') || lowerMessage.includes('block') || lowerMessage.includes('inspiration')) {
      return "Feeling stuck? Let's reignite that creative spark! 🔥\n\n1. Browse accounts similar to yours for inspiration (but don't copy!)\n2. Look outside your industry for fresh perspectives\n3. Ask your audience what they want to see\n4. Try a new content format you haven't used before\n5. Share your personal journey or challenges\n\nSometimes the best content comes from authentic moments!"
    }
    
    if (lowerMessage.includes('audience')) {
      if (userData?.strategy?.targetAudience) {
        const audience = userData.strategy.targetAudience;
        return `Your target audience includes ${audience.ageGroups.join(', ')} age groups with interests in ${audience.interests.join(', ')}. To better engage them, create content that addresses their specific pain points and interests. Would you like tips on creating more targeted content?`
      }
      
      return "Understanding your target audience is crucial. Start by creating detailed buyer personas that include demographics, interests, pain points, and goals. This will help you create content that resonates with them specifically."
    }
    
    if (lowerMessage.includes('platform') || lowerMessage.includes('channel')) {
      if (userData?.strategy?.currentChannels && userData.strategy.currentChannels.length > 0) {
        return `You're currently focusing on ${userData.strategy.currentChannels.join(', ')}. Each platform has unique strengths: Instagram for visual content, Twitter for quick updates, LinkedIn for professional content, and TikTok for short-form videos. Would you like specific tips for any of these platforms?`
      }
      
      return "When choosing social media platforms, focus on where your audience spends their time rather than trying to be everywhere. For most businesses, it's better to excel on 2-3 platforms than to spread yourself too thin across many."
    }
    
    if (lowerMessage.includes('post') && lowerMessage.includes('often') || lowerMessage.includes('frequency')) {
      return "For posting frequency, quality always trumps quantity. A good starting point is:\n- Instagram: 3-5 times per week\n- Twitter: 1-2 times daily\n- Facebook: 3-5 times per week\n- LinkedIn: 2-3 times per week\n- TikTok: 1-3 times daily\n\nAdjust based on your capacity and audience engagement."
    }
    
    if (lowerMessage.includes('hashtag')) {
      return "For effective hashtag strategy:\n1. Use a mix of popular, niche, and branded hashtags\n2. For Instagram, use 5-10 relevant hashtags\n3. For Twitter, limit to 1-2 hashtags\n4. Research competitors to find industry-specific hashtags\n5. Create a branded hashtag for your business\n\nWould you like help creating a hashtag list for your niche?"
    }
    
    if (lowerMessage.includes('engagement') || lowerMessage.includes('comment') || lowerMessage.includes('like')) {
      return "To boost engagement:\n1. Ask questions in your captions\n2. Respond to all comments promptly\n3. Create interactive content like polls and quizzes\n4. Share user-generated content\n5. Post when your audience is most active\n\nConsistency in engagement is key to building a loyal community."
    }
    
    return "That's a great question about your social media strategy. To give you the most helpful advice, could you specify which aspect you'd like to focus on? For example: content ideas, audience engagement, platform selection, posting frequency, or analytics?"
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Button */}
      {!isOpen && (
        <Button 
          onClick={() => setIsOpen(true)} 
          className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-br from-orange-400 to-red-600 hover:from-orange-500 hover:to-red-700 text-white p-0 flex items-center justify-center"
          aria-label="Open Sparky Assistant"
        >
          <Flame className="h-12 w-12 animate-pulse" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className={`w-80 sm:w-96 shadow-xl transition-all duration-200 border-orange-200 ${isMinimized ? 'h-16' : 'h-[500px]'}`}>
          <CardHeader className="p-3 border-b border-orange-200 flex flex-row items-center justify-between bg-gradient-to-r from-orange-100 to-amber-100">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Sparky
            </CardTitle>
            <div className="flex items-center gap-1">
              {isMinimized ? (
                <Button variant="ghost" size="icon" onClick={() => setIsMinimized(false)} className="h-7 w-7 hover:bg-orange-100">
                  <Maximize2 className="h-4 w-4" />
                </Button>
              ) : (
                <Button variant="ghost" size="icon" onClick={() => setIsMinimized(true)} className="h-7 w-7 hover:bg-orange-100">
                  <MinusCircle className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-7 w-7 hover:bg-orange-100">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          {!isMinimized && (
            <>
              <CardContent className="p-3 overflow-y-auto h-[380px] flex flex-col gap-3 bg-gradient-to-b from-amber-50 to-white">
                {messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === 'user' 
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-sm' 
                          : 'bg-white border border-orange-100 text-gray-800 shadow-sm'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-orange-100 rounded-lg p-3 flex items-center gap-2 shadow-sm">
                      <Flame className="h-5 w-5 text-orange-500 animate-pulse" />
                      <p className="text-sm text-gray-500">Sparking ideas...</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </CardContent>
              
              <CardFooter className="p-3 border-t border-orange-200 bg-gradient-to-r from-orange-100 to-amber-100">
                <div className="flex w-full items-center gap-2">
                  <Input
                    placeholder="Ask Sparky about your strategy..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 border-orange-200 focus-visible:ring-orange-400"
                    disabled={isLoading}
                  />
                  <Button 
                    size="icon" 
                    onClick={handleSendMessage} 
                    disabled={!inputValue.trim() || isLoading}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </>
          )}
        </Card>
      )}
    </div>
  )
} 