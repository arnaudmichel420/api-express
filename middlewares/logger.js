const path = require("path");
const { access, appendFile, mkdir } = require("fs/promises");

const dir = path.join(__dirname, "../logs");


async function logger(req, res, next) {
  try {
    await access(dir);
  } catch {
    await mkdir(dir);
  }

  res.on("finish", async () => {
    const date = new Date().toISOString();
    const filePath = path.join(dir, `${date.split("T")[0]}.log`);
    try {
      await appendFile(
        filePath,
        `TIME: ${date} | IP: ${req?.ip} | METHOD: ${req?.method} | PATH: ${req?.originalUrl} | RESPONSE STATUS: ${res?.statusCode} \r\n`
      );
    } catch (err) {
      console.error("Erreur log:", err);
    }
  });

  next();
}

module.exports = logger;
