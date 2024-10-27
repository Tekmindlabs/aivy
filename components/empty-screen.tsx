import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { AIVY_ROLES } from '@/lib/constants/aivy'

const exampleMessages = [
  {
    heading: "Let's explore personal growth",
    message: "How can I develop better habits?"
  },
  {
    heading: "Need career guidance",
    message: "What career paths align with my interests?"
  },
  {
    heading: "Looking for support",
    message: "Help me create a personal development plan"
  },
  {
    heading: "Want to learn something new",
    message: "What skills should I focus on?"
  }
]
export function EmptyScreen({
  submitMessage,
  className
}: {
  submitMessage: (message: string) => void
  className?: string
}) {
  return (
    <div className={`mx-auto w-full transition-all ${className}`}>
      <div className="bg-background p-2">
        <div className="mt-4 flex flex-col items-start space-y-2 mb-4">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              name={message.message}
              onClick={async () => {
                submitMessage(message.message)
              }}
            >
              <ArrowRight size={16} className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
