import { RowDataPacket } from "mysql2/promise";

export interface UserI extends RowDataPacket {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  email: string;
}

export interface getAllPostsI extends RowDataPacket {
  post_id: number;
  title: string;
  description: string;
  created_by: number;
  created_on: Date;
  username: string;
  email: string;
}

export interface postCountI extends RowDataPacket {
  post_count: number;
  created_by: number;
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
}

export interface postsI extends RowDataPacket {
  post_id: number;
  title: string;
  description: string;
  created_by: number;
  created_on: Date;
}

export interface commentsI extends RowDataPacket {
  post_id: number;
  comment_message: string;
  comment_by: number;
  username: string;
  email: string;
}

type Comment = {
  comment: string;
  by: number;
  userDetails: {
    username: string;
    email: string;
  };
};

export interface formattedQueryResultsI {
  post_id: number;
  title: string;
  description: string;
  created_on: Date;
  userDetails: {
    id: number;
    username: string;
    email: string;
  };
  comments?: Comment[];
  following?: boolean;
}

export interface getFollowingsI extends RowDataPacket {
  user_id: number;
  following: number;
  username: string;
  email: string;
  fol_userName: string;
  fol_email: string;
}

type follwoingsType = {
  id: number;
  name: string;
  email: string;
};

export interface UserMapI {
  [key: string]: {
    user_id: number;
    userDetails: {
      username: string;
      email: string;
    };
    followings: follwoingsType[];
  };
}

export interface followingIdI extends RowDataPacket {
  following: number;
}
