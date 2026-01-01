 import WebSocket from "ws";
import readline from "readline";

const ws = new WebSocket("ws://localhost:8080");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function send(obj) {
  ws.send(JSON.stringify(obj));
}

ws.on("open", () => {
  console.log("connected");
  send({ type: "join", name: "A" });
  rl.setPrompt("> ");
  rl.prompt();
});

ws.on("message", (raw) => {
  const data = JSON.parse(raw.toString());
  if (data.type === "system") console.log(`[system] ${data.text}`);
  if (data.type === "msg") console.log(`[${data.from}] ${data.text}`);
  rl.prompt();
});

rl.on("line", (line) => {
  const text = line.trim();
  if (text === "/quit") {
    ws.close();
    rl.close();
    return;
  }
  send({ type: "msg", text });
  rl.prompt();
});

ws.on("close", () => {
  console.log("disconnected");
  process.exit(0);
});






/**************************************************
 * MONGOOSE – ALL IN ONE FILE
 **************************************************/

const mongoose = require("mongoose");

/* ==============================================
   1. CONNECTION
============================================== */
mongoose.connect("mongodb://127.0.0.1:27017/mydb")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));


/* ==============================================
   2. SCHEMA
============================================== */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2
  },
  age: {
    type: Number,
    min: 0,
    max: 120
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /.+\@.+\..+/
  },
  isActive: {
    type: Boolean,
    default: true
  },
  roles: [String],
}, { timestamps: true });


/* ==============================================
   3. METHODS & STATICS
============================================== */
userSchema.methods.sayHello = function () {
  return `Hello ${this.name}`;
};

userSchema.statics.findActiveUsers = function () {
  return this.find({ isActive: true });
};


/* ==============================================
   4. MIDDLEWARE (HOOKS)
============================================== */
userSchema.pre("save", function (next) {
  console.log("Before save");
  next();
});

userSchema.post("save", function () {
  console.log("After save");
});


/* ==============================================
   5. MODEL
============================================== */
const User = mongoose.model("User", userSchema);


/* ==============================================
   6. CREATE
============================================== */
async function createExamples() {
  await User.create({
    name: "Yaakov",
    age: 25,
    email: "yaakov@test.com",
    roles: ["admin"]
  });

  await User.insertMany([
    { name: "Dan", age: 30, email: "dan@test.com" },
    { name: "Noam", age: 22, email: "noam@test.com" }
  ]);
}


/* ==============================================
   7. READ
============================================== */
async function readExamples() {
  await User.find();
  await User.find({ age: { $gt: 18 } });
  await User.findOne({ email: "dan@test.com" });
  await User.findById("65abc123");

  await User.find().select("name age");
  await User.find().select("-email");

  await User.find().limit(5).skip(10).sort({ age: -1 });
}


/* ==============================================
   8. UPDATE
============================================== */
async function updateExamples() {
  await User.updateOne({ name: "Dan" }, { age: 31 });
  await User.updateMany({ isActive: true }, { isActive: false });

  await User.findByIdAndUpdate(
    "65abc123",
    { age: 40 },
    { new: true }
  );

  await User.findOneAndUpdate(
    { email: "noam@test.com" },
    { name: "Noam Updated" },
    { new: true }
  );
}


/* ==============================================
   9. DELETE
============================================== */
async function deleteExamples() {
  await User.deleteOne({ email: "dan@test.com" });
  await User.deleteMany({ isActive: false });
  await User.findByIdAndDelete("65abc123");
}


/* ==============================================
   10. QUERY OPERATORS
============================================== */
async function queryOperators() {
  await User.find({ age: { $gt: 20, $lt: 40 } });
  await User.find({ age: { $in: [20, 25, 30] } });
  await User.find({ $or: [{ age: 25 }, { name: "Dan" }] });
}


/* ==============================================
   11. ARRAY OPERATORS
============================================== */
async function arrayOps() {
  await User.updateOne(
    { email: "yaakov@test.com" },
    { $push: { roles: "user" } }
  );

  await User.updateOne(
    { email: "yaakov@test.com" },
    { $pull: { roles: "user" } }
  );
}


/* ==============================================
   12. COUNT
============================================== */
async function countExamples() {
  await User.countDocuments();
  await User.estimatedDocumentCount();
}


/* ==============================================
   13. TRANSACTIONS
============================================== */
async function transactionExample() {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await User.create(
      [{ name: "Temp", email: "temp@test.com" }],
      { session }
    );

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
  } finally {
    session.endSession();
  }
}


