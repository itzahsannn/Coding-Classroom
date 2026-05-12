import { createClient } from '@supabase/supabase-js'
import { config } from '../config/env.js'

const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey)

// ─── Shared: call Ollama Cloud (OpenAI-compatible) ────────────────────────────

async function callOllamaCloud(messages) {
  if (!config.ollamaApiKey || config.ollamaApiKey === 'your_ollama_api_key_here') {
    throw Object.assign(
      new Error('OLLAMA_API_KEY is not configured. Add it to your .env file.'),
      { statusCode: 503, code: 'LLM_NOT_CONFIGURED' }
    )
  }

  const response = await fetch(config.ollamaApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.ollamaApiKey}`,
    },
    body: JSON.stringify({
      model: config.ollamaModel,
      messages,
      stream: false,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw Object.assign(
      new Error(`Ollama Cloud API error (${response.status}): ${text}`),
      { statusCode: 502, code: 'LLM_ERROR' }
    )
  }

  const result = await response.json()
  return result.choices?.[0]?.message?.content || ''
}

// ─── Parse structured JSON from LLM response ─────────────────────────────────

function parseAnalysisResponse(raw) {
  // Strip markdown code fences if present
  const cleaned = raw.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim()

  try {
    const parsed = JSON.parse(cleaned)
    return {
      score: Math.min(100, Math.max(0, Number(parsed.score) || 0)),
      errors: Array.isArray(parsed.errors) ? parsed.errors.slice(0, 10) : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 10) : [],
      summary: String(parsed.summary || 'No summary provided.'),
    }
  } catch {
    // Fallback: return the raw text as summary with a neutral score
    return {
      score: 50,
      errors: [],
      suggestions: [],
      summary: raw.trim() || 'Unable to parse AI response.',
    }
  }
}

// ─── Analyse code directly (no submission needed) ─────────────────────────────

export async function analyzeCodeDirect(code, language) {
  const prompt = `You are an expert ${language} code reviewer. Analyse the following ${language} code and respond with ONLY a JSON object (no markdown, no explanation outside the JSON).

Code to analyse:
\`\`\`${language}
${code}
\`\`\`

Respond with this exact JSON structure:
{
  "score": <integer 0-100 representing overall code quality>,
  "errors": [<string describing each bug, error, or problem found — empty array if none>],
  "suggestions": [<string describing each improvement suggestion — empty array if none>],
  "summary": "<2-3 sentence overall assessment of the code>"
}

Scoring guide:
- 90-100: Excellent, clean, correct, well-structured
- 70-89: Good with minor issues
- 50-69: Functional but has notable problems
- 30-49: Multiple significant issues
- 0-29: Major bugs or fundamentally broken

Return ONLY the JSON object.`

  const raw = await callOllamaCloud([{ role: 'user', content: prompt }])
  return parseAnalysisResponse(raw)
}

// ─── Evaluate a saved submission (legacy route, kept for compat) ───────────────

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

  // Try Ollama Cloud first, fall back to OpenRouter
  let feedback
  if (config.ollamaApiKey && config.ollamaApiKey !== 'your_ollama_api_key_here') {
    const analysis = await analyzeCodeDirect(submission.code, submission.filename?.endsWith('.py') ? 'python' : 'javascript')
    const errorsText = analysis.errors.length
      ? `\n\nErrors found:\n${analysis.errors.map((e, i) => `${i + 1}. ${e}`).join('\n')}`
      : ''
    const suggestionsText = analysis.suggestions.length
      ? `\n\nSuggestions:\n${analysis.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}`
      : ''
    feedback = `Score: ${analysis.score}/100\n\n${analysis.summary}${errorsText}${suggestionsText}`
  } else if (config.llmApiKey) {
    // OpenRouter fallback
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
      throw Object.assign(new Error(`LLM API error: ${text}`), { statusCode: 502, code: 'LLM_ERROR' })
    }

    const result = await response.json()
    feedback = result.choices?.[0]?.message?.content || 'No feedback generated.'
  } else {
    feedback = 'AI evaluation is not configured. Please set OLLAMA_API_KEY in your .env file.'
  }

  // Save feedback to Supabase
  await supabase.from('submissions').update({ llm_feedback: feedback }).eq('id', submissionId)

  return { feedback }
}

