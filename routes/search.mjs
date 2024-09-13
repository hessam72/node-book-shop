import express from "express";
import db from "../db/conn.mjs";


const router = express.Router();

// search in books by title - author - ISBN
// using this endpoint user can search by all three fields or only one field if it's preferred 
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


export default router;
