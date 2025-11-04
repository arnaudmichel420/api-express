function parseDate(date) {
  return new Date(date).toISOString().slice(0, 19).replace("T", " ");
}
const ISO_RE =
  /^\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})?)?$/;

function isIsoDateString(s) {
  if (typeof s !== "string" || !ISO_RE.test(s)) return false;
  const d = new Date(s);
  return !Number.isNaN(d.getTime());
}

module.exports = { parseDate, isIsoDateString };
