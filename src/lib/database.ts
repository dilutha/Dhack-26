import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  throw new Error('Missing Supabase configuration');
}

// Create a singleton database client with connection pooling
class DatabaseClient {
  private static instance: DatabaseClient;
  private client: any;

  private constructor() {
    this.client = createClient(supabaseUrl!, serviceKey!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'X-Client-Info': 'dhack26-app',
        },
      },
    });
  }

  public static getInstance(): DatabaseClient {
    if (!DatabaseClient.instance) {
      DatabaseClient.instance = new DatabaseClient();
    }
    return DatabaseClient.instance;
  }

  public getClient() {
    return this.client;
  }

  // Health check method
  public async healthCheck(): Promise<boolean> {
    try {
      const { error } = await this.client
        .from('teams')
        .select('team_id')
        .limit(1);
      return !error;
    } catch (error) {
      return false;
    }
  }

  // Connection retry logic
  public async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries) {
          throw lastError;
        }

        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }

    throw lastError || new Error('Operation failed after retries');
  }
}

// Export singleton instance
export const db = DatabaseClient.getInstance();
export const supabaseServer = db.getClient();
