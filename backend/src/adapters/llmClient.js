import { createClient } from '@supabase/supabase-js'
import { config } from '../config/env.js'

const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey)

export async function evaluateSubmission(submissionId) {
  // 1. Fetch submission + assignment
  const { data: submission, error: subErr } = await supabase
    .from('submissions')
    .select('*, assignments(title, description)')
    .eq('id', submissionId)
    .single()

  if (subErr || !submission) {
    throw Object.assign(new Error('Submission not found.'), { statusCode: 404, code: 'NOT_FOUND' })
  }

  const assignment = submission.assignments
  const prompt = `You are a programming instructor evaluating a student's code submission.

Assignment: ${assignment?.title || 'Unknown'}
Description: ${assignment?.description || 'No description provided.'}

Student's Code:
\`\`\`
${submission.code}
\`\`\`

Please evaluate the code for:
1. Correctness — does it solve the assignment?
2. Code quality — is it clean, readable, well-structured?
3. Logic errors — any bugs or edge cases missed?
4. Suggestions — what could be improved?

Provide concise, constructive feedback.`

  if (!config.llmApiKey) {
    const mockFeedback = 'AI evaluation is not configured. Please set LLM_API_KEY in your .env file.'
    await supabase.from('submissions').update({ llm_feedback: mockFeedback }).eq('id', submissionId)
    return { feedback: mockFeedback }
  }

  // 2. Call OpenRouter
  const response = await fetch(config.llmApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.llmApiKey}`,
    },
    body: JSON.stringify({
      model: config.llmModel,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw Object.assign(
      new Error(`LLM API error: ${text}`),
      { statusCode: 502, code: 'LLM_ERROR' }
    )
  }

  const result = await response.json()
  const feedback = result.choices?.[0]?.message?.content || 'No feedback generated.'

  // 3. Save feedback to Supabase
  await supabase
    .from('submissions')
    .update({ llm_feedback: feedback })
    .eq('id', submissionId)

  return { feedback }
}
