'use client'

// ================ Imports ================
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { AI, UIState } from '../app/actions'
import { useUIState, useActions, useAIState } from 'ai/rsc'
import { cn } from '../lib/utils'
import { UserMessage } from './user-message'
import { Button } from './ui/button'
import { ArrowRight, Plus } from 'lucide-react'
import { EmptyScreen } from './empty-screen'
import Textarea from 'react-textarea-autosize'
import { generateId } from 'ai'
import { useAppState } from '../lib/utils/app-state'
import { motion } from 'framer-motion'
import { useAuth } from './auth/auth-provider'

// ================ Types & Constants ================
interface ChatPanelProps {
  messages: UIState
  query?: string
}

const roles = ['Companion', 'Coach', 'advisor', 'Supporter', 'Assistant', 'Guide']
const colors = ['text-blue-500', 'text-green-500', 'text-purple-500', 'text-pink-500', 'text-yellow-500', 'text-red-500']

// ================ Logic Section ================
function useTextMorph(items: string[], interval: number = 2000) {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % items.length)
    }, interval)
    return () => clearInterval(timer)
  }, [items, interval])
  return items[index]
}

function useChatLogic() {
  const [input, setInput] = useState('')
  const [showEmptyScreen, setShowEmptyScreen] = useState(false)
  const [, setMessages] = useUIState<typeof AI>()
  const [aiMessage, setAIMessage] = useAIState<typeof AI>()
  const { isGenerating, setIsGenerating } = useAppState()
  const { submit } = useActions()
  const router = useRouter()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const isFirstRender = useRef(true)
  const { user } = useAuth()
  const [isComposing, setIsComposing] = useState(false)
  const [enterDisabled, setEnterDisabled] = useState(false)

  const morphingRole = useTextMorph(roles)
  const morphingColor = useTextMorph(colors)

  const handleCompositionStart = () => setIsComposing(true)
  const handleCompositionEnd = () => {
    setIsComposing(false)
    setEnterDisabled(true)
    setTimeout(() => {
      setEnterDisabled(false)
    }, 300)
  }

  async function handleQuerySubmit(query: string, formData?: FormData) {
    setInput(query)
    setIsGenerating(true)
    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: generateId(),
        component: <UserMessage message={query} userId={user?.id} />
      }
    ])
    const data = formData || new FormData()
    if (!formData) {
      data.append('input', query)
    }
    const responseMessage = await submit(data)
    setMessages(currentMessages => [...currentMessages, responseMessage])
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await handleQuerySubmit(input, formData)
  }

  const handleClear = () => {
    setIsGenerating(false)
    setMessages([])
    setAIMessage({ messages: [], chatId: '' })
    setInput('')
    router.push('/')
  }

  useEffect(() => {
    const lastMessage = aiMessage.messages.slice(-1)[0]
    if (lastMessage?.type === 'followup' || lastMessage?.type === 'inquiry') {
      setIsGenerating(false)
    }
  }, [aiMessage, setIsGenerating])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return {
    input,
    setInput,
    showEmptyScreen,
    setShowEmptyScreen,
    isGenerating,
    inputRef,
    isComposing,
    enterDisabled,
    morphingRole,
    morphingColor,
    handleCompositionStart,
    handleCompositionEnd,
    handleSubmit,
    handleQuerySubmit,
    handleClear,
    isFirstRender
  }
}

// ================ UI Component ================
export function ChatPanel({ messages, query }: ChatPanelProps) {
  const {
    input,
    setInput,
    showEmptyScreen,
    setShowEmptyScreen,
    isGenerating,
    inputRef,
    isComposing,
    enterDisabled,
    morphingRole,
    morphingColor,
    handleCompositionStart,
    handleCompositionEnd,
    handleSubmit,
    handleQuerySubmit,
    handleClear,
    isFirstRender
  } = useChatLogic()

  useEffect(() => {
    if (isFirstRender.current && query && query.trim().length > 0) {
      handleQuerySubmit(query)
      isFirstRender.current = false
    }
  }, [query])

  if (messages.length > 0) {
    return (
      <div className="fixed bottom-2 md:bottom-8 left-0 right-0 flex justify-center items-center mx-auto pointer-events-none">
        <Button
          type="button"
          variant={'secondary'}
          className="rounded-full bg-secondary/80 group transition-all hover:scale-105 pointer-events-auto"
          onClick={() => handleClear()}
          disabled={isGenerating}
        >
          <span className="text-sm mr-2 group-hover:block hidden animate-in fade-in duration-300">
            New
          </span>
          <Plus size={18} className="group-hover:rotate-90 transition-all" />
        </Button>
      </div>
    )
  }

  if (query && query.trim().length > 0) {
    return null
  }

  return (
    <div className={'fixed bottom-8 left-0 right-0 top-10 mx-auto h-screen flex flex-col items-center justify-center'}>
      <div className="flex flex-col items-center justify-center mb-8">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          I&apos;m Aivy,
        </h1>
        <div className="text-2xl md:text-4xl font-semibold" aria-live="polite">
          <span className="text-gray-600 dark:text-gray-400">Your personal AI </span>
          <motion.span
            key={morphingRole}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className={`inline-block ${morphingColor}`}
          >
            {morphingRole}
          </motion.span>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="max-w-2xl w-full px-6">
        <div className="relative flex items-center w-full">
          <Textarea
            ref={inputRef}
            name="input"
            rows={1}
            maxRows={5}
            tabIndex={0}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            placeholder="What would you like to explore together?..."
            spellCheck={false}
            value={input}
            className="resize-none w-full min-h-12 rounded-fill bg-muted border border-input pl-4 pr-10 pt-3 pb-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'"
            onChange={e => {
              setInput(e.target.value)
              setShowEmptyScreen(e.target.value.length === 0)
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey && !isComposing && !enterDisabled) {
                if (input.trim().length === 0) {
                  e.preventDefault()
                  return
                }
                e.preventDefault()
                const textarea = e.target as HTMLTextAreaElement
                textarea.form?.requestSubmit()
              }
            }}
            onHeightChange={height => {
              if (!inputRef.current) return
              const initialHeight = 70
              const initialBorder = 32
              const multiple = (height - initialHeight) / 20
              const newBorder = initialBorder - 4 * multiple
              inputRef.current.style.borderRadius = Math.max(8, newBorder) + 'px'
            }}
            onFocus={() => setShowEmptyScreen(true)}
            onBlur={() => setShowEmptyScreen(false)}
          />
          <Button
            type="submit"
            size={'icon'}
            variant={'ghost'}
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            disabled={input.length === 0}
          >
            <ArrowRight size={20} />
          </Button>
        </div>
        <EmptyScreen
          submitMessage={message => {
            setInput(message)
          }}
          className={cn(showEmptyScreen ? 'visible' : 'invisible')}
        />
      </form>
    </div>
  )
}
