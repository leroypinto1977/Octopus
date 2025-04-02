// import mongoose from "mongoose";

// const MONGODB_URI = process.env.MONGODB_URI;

// if (!MONGODB_URI) {
//   throw new Error("Please define the MONGODB_URI environment variable");
// }

// let cached = global.mongoose;

// if (!cached) {
//   cached = global.mongoose = { conn: null, promise: null };
// }

// async function connectDB() {
//   if (cached.conn) return cached.conn;

//   if (!cached.promise) {
//     try {
//       cached.promise = mongoose
//         .connect(MONGODB_URI, {
//           useNewUrlParser: true,
//           useUnifiedTopology: true,
//           serverSelectionTimeoutMS: 5000,
//         })
//         .then((mongoose) => {
//           console.log("MongoDB connected successfully");
//           return mongoose;
//         });
//     } catch (err) {
//       console.error("MongoDB connection error:", err);
//       throw err;
//     }
//   }

//   try {
//     cached.conn = await cached.promise;
//     return cached.conn;
//   } catch (err) {
//     console.error("MongoDB connection failed:", err);
//     throw err;
//   }
// }

// export default connectDB;

import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI, {
        dbName: "startup_singham", // Explicit database name
      });
      console.log("MongoDB connected successfully");
    }
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
