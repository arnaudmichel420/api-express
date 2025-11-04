function toBool(value) {
  if (typeof value === 'boolean') return value;         // déjà un bool
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  return undefined;
}

module.exports = toBool