const express = require("express");
const router = express.Router();
const {
  sendSuccess,
  sendError,
  sendServerError,
} = require("../utils/response");
const { parseDate } = require("../utils/date");
const Task = require("../models/tasks");
const User = require("../models/users");
const { Op } = require("sequelize");
const toBool = require("../utils/bool");

router.get("/", async (req, res, next) => {
  try {
    //filter
    const { id: userId } = req.user;
    const { title, done, late } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (limit > 100) {
      return sendError({ res, message: "Maximun 100 sur la limit" });
    }

    const filters = {};

    if (title !== undefined) filters.title = { [Op.substring]: title };
    if (done !== undefined) filters.done = toBool(done);
    if (late !== undefined) {
      filters.date = toBool(late)
        ? { [Op.lt]: new Date() }
        : { [Op.gt]: new Date() };
    }
    filters.userId = userId;

    const { count: total, rows: data } = await Task.findAndCountAll({
      where: filters,
      offset: (page - 1) * limit,
      limit,
    });

    return sendSuccess({
      res,
      data: {
        page,
        limit,
        total,
        hasPrev: (page - 1) * limit > 0,
        hasNext: total - page * limit > 0,
        data,
      },
    });
  } catch (error) {
    return sendServerError(res, error);
  }
});

router.get("/:taskId", async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { taskId } = req.params;

    const task = await Task.findOne({
      where: {
        id: taskId,
      },
      include: {
        model: User,
        as: "user",
        attributes: [],
        where: {
          id: userId,
        },
      },
    });

    if (!task) {
      return sendError({ res, message: "Tache non trouvé", code: 404 });
    }

    return sendSuccess({
      res,
      data: task,
    });
  } catch (error) {
    console.log(error);

    return sendServerError(res, error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const {
      userId,
      done = false,
      title,
      description,
      date = new Date().toISOString(),
    } = req.body;

    const task = await Task.create({
      userId,
      done,
      title,
      description,
      date: parseDate(date),
    });

    return sendSuccess({
      res,
      code: 201,
      message: "Tache crée",
      data: task,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
});

router.patch("/:taskId", async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { id: userId } = req.user;

    const task = await Task.findByPk(taskId);

    if (!task) {
      return sendError({ res, message: "Tache non trouvé", code: 404 });
    }

    if (task.userId !== userId) {
      return sendError({
        res,
        message: "Vous ne pouvez pas modifier cette tâches",
        code: 404,
      });
    }

    task.set(req.body);

    await task.save();

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
    const { id: userId } = req.user;

    const task = await Task.findByPk(taskId);

    if (!task) {
      return sendError({ res, message: "Tache non trouvé", code: 404 });
    }

    if (task.userId !== userId) {
      return sendError({
        res,
        message: "Vous ne pouvez pas supprimer cette tâches",
        code: 404,
      });
    }

    await Task.destroy({
      where: {
        id: taskId,
      },
    });

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
