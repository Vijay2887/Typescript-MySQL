import passport from "passport";
import { Strategy } from "passport-local";
import pool from "../database/connection";
import { UserI } from "../interfaces";

export default passport.use(
  new Strategy(async (username, password, done) => {
    try {
      const query = `SELECT * FROM users WHERE username = ?`;
      const [result] = await pool.query<UserI[]>(query, [username]);
      if (result.length === 0)
        throw new Error("No user exists with given credentials");
      if (result[0].password !== password) throw new Error("Invalid Password");
      done(null, result[0]);
    } catch (error) {
      done(error as Error, false);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const query = `SELECT * FROM users WHERE id = ?`;
    const [result] = await pool.query<UserI[]>(query, [id]);
    done(null, result[0]);
  } catch (error) {
    done(error as Error, false);
  }
});
