'use client'

import { SearchResults } from './search-results'
import { DefaultSkeleton } from './default-skeleton'
import { SearchResultsImageSection } from './search-results-image'
import { Section } from './section'
import { ToolBadge } from './tool-badge'
import type { SearchResults as TypeSearchResults, Memory } from '@/lib/types'
import { StreamableValue, useStreamableValue } from 'ai/rsc'
import { Card, CardContent } from './ui/card'

export type SearchSectionProps = {
  result?: StreamableValue<string>
  includeDomains?: string[]
}

function MemoryResults({ memories }: { memories: Memory[] }) {
  return (
    <div className="flex flex-wrap">
      {memories.map((memory, index) => (
        <div className="w-full md:w-1/2 p-1" key={memory.id || index}>
          <Card className="flex-1 h-full">
            <CardContent className="p-4">
              <p className="text-sm">{memory.content}</p>
              {memory.metadata && (
                <div className="mt-2 text-xs text-muted-foreground">
                  From chat: {memory.metadata.chatId}
                  {memory.metadata.timestamp && (
                    <span className="ml-2">
                      {new Date(memory.metadata.timestamp).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}
              {memory.score && (
                <div className="mt-1 text-xs text-muted-foreground">
                  Relevance: {Math.round(memory.score * 100)}%
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  )
}

export function SearchSection({ result, includeDomains }: SearchSectionProps) {
  const [data, error, pending] = useStreamableValue(result)
  const searchResults: TypeSearchResults = data ? JSON.parse(data) : undefined
  const includeDomainsString = includeDomains
    ? ` [${includeDomains.join(', ')}]`
    : ''

  return (
    <div>
      {!pending && data ? (
        <>
          <Section size="sm" className="pt-2 pb-0">
            <ToolBadge tool="search">{`${searchResults.query}${includeDomainsString}`}</ToolBadge>
          </Section>

          {searchResults.memories && searchResults.memories.length > 0 && (
            <Section title="Personal Memories">
              <MemoryResults memories={searchResults.memories} />
            </Section>
          )}

          {searchResults.images && searchResults.images.length > 0 && (
            <Section title="Images">
              <SearchResultsImageSection
                images={searchResults.images}
                query={searchResults.query}
              />
            </Section>
          )}

          {searchResults.results && searchResults.results.length > 0 && (
            <Section title="Sources">
              <SearchResults results={searchResults.results} />
            </Section>
          )}

          {(!searchResults.memories?.length && 
            !searchResults.images?.length && 
            !searchResults.results?.length) && (
            <div className="text-center text-muted-foreground py-4">
              No results found
            </div>
          )}
        </>
      ) : (
        <DefaultSkeleton />
      )}
    </div>
  )
}