const express = require("express");
const router = express.Router();
const {
  sendError,
  sendServerError,
} = require("../utils/response");
const jwt = require("jsonwebtoken");

async function authMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization;

    if(!token){
      return sendError({
        res,
        message: "Authentification nécessaire",
        code: 401,
      });
    }

    if (!token.startsWith("Bearer ")) {
      return sendError({
        res,
        message: "Token non valide",
        code: 403,
      });
    }

    jwt.verify(
      token.split(" ")[1],
      process.env.JWT_SECRET_KEY,
      (error, payload) => {
        if (error) {
          return sendError({
            res,
            message: "Token non valide",
            code: 403,
          });
        }
        req.user = payload;
        next();
      }
    );
  } catch (error) {
    return sendServerError(res, error);
  }
}

module.exports = authMiddleware;