/* ==============================================
   14. INDEX
============================================== */
userSchema.index({ email: 1 });


/**************************************************
   END OF FILE
 **************************************************/






/**************************************************
 * SUPABASE – ALL IN ONE FILE
 * Database (PostgreSQL) + Auth + Storage
 **************************************************/

import { createClient } from "@supabase/supabase-js";

/* ==============================================
   1. CLIENT SETUP
============================================== */
const SUPABASE_URL = "https://YOUR_PROJECT_ID.supabase.co";
const SUPABASE_KEY = "YOUR_ANON_OR_SERVICE_ROLE_KEY";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);


/* ==============================================
   2. INSERT (CREATE)
============================================== */
async function createExamples() {
  const { data, error } = await supabase
    .from("users")
    .insert([
      { name: "Yaakov", age: 25, email: "yaakov@test.com" },
      { name: "Dan", age: 30, email: "dan@test.com" }
    ]);

  if (error) console.error(error);
}


/* ==============================================
   3. SELECT (READ)
============================================== */
async function readExamples() {
  // select all
  await supabase.from("users").select("*");

  // select specific columns
  await supabase.from("users").select("name, age");

  // filters
  await supabase.from("users").select("*").eq("age", 25);
  await supabase.from("users").select("*").gt("age", 18);
  await supabase.from("users").select("*").lt("age", 40);
  await supabase.from("users").select("*").in("age", [20, 25, 30]);

  // or
  await supabase
    .from("users")
    .select("*")
    .or("age.eq.25,name.eq.Dan");

  // limit & order
  await supabase
    .from("users")
    .select("*")
    .order("age", { ascending: false })
    .limit(5);
}


/* ==============================================
   4. UPDATE
============================================== */
async function updateExamples() {
  await supabase
    .from("users")
    .update({ age: 26 })
    .eq("email", "yaakov@test.com");

  await supabase
    .from("users")
    .update({ is_active: false })
    .gt("age", 60);
}


/* ==============================================
   5. DELETE
============================================== */
async function deleteExamples() {
  await supabase
    .from("users")
    .delete()
    .eq("email", "dan@test.com");
}


/* ==============================================
   6. COUNT
============================================== */
async function countExamples() {
  await supabase
    .from("users")
    .select("*", { count: "exact", head: true });
}


/* ==============================================
   7. JOINS (FOREIGN KEYS)
============================================== */
/*
Tables:
users(id)
posts(id, user_id)
*/

async function joinExample() {
  await supabase
    .from("posts")
    .select(`
      id,
      title,
      users (
        id,
        name,
        email
      )
    `);
}


/* ==============================================
   8. AUTH – SIGN UP
============================================== */
async function signUp() {
  const { data, error } = await supabase.auth.signUp({
    email: "user@test.com",
    password: "Password123"
  });

  if (error) console.error(error);
}


/* ==============================================
   9. AUTH – SIGN IN
============================================== */
async function signIn() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: "user@test.com",
    password: "Password123"
  });

  if (error) console.error(error);
}


/* ==============================================
   10. AUTH – USER
============================================== */
async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}


/* ==============================================
   11. AUTH – LOGOUT
============================================== */
async function signOut() {
  await supabase.auth.signOut();
}


/* ==============================================
   12. STORAGE – UPLOAD FILE
============================================== */
async function uploadFile(file) {
  await supabase.storage
    .from("avatars")
    .upload(`public/${file.name}`, file);
}


/* ==============================================
   13. STORAGE – DOWNLOAD FILE
============================================== */
async function downloadFile(path) {
  await supabase.storage
    .from("avatars")
    .download(path);
}


/* ==============================================
   14. STORAGE – GET PUBLIC URL
============================================== */
function getPublicUrl(path) {
  const { data } = supabase.storage
    .from("avatars")
    .getPublicUrl(path);

  return data.publicUrl;
}


/* ==============================================
   15. RPC (POSTGRES FUNCTION)
============================================== */
async function callFunction() {
  await supabase.rpc("get_active_users");
}


/* ==============================================
   16. REALTIME (SUBSCRIPTIONS)
============================================== */
function realtimeExample() {
  supabase
    .channel("users-channel")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "users" },
      payload => {
        console.log("Change received:", payload);
      }
    )
    .subscribe();
}


/**************************************************
   END OF FILE
 **************************************************/