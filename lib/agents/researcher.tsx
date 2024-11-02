import { createStreamableUI, createStreamableValue } from 'ai/rsc'
import { CoreMessage, generateText, streamText } from 'ai'
import { getTools } from './tools'
import { getModel } from '../utils'
import { AnswerSection } from '@/components/answer-section'

const SYSTEM_PROMPT = `As an expert AI tutor, you excel at explaining complex topics clearly and providing educational guidance.
For each student query:
1. Break down complex concepts into digestible parts
2. Use search results to provide accurate, up-to-date information
3. Include relevant examples and analogies
4. Always verify information from multiple sources
5. Include relevant images or diagrams when helpful
6. Encourage critical thinking through thoughtful explanations
7. Always maintain an educational tone and check for understanding.`

export async function researcher(
  uiStream: ReturnType<typeof createStreamableUI>,
  messages: CoreMessage[]
) {
  try {
    let fullResponse = ''
    const streamableText = createStreamableValue<string>()
    let toolResults: any[] = []

    const currentDate = new Date().toLocaleString()
    const result = await streamText({
      model: getModel(),
      system: `${SYSTEM_PROMPT} Current date and time: ${currentDate}`,
      messages: messages,
      tools: getTools({
        uiStream,
        fullResponse
      }),
      maxSteps: 5,
      onStepFinish: async event => {
        if (event.stepType === 'initial') {
          if (event.toolCalls && event.toolCalls.length > 0) {
            uiStream.append(<AnswerSection result={streamableText.value} />)
            toolResults = event.toolResults
          } else {
            uiStream.update(<AnswerSection result={streamableText.value} />)
          }
        }
      }
    })

    for await (const delta of result.fullStream) {
      if (delta.type === 'text-delta' && delta.textDelta) {
        fullResponse += delta.textDelta
        streamableText.update(fullResponse)
      }
    }

    streamableText.done(fullResponse)

    return { text: fullResponse, toolResults }
  } catch (error) {
    console.error('Error in researcher:', error)
    return {
      text: 'An error has occurred. Please try again.',
      toolResults: []
    }
  }
}

export async function researcherWithOllama(
  uiStream: ReturnType<typeof createStreamableUI>,
  messages: CoreMessage[]
) {
  try {
    const fullResponse = ''
    const streamableText = createStreamableValue<string>()
    let toolResults: any[] = []

    const currentDate = new Date().toLocaleString()
    const result = await generateText({
      model: getModel(),
      system: `${SYSTEM_PROMPT} Current date and time: ${currentDate}`,
      messages: messages,
      tools: getTools({
        uiStream,
        fullResponse
      }),
      maxSteps: 5,
      onStepFinish: async event => {
        if (event.stepType === 'initial') {
          if (event.toolCalls) {
            uiStream.append(<AnswerSection result={streamableText.value} />)
            toolResults = event.toolResults
          } else {
            uiStream.update(<AnswerSection result={streamableText.value} />)
          }
        }
      }
    })

    streamableText.done(result.text)

    return { text: result.text, toolResults }
  } catch (error) {
    console.error('Error in researcherWithOllama:', error)
    return {
      text: 'An error has occurred. Please try again.',
      toolResults: []
    }
  }
}
