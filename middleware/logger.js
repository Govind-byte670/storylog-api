function logger(req, res, next) {
  if (["POST", "PUT", "DELETE"].includes(req.method)) {
    console.log(`${req.method} ${req.originalUrl} --body:`, req.body);
  }
  next();
}
module.exports = logger;
