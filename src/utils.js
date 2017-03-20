// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is#Polyfill
function is(x, y) {
  if (x === y) {
    return x !== 0 || 1 / x === 1 / y;
  } else {
    return x !== x && y !== y;
  }
}

export function shallowEqual(a, b) {
  if (
    typeof a !== "object" || typeof b !== "object" || a === null || b === null
  ) {
    return false;
  }

  const ka = Object.keys(a);
  const kb = Object.keys(b);

  if (ka.length !== kb.length) {
    return false;
  }

  return ka.every(k => b.hasOwnProperty(k) && is(a[k], b[k]));
}
