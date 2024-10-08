import express from "express";
import cors from "cors";
import "./loadEnvironment.mjs";
import "express-async-errors";
import books from "./routes/books.mjs";
import auth from "./routes/auth.mjs";
import reviews from "./routes/manageReviews.mjs";

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());

// Load the /books routes
app.use("/books", books);
app.use("/auth", auth);
app.use("/reviews", reviews);

// Global error handling
app.use((err, _req, res, next) => {
  res.status(500).send("Uh oh! An unexpected error occured.")
})

// start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
