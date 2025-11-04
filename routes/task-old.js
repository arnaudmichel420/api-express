const express = require("express");
const router = express.Router();
const pool = require("../core/sql");
const { checkIfExist } = require("../utils/check");
const {
  sendSuccess,
  sendError,
  sendServerError,
} = require("../utils/response");
const { parseDate, isIsoDateString } = require("../utils/date");

router.get("/", async (req, res, next) => {
  try {
    //filter
    const { title, done, late } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sets = [];
    const vals = [];

    if (limit > 100) {
      return sendError({ res, message: "Maximun 100 sur la limit" });
    }
    if (title?.length > 100) {
      return sendError({ res, message: "Maximun 100 caractère sur le titre" });
    }
    if (typeof done !== "undefined" && typeof done !== "boolean") {
      return sendError({ res, message: "Done doit être un booléen" });
    }
    if (typeof done !== "undefined" && typeof late !== "boolean") {
      return sendError({ res, message: "Late doit être un booléen" });
    }

    if (title !== undefined) {
      sets.push("LOWER(title) LIKE ?");
      vals.push(`%${title.toLowerCase()}%`);
    }
    if (done !== undefined) {
      const doneVal =
        done === "1" || done === 1 || done === true || done === "true" ? 1 : 0;
      sets.push("`done` = ?");
      vals.push(doneVal);
    }
    if (late !== undefined) {
      const isLate =
        late === "1" || late === "true" || late === 1 || late === true;
      sets.push(isLate ? "`date` < NOW()" : "`date` >= NOW()");
    }

    let count = null;
    if (sets.length === 0) {
      [count] = await pool.query(`SELECT COUNT(id) AS count FROM tasks`, []);
    } else {
      [count] = await pool.query(
        `SELECT COUNT(id) AS count FROM tasks WHERE ${sets.join(" AND ")}`,
        [...vals]
      );
    }
    const total = count[0]?.count;
    //pagination
    let data;
    if (sets.length === 0) {
      [data] = await pool.query(
        `SELECT ?? FROM tasks LIMIT ${limit} OFFSET ${(page - 1) * limit}`,
        [["id", "title", "done", "date"]]
      );
    } else {
      [data] = await pool.query(
        `SELECT ?? FROM tasks WHERE ${sets.join(" AND ")} LIMIT ${limit} OFFSET ${(page - 1) * limit}`,
        [["id", "title", "done", "date"], ...vals]
      );
    }

    return sendSuccess({
      res,
      data: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        data,
      },
    });
  } catch (error) {
    return sendServerError(res, error);
  }
});

router.get("/:taskId", async (req, res, next) => {
  try {
    const { taskId } = req.params;

    if (isNaN(Number.isInteger(taskId))) {
      return sendError({ res, message: "ID manquante" });
    }

    const task = await checkIfExist("tasks", taskId);

    if (!task) {
      return sendError({ res, message: "Tache non trouvé", code: 404 });
    }

    return sendSuccess({
      res,
      data: task,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const {
      done = false,
      title,
      description,
      date = new Date().toISOString(),
    } = req.body;

    if (done == null || title == null || description == null || date == null) {
      return sendError({ res, message: "Champs manquants" });
    }
    if (title?.length > 100) {
      return sendError({ res, message: "Maximun 100 caractère sur le titre" });
    }
    if (description?.length > 5000) {
      return sendError({
        res,
        message: "Maximun 5000 caractère sur la description",
      });
    }
    if (typeof done !== "boolean") {
      return sendError({ res, message: "Done doit être un booléen" });
    }
    if (!isIsoDateString(date)) {
      return sendError({ res, message: "La date n'est pas valide" });
    }

    await pool.execute(
      `INSERT INTO tasks (done, title, description, date) VALUES (?,?,?,?)`,
      [done, title, description, parseDate(date)]
    );
    return sendSuccess({
      res,
      code: 201,
      message: "Tache crée",
    });
  } catch (error) {
    return sendServerError(res, error);
  }
});

router.patch("/:taskId", async (req, res, next) => {
  try {
    const { taskId } = req.params;

    if (taskId === null || isNaN(Number.isInteger(taskId))) {
      return sendError({ res, message: "ID manquante" });
    }

    const task = await checkIfExist("tasks", taskId);
    if (!task) {
      return sendError(res, "Tache non trouvé", 404);
    }
    const { title, description, done, date } = req.body;
    const sets = [];
    const vals = [];

    if (title?.length > 100) {
      return sendError({ res, message: "Maximun 100 caractère sur le titre" });
    }
    if (description?.length > 5000) {
      return sendError({
        res,
        message: "Maximun 5000 caractère sur la description",
      });
    }
    if (typeof done !== "boolean") {
      return sendError({ res, message: "Done doit être un booléen" });
    }
    if (typeof date !== "boolean") {
      return sendError({ res, message: "Late doit être un booléen" });
    }

    if (title !== undefined) {
      sets.push("`title` = ?");
      vals.push(title);
    }
    if (description !== undefined) {
      sets.push("`description` = ?");
      vals.push(description);
    }
    if (done !== undefined) {
      sets.push("`done` = ?");
      vals.push(done);
    }
    if (date !== undefined) {
      sets.push("`date` = ?");
      vals.push(parseDate(date));
    }

    if (sets.length === 0) {
      return sendError({ res, message: "Aucun champ à mettre à jour" });
    }

    vals.push(taskId);
    const [result] = await pool.execute(
      `UPDATE tasks SET ${sets.join(", ")} WHERE id = ?`,
      vals
    );

    return sendSuccess({
      res,
      message: "Tache modifié",
    });
  } catch (error) {
    return sendServerError(res, error);
  }
});

router.delete("/:taskId", async (req, res, next) => {
  try {
    const { taskId } = req.params;

    if (taskId === null || isNaN(Number.isInteger(taskId))) {
      return sendError({ res, message: "ID manquante" });
    }
    const task = await checkIfExist("tasks", taskId);

    if (!task) {
      return sendError({ res, message: "Tache non trouvé", code: 404 });
    }

    await pool.execute(`DELETE FROM tasks WHERE id = ${taskId}`);

    return sendSuccess({
      res,
      message: `id: ${taskId} supprimé`,
      code: 204,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
});
module.exports = router;
