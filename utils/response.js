function sendSuccess({ res, message, code = 200, data = null }) {
  return res.status(code).json({
    message,
    status: true,
    data,
  });
}
function sendError({res, message = "OK", code = 400}) {
  return res.status(code).json({
    message,
    status: false,
  });
}
function sendServerError(res, error) {
  return res.status(500).json({
    message: "Erreur",
    status: false,
    error,
  });
}

module.exports = { sendSuccess, sendError, sendServerError };
