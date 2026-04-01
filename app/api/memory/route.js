import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

export async function POST(request) {
  try {
    const { userId, messages, assistantResponse } = await request.json()

    if (!userId) return Response.json({ success: false })

    // Get existing memory
    const { data: existingMemory } = await supabase
      .from('memories')
      .select('content')
      .eq('user_id', userId)
      .single()

    const currentMemory = existingMemory?.content || 'No memory yet.'

    // Ask Claude to update the memory based on the conversation
    const memoryUpdatePrompt = `You are a memory manager for an AI mentor called Mister Cash. Your job is to maintain a concise, useful memory about a user based on their conversations.

Current memory:
${currentMemory}

Latest assistant response:
${assistantResponse}

Last few messages:
${messages.slice(-6).map(m => `${m.role}: ${m.content}`).join('\n')}

Update the memory to include any new important facts about the user. Keep it concise — maximum 500 words. Include:
- Their goals and career interests
- Their background and experience level
- Skills they are developing
- Resources they have been assigned
- Any personal context they shared (budget, location, schedule, etc.)
- Progress made and tasks completed
- Things they struggled with

If the user said something like "forget about X" or "ignore X" in this conversation, remove that from the memory.
If the user said "delete X from your memory" or "remove X from memory", remove it and note it was intentionally deleted.

Return ONLY the updated memory text. No preamble, no explanation.`

    const memoryResponse = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: memoryUpdatePrompt }],
    })

    const updatedMemory = memoryResponse.content[0].text

    // Upsert memory
    await supabase
      .from('memories')
      .upsert(
        {
          user_id: userId,
          content: updatedMemory,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )

    return Response.json({ success: true })

  } catch (error) {
    console.error('Memory error:', error)
    return Response.json({ success: false, error: error.message })
  }
}
