import { tool } from 'ai'
import { createStreamableValue } from 'ai/rsc'
import Exa from 'exa-js'
import { searchSchema } from '@/lib/schema/search'
import { SearchSection } from '@/components/search-section'
import { ToolProps } from '.'
import { MemoryService } from '@/lib/services/memory'
import { sanitizeUrl } from '@/lib/utils'
import {
  SearchResultImage,
  SearchResults,
  SearchResultItem,
  SearXNGResponse,
  SearXNGResult
} from '@/lib/types'

const memoryService = new MemoryService()


export const searchTool = ({ uiStream, fullResponse }: ToolProps) =>
  tool({
    description: 'Search the web and personal memories for information',
    parameters: searchSchema,
    execute: async ({
      query,
      max_results,
      search_depth,
      include_domains,
      exclude_domains,
      user_id = 'anonymous'
    }) => {
      let hasError = false
      const streamResults = createStreamableValue<string>()
      
      uiStream.append(
        <SearchSection
          result={streamResults.value}
          includeDomains={include_domains}
        />
      )

      try {
        // Search memories first
        const memories = await memoryService.searchMemories(query, user_id)

        // Perform web search
        const webResults = await performWebSearch(
          query,
          max_results,
          search_depth,
          include_domains,
          exclude_domains
        )

        // Combine results
        const combinedResults: SearchResults = {
          ...webResults,
          memories,
          number_of_results: (webResults.number_of_results || 0) + memories.length
        }

        streamResults.done(JSON.stringify(combinedResults))
        return combinedResults

      } catch (error) {
        console.error('Search error:', error)
        hasError = true
        const emptyResults: SearchResults = {
          results: [],
          query,
          images: [],
          number_of_results: 0,
          memories: []
        }

        fullResponse = `An error occurred while searching for "${query}".`
        uiStream.update(null)
        streamResults.done()
        return emptyResults
      }
    }
  })

async function performWebSearch(
  query: string,
  maxResults: number = 10,
  searchDepth: string,
  includeDomains: string[] = [],
  excludeDomains: string[] = []
): Promise<SearchResults> {
  const searchAPI = (process.env.SEARCH_API as 'tavily' | 'exa' | 'searxng') || 'tavily'
  
  switch (searchAPI) {
    case 'tavily':
      return await tavilySearch(query, maxResults, searchDepth, includeDomains, excludeDomains)
    case 'exa':
      return await exaSearch(query, maxResults, searchDepth, includeDomains, excludeDomains)
    case 'searxng':
      return await searxngSearch(query, maxResults, searchDepth, includeDomains, excludeDomains)
    default:
      throw new Error(`Unsupported search API: ${searchAPI}`)
  }
}

async function tavilySearch(
  query: string,
  maxResults: number = 10,
  searchDepth: 'basic' | 'advanced' = 'basic',
  includeDomains: string[] = [],
  excludeDomains: string[] = []
): Promise<SearchResults> {
  const apiKey = process.env.TAVILY_API_KEY
  if (!apiKey) {
    throw new Error('TAVILY_API_KEY is not set in the environment variables')
  }
  const includeImageDescriptions = true
  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      max_results: Math.max(maxResults, 5),
      search_depth: searchDepth,
      include_images: true,
      include_image_descriptions: includeImageDescriptions,
      include_answers: true,
      include_domains: includeDomains,
      exclude_domains: excludeDomains
    })
  })

  if (!response.ok) {
    throw new Error(
      `Tavily API error: ${response.status} ${response.statusText}`
    )
  }

  const data = await response.json()
  const processedImages = includeImageDescriptions
    ? data.images
        .map(({ url, description }: { url: string; description: string }) => ({
          url: sanitizeUrl(url),
          description
        }))
        .filter(
          (
            image: SearchResultImage
          ): image is { url: string; description: string } =>
            typeof image === 'object' &&
            image.description !== undefined &&
            image.description !== ''
        )
    : data.images.map((url: string) => sanitizeUrl(url))

  return {
    ...data,
    images: processedImages
  }
}

async function exaSearch(
  query: string,
  maxResults: number = 10,
  _searchDepth: string,
  includeDomains: string[] = [],
  excludeDomains: string[] = []
): Promise<SearchResults> {
  const apiKey = process.env.EXA_API_KEY
  if (!apiKey) {
    throw new Error('EXA_API_KEY is not set in the environment variables')
  }

  const exa = new Exa(apiKey)
  const exaResults = await exa.searchAndContents(query, {
    highlights: true,
    numResults: maxResults,
    includeDomains,
    excludeDomains
  })

  return {
    results: exaResults.results.map((result: any) => ({
      title: result.title,
      url: result.url,
      content: result.highlight || result.text
    })),
    query,
    images: [],
    number_of_results: exaResults.results.length
  }
}

async function searxngSearch(
  query: string,
  maxResults: number = 10,
  searchDepth: string,
  includeDomains: string[] = [],
  excludeDomains: string[] = []
): Promise<SearchResults> {
  const apiUrl = process.env.SEARXNG_API_URL
  if (!apiUrl) {
    throw new Error('SEARXNG_API_URL is not set in the environment variables')
  }

  try {
    // Construct the URL with query parameters
    const url = new URL(`${apiUrl}/search`)
    url.searchParams.append('q', query)
    url.searchParams.append('format', 'json')
    url.searchParams.append('categories', 'general,images')

    // Apply search depth settings
    if (searchDepth === 'advanced') {
      url.searchParams.append('time_range', '')
      url.searchParams.append('safesearch', '0')
      url.searchParams.append('engines', 'google,bing,duckduckgo,wikipedia')
    } else {
      url.searchParams.append('time_range', 'year')
      url.searchParams.append('safesearch', '1')
      url.searchParams.append('engines', 'google,bing')
    }

    // Fetch results from SearXNG
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`SearXNG API error (${response.status}):`, errorText)
      throw new Error(
        `SearXNG API error: ${response.status} ${response.statusText} - ${errorText}`
      )
    }

    const data: SearXNGResponse = await response.json()

    // Separate general results and image results, and limit to maxResults
    const generalResults = data.results
      .filter(result => !result.img_src)
      .slice(0, maxResults)
    const imageResults = data.results
      .filter(result => result.img_src)
      .slice(0, maxResults)

    // Format the results to match the expected SearchResults structure
    return {
      results: generalResults.map(
        (result: SearXNGResult): SearchResultItem => ({
          title: result.title,
          url: result.url,
          content: result.content
        })
      ),
      query: data.query,
      images: imageResults
        .map(result => {
          const imgSrc = result.img_src || ''
          return imgSrc.startsWith('http') ? imgSrc : `${apiUrl}${imgSrc}`
        })
        .filter(Boolean),
      number_of_results: data.number_of_results
    }
  } catch (error) {
    console.error('SearXNG API error:', error)
    throw error
  }
}
