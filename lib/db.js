// // lib/mongodb.js
// import { MongoClient } from "mongodb";

// const MONGODB_URI =
//   process.env.MONGODB_URI || "mongodb://localhost:27017/StartupSingham";

// let client;
// let clientPromise;

// if (!global._mongoClientPromise) {
//   client = new MongoClient(MONGODB_URI);
//   global._mongoClientPromise = client.connect();
// }
// clientPromise = global._mongoClientPromise;

// export async function connectToDatabase() {
//   const client = await clientPromise;
//   const db = client.db();

//   return { client, db };
// }

// import { MongoClient } from "mongodb";

// const MONGODB_URI =
//   process.env.MONGODB_URI || "mongodb://localhost:27017/startup_singham";
// const DB_NAME = "startup_singham";

// // Connection cache
// let cachedClient = null;
// let cachedDb = null;

// // Connect to MongoDB with connection pooling
// export async function connectToDatabase() {
//   // If we have a cached connection, use it
//   if (cachedClient && cachedDb) {
//     return { client: cachedClient, db: cachedDb };
//   }

//   // Set up a new connection
//   const client = await MongoClient.connect(MONGODB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     maxPoolSize: 10, // Maintain up to 10 socket connections
//   });

//   const db = client.db(DB_NAME);

//   // Cache the connection
//   cachedClient = client;
//   cachedDb = db;

//   return { client, db };
// }

// // Collection names
// export const COLLECTIONS = {
//   PROJECTS: "projects",
//   USERS: "users",
// };

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {
  // No deprecated options
  dbName: "startup_singham", // Ensure this matches your database name
};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env.local");
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function connectToDatabase() {
  const client = await clientPromise;
  const db = client.db();
  return { client, db };
}
