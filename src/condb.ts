import mysql from "mysql";
const util = require('util');
export const condb = mysql.createPool({
  connectionLimit: 10,
  host: "202.28.34.197",
  user: "web66_65011212038",
  password: "65011212038@csmsu",
  database: "web66_65011212038",
});

export const queryAsync = util.promisify(condb.query).bind(condb);