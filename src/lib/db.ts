import mongoose from 'mongoose';

declare global {
  // eslint-disable-next-line no-var
  var mongooseConnection: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
  // eslint-disable-next-line no-var
  var mongodbMemoryServer: import('mongodb-memory-server').MongoMemoryServer | undefined;
}

type ConnectionStore = NonNullable<typeof global.mongooseConnection>;

async function createMemoryServer() {
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  if (!global.mongodbMemoryServer) {
    global.mongodbMemoryServer = await MongoMemoryServer.create({
      instance: {
        dbName: process.env.MONGODB_DB || 'zipmvp'
      }
    });
  }
  return global.mongodbMemoryServer.getUri();
}

export async function connectDB() {
  if (!global.mongooseConnection) {
    global.mongooseConnection = { conn: null, promise: null } satisfies ConnectionStore;
  }

  const cached = global.mongooseConnection;

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('MONGODB_URI must be defined in production environments.');
      }
      cached.promise = (async () => {
        const memoryUri = await createMemoryServer();
        return mongoose.connect(memoryUri, {
          autoCreate: true,
          dbName: process.env.MONGODB_DB || 'zipmvp'
        });
      })();
    } else {
      cached.promise = mongoose.connect(uri, {
        autoCreate: true,
        dbName: process.env.MONGODB_DB || 'zipmvp'
      });
    }
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export async function disconnectDB() {
  if (global.mongooseConnection?.conn) {
    await mongoose.disconnect();
    global.mongooseConnection.conn = null;
    global.mongooseConnection.promise = null;
  }
  if (global.mongodbMemoryServer) {
    await global.mongodbMemoryServer.stop();
    global.mongodbMemoryServer = undefined;
  }
}
