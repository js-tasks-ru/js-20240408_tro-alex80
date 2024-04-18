/**
 * invertObj - should swap object keys and values
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns new object or undefined if nothing did't pass
 */
export function invertObj(obj) {
  if (!obj) return;
  const arr = Object.entries(obj);

  return arr.reduce((res, [key, value]) => {
    res[value] = key;
    return res;
  }, {});
}

// export function invertObj(obj) {
//   if (!obj) return;
//   const result = Object.entries(obj);
//   let object = {};
//
//   for (const key of result) {
//     object[key[1]] = key[0];
//   }
//   return object;
// }
//
// const obj = { key: 'value' };
//
// console.log(invertObj(obj)); // { value: 'key'}