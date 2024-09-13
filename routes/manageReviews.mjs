import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const router = express.Router();
let AuthUsername = null; // current authenticated user's username
// validate token
const verifyUser = (token) => {
  let result = null;
  try {
    jwt.verify(token, "access", function (err, decoded) {
      result = decoded.username;
    });
    AuthUsername = result;
    return result;
  } catch (err) {
    return false;
  }
};
// auth middleware
router.use(function (req, res, next) {
  if (!req.headers.authorization) {
    return res.status(403).json({ error: "No credentials sent!" });
  }
  let auth_value = req.headers.authorization;
  let token = auth_value.split(" ")[1];

  let authUser = verifyUser(token);
  if (!authUser) {
    return res.status(403).json({ error: "Token is incorrect!" });
  }
  next();
});

// Update the book with a new review
router.post("/:id", async (req, res) => {
  try {
    const title = req.body.title;
    const content = req.body.content;
    const query = { _id: ObjectId(req.params.id) };

    if (!title || !content) {
      return res
        .status(422)
        .json({ message: "Please Provide all of required fields!" });
    }
    let collection = await db.collection("books");
    let newReview = {
      $push: {
        reviews: {
          _id: new ObjectId(),
          username: AuthUsername,
          content: content,
          title: title,
        },
      },
    };

    let result = await collection.updateOne(query, newReview);

    res.send(result).status(200);
  } catch (err) {
    res.send(err).status(500);
  }
});

// Update a review
router.put("/:id", async (req, res) => {
  const title = req.body.title;
  const content = req.body.content;
  const review_id = ObjectId(req.body.review_id);
  const query = { _id: ObjectId(req.params.id) };

  if (!title && !content) {
    return res.status(422).json({ message: "At least One field is necessary" });
  }
  let collection = await db.collection("books");
  const book = await collection.findOne(query);

  //check if user is the owner of that review
  let isOwner = false;
  book.reviews.forEach((review) => {
    if (review._id == req.body.review_id && review.username === AuthUsername) {
      isOwner = review;
    }
  });
  if (!isOwner) {
    return res
      .status(403)
      .json({ message: "You don't have permission to edit this review!" });
  }

  let newReviewQuery = [];

  book.reviews.forEach((review) => {
    if (review._id == req.body.review_id) {
      let new_data = {
        _id: review_id,
        username: AuthUsername,
        content: content,
        title: title,
      };
      newReviewQuery.push(new_data);
    } else {
      newReviewQuery.push(review);
    }
  });

  let newReview = {
    $set: {
      reviews: newReviewQuery,
    },
  };

  let result = await collection.updateOne(query, newReview);

  res.send(result).status(200);
});

// Delete a review
router.delete("/:id", async (req, res) => {
  const review_id = ObjectId(req.body.review_id);
  const query = { _id: ObjectId(req.params.id) };

  let collection = await db.collection("books");
  const book = await collection.findOne(query);

  //check if user is the owner of that review
  let isOwner = false;
  book.reviews.forEach((review) => {
    if (review._id == req.body.review_id && review.username === AuthUsername) {
      isOwner = review;
    }
  });
  if (!isOwner) {
    return res
      .status(403)
      .json({ message: "You don't have permission to delete this review!" });
  }

  let newReviewQuery = [];

  book.reviews.forEach((review) => {
    if (review._id != req.body.review_id) {
      newReviewQuery.push(review);
    }
  });

  let newReview = {
    $set: {
      reviews: newReviewQuery,
    },
  };

  // delete a review by updating queries
  let result = await collection.updateOne(query, newReview);

  res.send(result).status(200);
});

export default router;
