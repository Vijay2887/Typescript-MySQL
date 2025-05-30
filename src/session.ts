// session.ts
import session from "express-session";
import MySQLStoreFactory from "express-mysql-session";
import pool from "./database/connection";

const MySQLStore = MySQLStoreFactory(session as any);

// Use mysql2/promise to create a pool

// Session store using the pool
const sessionStore = new MySQLStore({}, pool as any);

export const sessionMiddleware = session({
  secret: "My-Session-Secret",
  saveUninitialized: false,
  resave: false,
  store: sessionStore,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // one day
  },
});
