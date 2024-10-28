import { Memory } from 'mem0ai';

export class MemoryService {
  private memory: Memory;
  
  constructor() {
    this.memory = new Memory();
  }

  async addMemory(content: string, userId: string, metadata?: any) {
    try {
      return await this.memory.add(content, {
        user_id: userId,
        metadata
      });
    } catch (error) {
      console.error('Failed to add memory:', error);
      throw error;
    }
  }

  async searchMemories(query: string, userId: string) {
    try {
      return await this.memory.search(query, {
        user_id: userId
      });
    } catch (error) {
      console.error('Failed to search memories:', error);
      throw error;
    }
  }

  async getAllMemories(userId: string) {
    try {
      return await this.memory.get_all({
        user_id: userId
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
}