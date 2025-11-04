const pool = require("../core/sql");

async function checkIfExist(table, id) {
  const [rows] = await pool.query(`SELECT * FROM ?? WHERE id = ?`, [table, id]);

  return rows?.length > 0 ? rows : null;
}
module.exports = {
  checkIfExist,
};
