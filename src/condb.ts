import mysql from "mysql";

export const condb = mysql.createPool({
  connectionLimit: 10,
  host: "202.28.34.197",
  user: "web66_65011212038",
  password: "65011212038@csmsu",
  database: "web66_65011212038",
});