// ─── Feature 1: Explain a runtime error ───────────────────────────────────────

export async function explainError(code, language, errorText) {
  const prompt = `You are a helpful coding tutor. A student's ${language} code produced this error:

Error:
${errorText}

Code:
\`\`\`${language}
${code}
\`\`\`

In 3–5 sentences:
1. Explain what the error means in plain English (no jargon).
2. Point to the exact line or cause.
3. Show the fix.

Be concise and encouraging. Do not use markdown headers.`

  return callOllamaCloud([{ role: 'user', content: prompt }])
}

// ─── Feature 2: AI Tutor chat (stateful messages) ─────────────────────────────

export async function chatWithTutor(messages, code, language) {
  const systemMessage = {
    role: 'system',
    content: `You are a friendly, expert ${language} coding tutor inside a coding classroom app. 
The student's current code is shown below. Answer their questions about it clearly and concisely.
Never write their solution for them — guide them to find it. Keep replies under 150 words.

Current code:
\`\`\`${language}
${code}
\`\`\``
  }
  return callOllamaCloud([systemMessage, ...messages])
}

// ─── Feature 3: Progressive hints for an assignment ───────────────────────────

export async function getHint(code, language, hintLevel, assignmentDescription) {
  const hintStyle = [
    'Give a very vague conceptual nudge. Do NOT mention the solution or specific lines.',
    'Point to the general area of the problem (e.g., "look at your loop condition"). Still no solution.',
    'Give a near-solution hint — explain exactly what to change but let the student write the code.',
  ][Math.min(hintLevel, 2)]

  const prompt = `You are a coding tutor. A student is working on this assignment:
"${assignmentDescription}"

Their current ${language} code:
\`\`\`${language}
${code}
\`\`\`

Hint level ${hintLevel + 1}/3: ${hintStyle}

Reply in 2–3 sentences maximum. Be encouraging.`

  return callOllamaCloud([{ role: 'user', content: prompt }])
}

// ─── Feature 4: AI auto-grade a submission ────────────────────────────────────

export async function gradeSubmission(submissionId) {
  const { data: submission, error } = await supabase
    .from('submissions')
    .select('*, assignments(title, description, points)')
    .eq('id', submissionId)
    .single()

  if (error || !submission) {
    throw Object.assign(new Error('Submission not found.'), { statusCode: 404, code: 'NOT_FOUND' })
  }

  const maxPoints = submission.assignments?.points || 100
  const prompt = `You are grading a student's code submission. Respond ONLY with a JSON object.

Assignment: ${submission.assignments?.title || 'Unknown'}
Description: ${submission.assignments?.description || 'No description.'}
Max points: ${maxPoints}

Student's code:
\`\`\`
${submission.code}
\`\`\`

Respond with ONLY this JSON:
{
  "suggestedScore": <integer 0-${maxPoints}>,
  "rationale": "<2-3 sentence explanation of the score>",
  "strengths": [<1-3 short strings>],
  "improvements": [<1-3 short strings>]
}`

  const raw = await callOllamaCloud([{ role: 'user', content: prompt }])
  const cleaned = raw.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim()

  try {
    const parsed = JSON.parse(cleaned)
    const result = {
      suggestedScore: Math.min(maxPoints, Math.max(0, Number(parsed.suggestedScore) || 0)),
      rationale: String(parsed.rationale || ''),
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
    }
    // Save the AI grade rationale as llm_feedback
    await supabase.from('submissions').update({ llm_feedback: result.rationale }).eq('id', submissionId)
    return result
  } catch {
    return { suggestedScore: 0, rationale: raw.trim(), strengths: [], improvements: [] }
  }
}
