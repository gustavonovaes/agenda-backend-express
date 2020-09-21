function filterByKeys(object, keys = []) {
  return Object.keys(object).reduce((acc, key) => {
    if (keys.includes(key)) {
      acc[key] = object[key];
    }

    return acc;
  }, {});
}

module.exports = filterByKeys;
