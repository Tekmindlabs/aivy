import { Memory } from 'mem0ai';

export class MemoryService {
  private memory: Memory;
  
  constructor() {
    // Enhanced initialization with configuration
    this.memory = new Memory({
      vectorDb: {
        provider: "pinecone",
        dimensions: 1536
      },
      textSplitter: {
        chunkSize: 1000,
        overlap: 200
      }
    });
  }

  async addMemory(content: string, userId: string, metadata?: any) {
    try {
      return await this.memory.add(content, {
        user_id: userId,
        metadata: {
          ...metadata,
          timestamp: Date.now()
        }
      });
    } catch (error) {
      console.error('Failed to add memory:', error);
      throw error;
    }
  }

  async searchMemories(query: string, userId: string) {
    try {
      return await this.memory.search(query, {
        user_id: userId,
        limit: 5,
        minRelevanceScore: 0.7
      });
    } catch (error) {
      console.error('Failed to search memories:', error);
      throw error;
    }
  }

  async getAllMemories(userId: string) {
    try {
      return await this.memory.get_all({
        user_id: userId,
        limit: 100 // Added limit for pagination
      });
    } catch (error) {
      console.error('Failed to get memories:', error);
      throw error;
    }
  }

  async deleteAllMemories(userId: string) {
    try {
      return await this.memory.delete_all({
        user_id: userId
      });
    } catch (error) {
      console.error('Failed to delete memories:', error);
      throw error;
    }
  }

  // New method for pruning old memories
  async pruneMemories(userId: string, olderThan: number) {
    try {
      return await this.memory.prune({
        user_id: userId,
        olderThan
      });
    } catch (error) {
      console.error('Failed to prune memories:', error);
      throw error;
    }
  }

  // New method for updating existing memories
  async updateMemory(memoryId: string, content: string, userId: string, metadata?: any) {
    try {
      return await this.memory.update(memoryId, {
        content,
        user_id: userId,
        metadata: {
          ...metadata,
          updatedAt: Date.now()
        }
      });
    } catch (error) {
      console.error('Failed to update memory:', error);
      throw error;
    }
  }
}
