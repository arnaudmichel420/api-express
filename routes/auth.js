const express = require("express");
const router = express.Router();
const {
  sendSuccess,
  sendError,
  sendServerError,
} = require("../utils/response");
const { User } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res, next) => {
  try {
    const { email, password, confirmPassword, firstName, lastName } = req.body;

    if (password !== confirmPassword) {
      return sendError({
        res,
        message: "Les mots de passe sont différents",
        code: 404,
      });
    }

    const user = await User.create({
      firstName,
      lastName,
      password,
      email,
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "2h",
    });

    return sendSuccess({
      res,
      code: 201,
      message: "Utilisateur crée",
      data: { token },
    });
  } catch (error) {
    return sendServerError(res, error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (password !== undefined && password.length < 8) {
      return sendError({
        res,
        message: "Le mots de passe doit faire au moins 8 caractères",
        code: 404,
      });
    }

    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return sendError({
        res,
        message: "Utilisateur ou mot de passe invalide",
        code: 401,
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return sendError({
        res,
        message: "Utilisateur ou mot de passe invalide",
        code: 401,
      });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "2h",
    });

    return sendSuccess({
      res,
      message: "Authentifié avec succès",
      code: 200,
      data: { token },
    });
  } catch (error) {
    return sendServerError(res, error);
  }
});

router.get("/me", async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token.startsWith("Bearer ")) {
      return sendError({
        res,
        message: "Token non valide",
        code: 401,
      });
    }

    jwt.verify(
      token.split(" ")[1],
      process.env.JWT_SECRET_KEY,
      async (error, playload) => {
        if (error) {
          return sendError({
            res,
            message: "Token non valide",
            code: 401,
          });
        }
        const user = await User.findByPk(playload.id);

        return sendSuccess({
          res,
          message: "Token valide",
          code: 200,
          data: user,
        });
      }
    );
  } catch (error) {
    return sendServerError(res, error);
  }
});

module.exports = router;
