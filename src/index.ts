import express, { Application, NextFunction, Request, Response } from "express";
import {
  addComment,
  addPost,
  followUser,
  getFollwoings,
  getPostCount,
  getPosts,
  getPostsBetweenDates,
  userLogin,
} from "./routes/userRoutes";
import passport from "./strategies/localStrategy";
import session from "express-session";
import { isAuthenticated } from "./middlewares/isAuthenticated";

declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      firstName: string;
      lastName: string;
      email: string;
      password: string;
    }
  }
}
const app: Application = express();

// setting up some middlewares
app.use(express.json());
app.use(
  session({
    secret: "My-Session-Secret",
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // one day
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

const PORT = 4000;

// login route
app.post("/login", passport.authenticate("local"), (req, res, next) => {
  userLogin(req, res, next);
});

app.use(isAuthenticated);

// route to add a post
app.post("/post", async (req, res, next) => {
  await addPost(req, res, next);
});

// route to get all posts
app.get("/post", async (req, res, next) => {
  await getPosts(req, res, next);
});

// route to get post count
app.get("/post-count", async (req, res, next) => {
  await getPostCount(req, res, next);
});

// route to get posts between two dates
app.post("/filtered-posts", async (req, res, next) => {
  await getPostsBetweenDates(req, res, next);
});

// route to add a comment
app.post("/comment", async (req, res, next) => {
  await addComment(req, res, next);
});

// route to follow a user
app.post("/follow", async (req, res, next) => {
  await followUser(req, res, next);
});

// route to get followings of each user
app.get("/followings", async (req, res, next) => {
  await getFollwoings(req, res, next);
});

app.listen(PORT, () => {
  console.log("Running at port ", PORT);
});
