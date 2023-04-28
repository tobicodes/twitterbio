import mongoose from "mongoose";
// const mongoose = require("mongoose");
// const {Schema, Document} = mongoose

// console.log

// import mongoose, { Schema, Document } from "mongoose";
require("dotenv").config();

const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const uri = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@cluster18209.md0ydbn.mongodb.net/?retryWrites=true&w=majority`;

console.log(uri);

// TODO separate prod and dev db

mongoose.connect(uri, <mongoose.ConnectOptions>{
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to MongoDB!");
});

export interface UserInterface {
  email: string;
  issuer: string;
  publicAddress: string;
  firstName: string;
  createdAt: Date;
}

const userSchema = new mongoose.Schema<UserInterface>({
  email: { type: String, required: true, unique: true },
  issuer: { type: String, required: true },
  publicAddress: { type: String, required: true },
  firstName: { type: String, required: true },
  createdAt: { type: Date, required: true },
});

// const User = mongoose.model<UserInterface & mongoose.Document>(
//   "User",
//   userSchema
// );

const User =
  mongoose.models.User || mongoose.model<UserInterface>("User", userSchema);

export async function createUser({
  email,
  issuer,
  publicAddress,
  firstName,
  createdAt,
}: UserInterface): Promise<{ success: boolean }> {
  try {
    const user = new User({
      email,
      issuer,
      publicAddress,
      firstName,
      createdAt,
    });
    await user.save();
    console.log(`Created user: ${user}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}

export async function deleteUser(email: string): Promise<{ success: boolean }> {
  try {
    const result = await User.deleteOne({ email });
    console.log(`Deleted ${result.deletedCount} user(s)`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}

// async function deleteUser(id: string): Promise<{ success: boolean }> {
//   try {
//     const result = await User.deleteOne({ _id: id });
//     console.log(`Deleted ${result.deletedCount} user(s)`);
//     return { success: true };
//   } catch (error) {
//     console.error(error);
//     return { success: false };
//   }
// }

// write a function to delete a user based on email address
//  async function deleteUser(email: string): Promise<{ success: boolean }> {
//    try {

//    } catch (error) {
//       console.error(error);
//       return { success: false };
//    }

// createUser({
//   email: "johndoe@example.com",
//   issuer: "0x1234567890abcdef",
//   publicAddress: "0x1234567890abcdef",
//   firstName: "John",
//   createdAt: new Date(),
// }).then((result) => console.log(result));

// // Example usage:
// createUser({
//   email: "johndoe@example.com",
//   issuer: "0x1234567890abcdef",
//   publicAddress: "0x1234567890abcdef",
//   firstName: "John",
//   createdAt: new Date(),
// }).then((result) => console.log(result));

// deleteUser("abc123xyz").then((result) => console.log(result));
