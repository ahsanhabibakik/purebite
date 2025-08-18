import mongoose from 'mongoose';

// Global interface for mongoose connection
declare global {
  var mongoose: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
  } | undefined;
}

if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

const MONGODB_URI = process.env.DATABASE_URL!;

if (!MONGODB_URI) {
  throw new Error('Please define the DATABASE_URL environment variable');
}

export interface DatabaseConfig {
  maxPoolSize: number;
  serverSelectionTimeoutMS: number;
  socketTimeoutMS: number;
  family: number;
  bufferCommands: boolean;
}

const defaultConfig: DatabaseConfig = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
  bufferCommands: false, // Disable mongoose buffering
};

export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private connectionPromise: Promise<mongoose.Connection> | null = null;

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  async connect(config: Partial<DatabaseConfig> = {}): Promise<mongoose.Connection> {
    if (global.mongoose.conn) {
      console.log('🟢 Using existing MongoDB connection');
      return global.mongoose.conn;
    }

    if (!global.mongoose.promise) {
      const opts = { ...defaultConfig, ...config };
      
      console.log('🟡 Connecting to MongoDB...');
      
      global.mongoose.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
        console.log('🟢 MongoDB connected successfully');
        return mongoose.connection;
      });
    }

    try {
      global.mongoose.conn = await global.mongoose.promise;
      
      // Set up connection event listeners
      this.setupEventListeners();
      
      return global.mongoose.conn;
    } catch (error) {
      global.mongoose.promise = null;
      console.error('🔴 MongoDB connection error:', error);
      throw error;
    }
  }

  private setupEventListeners(): void {
    if (!global.mongoose.conn) return;

    const connection = global.mongoose.conn;

    connection.on('connected', () => {
      console.log('🟢 Mongoose connected to MongoDB');
    });

    connection.on('error', (err) => {
      console.error('🔴 Mongoose connection error:', err);
    });

    connection.on('disconnected', () => {
      console.log('🟡 Mongoose disconnected from MongoDB');
    });

    // If the connection is disconnected when the app terminates
    process.on('SIGINT', async () => {
      try {
        await connection.close();
        console.log('🟢 Mongoose connection closed through app termination');
        process.exit(0);
      } catch (error) {
        console.error('🔴 Error closing Mongoose connection:', error);
        process.exit(1);
      }
    });
  }

  async disconnect(): Promise<void> {
    if (global.mongoose.conn) {
      await global.mongoose.conn.close();
      global.mongoose.conn = null;
      global.mongoose.promise = null;
      console.log('🟢 MongoDB disconnected');
    }
  }

  getConnectionState(): string {
    if (!global.mongoose.conn) return 'disconnected';
    
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    return states[global.mongoose.conn.readyState as keyof typeof states] || 'unknown';
  }

  async healthCheck(): Promise<{
    status: string;
    message: string;
    details: {
      readyState: number;
      host: string;
      port: number;
      name: string;
    };
  }> {
    try {
      if (!global.mongoose.conn) {
        return {
          status: 'error',
          message: 'No database connection',
          details: {
            readyState: 0,
            host: '',
            port: 0,
            name: ''
          }
        };
      }

      const connection = global.mongoose.conn;
      
      // Ping the database
      await connection.db.admin().ping();
      
      return {
        status: 'healthy',
        message: 'Database connection is healthy',
        details: {
          readyState: connection.readyState,
          host: connection.host,
          port: connection.port,
          name: connection.name
        }
      };
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: {
          readyState: global.mongoose.conn?.readyState || 0,
          host: '',
          port: 0,
          name: ''
        }
      };
    }
  }

  async getStats(): Promise<{
    collections: number;
    indexes: number;
    dataSize: number;
    storageSize: number;
    documents: number;
  }> {
    if (!global.mongoose.conn) {
      throw new Error('No database connection');
    }

    try {
      const db = global.mongoose.conn.db;
      const stats = await db.stats();
      const collections = await db.listCollections().toArray();
      
      return {
        collections: collections.length,
        indexes: stats.indexes,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        documents: stats.objects
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      throw error;
    }
  }
}

// Utility functions
export const connectDB = async (config?: Partial<DatabaseConfig>) => {
  const db = DatabaseConnection.getInstance();
  return await db.connect(config);
};

export const disconnectDB = async () => {
  const db = DatabaseConnection.getInstance();
  return await db.disconnect();
};

export const getDBHealth = async () => {
  const db = DatabaseConnection.getInstance();
  return await db.healthCheck();
};

export const getDBStats = async () => {
  const db = DatabaseConnection.getInstance();
  return await db.getStats();
};

export const getConnectionState = () => {
  const db = DatabaseConnection.getInstance();
  return db.getConnectionState();
};

// Export default instance
export default DatabaseConnection.getInstance();