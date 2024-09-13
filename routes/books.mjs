import express from "express";
import db from "../db/conn.mjs";
import books from "../db/books.js";

const router = express.Router();



// Get the list of available books stored in mongodb
router.get("/", async (req, res) => {
  // connect to db
  let collection = await db.collection("books");
  // get all results
  let results = await collection.find({}).toArray();

  res.send(results).status(200);
});



// get book based on ISBN
router.get("/:isbn", async (req, res) => {
  let collection = await db.collection("books");
  let result = await collection.findOne({ ISBN: req.params.isbn });
  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});

// get all books by author
router.get("/author/:name", async (req, res) => {
  let collection = await db.collection("books");
  let value = req.params.name;
  // using find only look for exact match and if a book has multiple authors it won't be fetch
  // by using $regex to get all records that has an author by given name
  let result = await collection.find({ author: { $regex: value } }).toArray();
  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});

// get all books by title
router.get("/title/:title", async (req, res) => {
  let collection = await db.collection("books");
  let title = req.params.title;

  let result = await collection.find({ title: { $regex: title } }).toArray();
  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});

// get book review with ISBN as book id
router.get("/:isbn/reviews", async (req, res) => {
  let collection = await db.collection("books");
  let book = await collection.findOne({ ISBN: req.params.isbn });
  let reviews = book.reviews;
  if (!reviews) res.send("No review found").status(404);
  else res.send(reviews).status(200);
});

// search in books by title - author - ISBN
router.post("/search", async (req, res) => {
  let collection = await db.collection("books");
  const title = req.body.title;
  const author = req.body.author;
  const ISBN = req.body.isbn;

  if (!title && !author && !ISBN) {
    return res
      .status(422)
      .json({ message: "At least one field is required for the search" });
  }

  let results = await collection
    .find({ ISBN: {$regex: ISBN}, title: { $regex: title }, author: { $regex: author } })
    .toArray();

  if (!results) res.send("No Results Found").status(404);
  else res.send(results).status(200);
});






// insert all of local json books data to mongodb
// also can be used as reseting stored data
router.post("/insert_all", async (req, res) => {
  let collection = await db.collection("books");

  books.forEach((book) => {
    book.created_at = new Date();
  });

  let result = await collection.insertMany(books);
  res.send(result).status(204);
});

export default router;
