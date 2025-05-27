import { NextFunction, Request, Response } from "express-serve-static-core";
import pool from "../database/connection";
import {
  commentsI,
  followingIdI,
  formattedQueryResultsI,
  getAllPostsI,
  getFollowingsI,
  postCountI,
  postsI,
  UserMapI,
} from "../interfaces";

// user login request handler
export const userLogin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user) {
    return res.status(200).json({
      message: "User logged in successfully",
      user: req.user,
    });
  }
  return res.status(400).send({ msg: "Please Login First" });
};

// route to add a post
export const addPost = async (
  req: Request<{}, {}, { title: string; description: string }>,
  res: Response,
  next: NextFunction
) => {
  const { body, user } = req;
  const query = `insert into posts (title, description, created_by, created_on) values (?, ?, ?, ?)`;
  try {
    await pool.query(query, [
      body.title,
      body.description,
      user?.id,
      new Date(Date.now()),
    ]);
    res.status(200).send({ msg: "Post added successfully" });
  } catch (error) {
    res
      .status(500)
      .send({ msg: "Error in /post route", error: (error as Error).message });
  }
};

// route to get all posts
export const getPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const query =
    "select posts.*, users.username, users.email, users.id from posts join users on posts.created_by = users.id";
  try {
    const [queryResult] = await pool.query<getAllPostsI[]>(query);
    const formattedQueryResults: formattedQueryResultsI[] = queryResult.map(
      (result) => {
        const {
          post_id,
          title,
          description,
          created_by,
          id,
          created_on,
          username,
          email,
        } = result;
        return {
          post_id,
          title,
          description,
          created_on,
          userDetails: { id, username, email },
        };
      }
    );
    // logic to add comments array dynamically to each post
    const commentQuery = `select comments.post_id, comments.comment_message, comments.comment_by, users.username, users.email from comments 
  join users on comments.comment_by = users.id;`;
    const [commentResult] = await pool.query<commentsI[]>(commentQuery);
    const formattedCommentResult = commentResult.map((r) => {
      const { comment_message, comment_by, post_id, ...userDetails } = r;
      return { comment_message, comment_by, post_id, userDetails };
    });
    const commentsDic: any = {};
    formattedCommentResult.forEach((r) => {
      if (!commentsDic[r.post_id]) {
        commentsDic[r.post_id] = [];
      }
      commentsDic[r.post_id].push({
        comment: r.comment_message,
        by: r.comment_by,
        userDetails: r.userDetails,
      });
    });

    const { user } = req;
    const followingQuery = `select f.following from following as f where user_id = ?`;
    const [followingQueryResult] = await pool.query<followingIdI[]>(
      followingQuery,
      [user?.id]
    );
    // get the followingIds of current login user in an array
    const followingIds: number[] = [];
    if (followingQueryResult.length > 0) {
      followingQueryResult.forEach((r) => {
        followingIds.push(r.following);
      });
    }

    formattedQueryResults.forEach((r) => {
      const following = followingIds.includes(r.userDetails.id);
      if (commentsDic[r.post_id]) {
        r.comments = commentsDic[r.post_id];
      } else {
        r.comments = [];
      }
      r.following = following;
    });

    res.status(200).send(formattedQueryResults);
  } catch (error) {
    res.status(400).send({
      msg: "Error in /post get route",
      error: (error as Error).message,
    });
  }
};

// route to get post count
export const getPostCount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const query = ` select count(posts.post_id) as post_count, posts.created_by, users.id, users.firstName, users.lastName, users.email, users.username from posts 
    join users on posts.created_by = users.id
    group by posts.created_by `;
  try {
    const [result] = await pool.query<postCountI[]>(query);
    const formattedResults = result.map((r) => {
      const { post_count, created_by, ...userDetails } = r;
      return { post_count, userDetails };
    });
    res.status(200).send(formattedResults);
  } catch (error) {
    res.status(400).send({
      msg: "Error in /post-count route",
      error: (error as Error).message,
    });
  }
};

// route to get posts between two dates
export const getPostsBetweenDates = async (
  req: Request<{}, {}, { startDate: Date; endDate: Date }>,
  res: Response,
  next: NextFunction
) => {
  const { startDate, endDate } = req.body;
  const query = `select posts.* from posts where posts.created_on >= ? and posts.created_on <= ? order by posts.created_on asc`;
  try {
    const [result] = await pool.query<postsI[]>(query, [startDate, endDate]);
    res.status(200).send(result);
  } catch (error) {
    res.status(400).send({
      msg: "Error in /filtered-posts route",
      error: (error as Error).message,
    });
  }
};

// route to add a comment
export const addComment = async (
  req: Request<{}, {}, { postId: number; msg: string }>,
  res: Response,
  next: NextFunction
) => {
  const { postId, msg } = req.body;
  const { user } = req;
  const query = `insert into comments(post_id, comment_message, comment_by) values (?,?,?)`;
  try {
    await pool.query(query, [postId, msg, user?.id]);
    res.status(200).send({ msg: "Comment added successfully" });
  } catch (error) {
    res.status(400).send({
      msg: "Error in /comment post route",
      error: (error as Error).message,
    });
  }
};

// route to follow a user
export const followUser = async (
  req: Request<{}, {}, { id: number }>,
  res: Response,
  next: NextFunction
) => {
  const { body, user } = req;
  const query = `insert into following (user_id, following) values (?,?)`;
  try {
    await pool.query(query, [user?.id, body.id]);
    res.status(200).send({ msg: `You are now following user ID ${body.id}` });
  } catch (error) {
    res.status(400).send({
      msg: "Error in /follow post route",
      error: (error as Error).message,
    });
  }
};

// route to get follwoings of each user
export const getFollwoings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const query = `select f.user_id, f.following, u.username, u.email, x.username as fol_userName, x.email as fol_email from following as f join users as u on f.user_id = u.id join users as x on x.id = f.following;`;
  try {
    const [result] = await pool.query<getFollowingsI[]>(query);
    const formattedResults = result.map((r) => {
      const { user_id, following, username, email, fol_userName, fol_email } =
        r;
      return {
        user_id,
        userDetails: { username, email },
        followingUserDetails: {
          id: following,
          name: fol_userName,
          email: fol_email,
        },
      };
    });
    // constructing a dictionary for look up.. format : (userId: [followings])
    const followingDic: UserMapI = {};
    formattedResults.forEach((r) => {
      if (!followingDic[r.user_id]) {
        followingDic[r.user_id] = {
          user_id: r.user_id,
          userDetails: r.userDetails,
          followings: [],
        };
      }
      followingDic[r.user_id].followings.push({ ...r.followingUserDetails });
    });
    res.status(200).send(followingDic);
  } catch (error) {
    res.status(400).send({
      msg: "Error in /followings get route",
      error: (error as Error).message,
    });
  }
};
