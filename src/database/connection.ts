import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "mysql",
  database: "node_mysql_ts",
});

export default pool;
