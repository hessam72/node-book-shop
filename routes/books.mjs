import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import books from "../db/books.js";

const router = express.Router();

// Get a list of 50  books
router.get("/", async (req, res) => {
  let collection = await db.collection("comments");
  let results = await collection.find({}).limit(50).toArray();

  res.send(results).status(200);
});

// Fetches the latest  books
router.get("/latest", async (req, res) => {
  let collection = await db.collection("books");
  let results = await collection
    .aggregate([
      { $project: { author: 1, title: 1, tags: 1, date: 1 } },
      { $sort: { date: -1 } },
      { $limit: 3 },
    ])
    .toArray();
  res.send(results).status(200);
});

// insert all of local json books data to mongodb 
// also can be used as reseting stored data
router.get("/insert_all", async (req, res) => {
  let collection = await db.collection("books");

  books.forEach((book) => {
    book.created_at = new Date();
  });

  let result = await collection.insertMany(books);
  res.send(result).status(204);
});

// Get a single post

router.get("/:id", async (req, res) => {
  let collection = await db.collection("books");
  let query = { _id: ObjectId(req.params.id) };
  let result = await collection.findOne(query);

  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});

// Add a new document to the collection
router.post("/", async (req, res) => {
  let collection = await db.collection("books");
  let newDocument = req.body;
  newDocument.date = new Date();
  let result = await collection.insertOne(newDocument);
  res.send(result).status(204);
});

// Update the book with a new comment
router.patch("/review/:id", async (req, res) => {
  const query = { _id: ObjectId(req.params.id) };
  const updates = {
    $push: { comments: req.body },
  };

  let collection = await db.collection("books");
  let result = await collection.updateOne(query, updates);

  res.send(result).status(200);
});

// Delete an entry
router.delete("/:id", async (req, res) => {
  const query = { _id: ObjectId(req.params.id) };

  const collection = db.collection("books");
  let result = await collection.deleteOne(query);

  res.send(result).status(200);
});

export default router;
