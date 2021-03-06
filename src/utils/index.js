const MAX_SAFE_INTEGER = 9007199254740991
/** Used to resolve the decompiled source of functions. */
const funcToString = Function.prototype.toString
/** Used to check objects for own properties. */
const hasOwnProperty = Object.prototype.hasOwnProperty
/** Used to infer the `Object` constructor. */
const objectCtorString = funcToString.call(Object)
const objectProto = Object.prototype
const toString = objectProto.toString
const symToStringTag = typeof Symbol !== 'undefined' ? Symbol.toStringTag : undefined;
const byteToHex = [];
const rnds = new Array(16);
for (let i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

/**
 * 获取对象基础标识
 * @param value
 * @returns {*}
 */
const baseGetTag = (value) => {
  if (value === null) {
    return value === undefined ? '[object Undefined]' : '[object Null]'
  }
  if (!(symToStringTag && symToStringTag in Object(value))) {
    return toString.call(value)
  }
  const isOwn = hasOwnProperty.call(value, symToStringTag)
  const tag = value[symToStringTag]
  let unmasked = false
  try {
    value[symToStringTag] = undefined
    unmasked = true
  } catch (e) {
  }

  const result = toString.call(value)
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag
    } else {
      delete value[symToStringTag]
    }
  }
  return result
}

const TypeOf = (ob) => {
  return Object.prototype.toString.call(ob).slice(8, -1).toLowerCase()
}

/**
 * 判断是否为函数
 * @param value
 * @returns {boolean}
 */
const isFunction = value => {
  if (!isObject(value)) {
    return false
  }
  const tag = baseGetTag(value)
  return tag === '[object Function]' || tag === '[object AsyncFunction]' ||
    tag === '[object GeneratorFunction]' || tag === '[object Proxy]'
}

/**
 * 判断是否为对象
 * @param value
 * @returns {boolean}
 */
const isObject = value => {
  const type = typeof value
  return value !== null && (type === 'object' || type === 'function')
}

/**
 * 类对象
 * @param value
 * @returns {boolean}
 */
const isObjectLike = value => {
  return typeof value === 'object' && value !== null
}

/**
 * 是否为字符或者数组长度
 * @param value
 * @returns {boolean}
 */
const isLength = value => {
  return (typeof value === 'number' && value > -1 && value % 1 === 0 && value <= MAX_SAFE_INTEGER)
}

/**
 * 判断是否为数组
 * @param arr
 * @returns {boolean}
 */
const isArray = arr => {
  return Array.isArray(arr)
}

/**
 * 是否为类数组（element对象）
 * @param value
 * @returns {boolean}
 */
const isArrayLike = value => {
  return value !== null && typeof value !== 'function' && isLength(value.length)
};

/**
 * 转换为数组
 * @param obj
 * @returns {Array}
 */
const toArray = (obj) => {
  try {
    return Array.prototype.slice.call(obj)
  } catch (e) {
    let arr = []
    let i = obj.length
    while (i--) {
      arr[i] = obj[i]
    }
    return arr
  }
}

/**
 * 判断是否为json
 * @param value
 * @returns {boolean}
 */
const isJson = (value) => {
  let _isjson = typeof (value) === 'object' &&
    (Array.toString).call(value).toLowerCase() === '[object object]' && !value.length
  return _isjson
}

/**
 * 判断是否为当前窗口
 * @param win
 * @returns {*|boolean}
 */
const isWindow = win => {
  return win && win === win.window
}

/**
 * 判断是否为document
 * @param doc
 * @returns {*|boolean}
 */
const isDocument = doc => {
  return doc && doc.nodeType === doc.DOCUMENT_NODE
}

/**
 * each
 * @param elements
 * @param callback
 * @returns {*}
 */
const each = (elements, callback) => {
  let [i, key] = []
  if (isArrayLike(elements)) {
    for (i = 0; i < elements.length; i++) {
      if (callback.call(elements[i], i, elements[i]) === false) {
        return elements
      }
    }
  } else {
    for (key in elements) {
      if (callback.call(elements[key], key, elements[key]) === false) {
        return elements
      }
    }
  }
  return elements
}

/**
 * 如果指定的参数是纯粹的对象，则返回true，否则返回fals
 * @param value
 * @returns {boolean}
 */
const isPlainObject = function (value) {
  if (!isObjectLike(value) || baseGetTag(value) !== '[object Object]') {
    return false
  }
  const proto = Object.getPrototypeOf(value)
  if (proto === null) {
    return true
  }
  const Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor
  return (typeof Ctor === 'function' && Ctor instanceof Ctor &&
    funcToString.call(Ctor) === objectCtorString)
}

/**
 * 按出现位置进行排序并去除重复元素
 * @param arrayLike
 * @returns {*}
 */
const unique = (arrayLike) => {
  try {
    return Array.prototype.filter.call(arrayLike, function (item, idx) {
      return arrayLike.indexOf(item) === idx
    })
  } catch (e) {
    if (!arrayLike.length) return arrayLike
    let res = [arrayLike[0]]
    for (let i = 1; i < arrayLike.length; i++) {
      if (res.indexOf(arrayLike[i]) < 0) {
        res.push(arrayLike[i])
      }
    }
    return res
  }
}

/**
 * clone or deepClone
 * @returns {null}
 */
const clone = function () {
  let [options, name, src, copy, copyIsArray, _clone] = []
  let [target, length, i, deep] = [arguments[0], arguments.length, 1, false]
  // 处理深拷贝的情况
  if (typeof (target) === 'boolean') {
    deep = target
    // Skip the boolean and the target
    target = arguments[i] || {}
    i++
  }
  // 处理时，目标是一个字符串或（深拷贝可能的情况下）的东西
  if (typeof (target) !== 'object' && !isFunction(target)) {
    target = {}
  }
  if (i === length) {
    target = this
    i--
  }
  for (; i < length; i++) {
    // Only deal with non-null/undefined values
    if ((options = arguments[i]) !== null) {
      // Extend the base object
      for (name in options) {
        src = target[name]
        copy = options[name]
        // Prevent never-ending loop
        if (target === copy) {
          continue
        }
        // Recurse if we're merging plain objects or arrays
        if (deep && copy && (isPlainObject(copy) ||
            (copyIsArray = Array.isArray(copy)))) {
          if (copyIsArray) {
            copyIsArray = false
            _clone = src && Array.isArray(src) ? src : []
          } else {
            _clone = src && isPlainObject(src) ? src : {}
          }
          // Never move original objects, clone them
          target[name] = clone(deep, _clone, copy)
          // Don't bring in undefined values
        } else if (copy !== undefined) {
          target[name] = copy
        }
      }
    }
  }
  // Return the modified object
  return target
}

/**
 * 扩展
 * @param target
 * @param ob
 * @returns {*}
 */
const extend = (target, ob) => {
  for (let i in ob) {
    Object.hasOwnProperty()
    target[i] = ob[i]
  }
  return target
}

/**
 * 判断是否为表单数据
 * @param val
 * @returns {boolean}
 */
const isFormData = (val) => {
  return (typeof FormData !== 'undefined') && (val instanceof FormData)
};

/**
 * is date value
 * @param val
 * @returns {boolean}
 */
const isDate = (val) => {
  return toString.call(val) === '[object Date]';
};

/**
 * is array buffer
 * @param val
 * @returns {boolean}
 */
const isArrayBuffer = (val) => {
  return toString.call(val) === '[object ArrayBuffer]';
};

/**
 * 判断是否为合法字符串
 * @param value
 * @returns {boolean}
 */
const isString = (value) => {
  if (value == null) {
    return false;
  }
  return typeof value === 'string' || (value.constructor !== null && value.constructor === String);
};

/**
 * form uuid
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 * @param buf
 * @param offset
 * @returns {string}
 */
const bytesToUuid = (buf, offset) => {
  let i = offset || 0;
  const bth = byteToHex;
  return bth[buf[i++]] + bth[buf[i++]] +
    bth[buf[i++]] + bth[buf[i++]] + '-' +
    bth[buf[i++]] + bth[buf[i++]] + '-' +
    bth[buf[i++]] + bth[buf[i++]] + '-' +
    bth[buf[i++]] + bth[buf[i++]] + '-' +
    bth[buf[i++]] + bth[buf[i++]] +
    bth[buf[i++]] + bth[buf[i++]] +
    bth[buf[i++]] + bth[buf[i++]];
};

/**
 * math rng
 * @returns {any[]}
 */
const mathRNG = () => {
  for (let i = 0, r; i < 16; i++) {
    if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
    rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
  }
  return rnds;
};

/**
 * get uuid
 * @param options
 * @param buf
 * @param offset
 * @returns {*|string}
 */
const uuid = (options, buf, offset) => {
  /* eslint-disable */
  const i = buf && offset || 0;
  if (typeof (options) === 'string') {
    buf = options === 'binary' ? new Array(16) : null;
    options = null;
  }
  options = options || {};
  const rnds = options.random || (options.rng || mathRNG)();
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;
  // Copy bytes to buffer, if provided
  if (buf) {
    for (let ii = 0; ii < 16; ++ii) {
      buf[i + ii] = rnds[ii];
    }
  }
  return buf || bytesToUuid(rnds);
};

/**
 * 编码请求地址
 * @param val
 * @returns {string}
 */
const encode = (val) => {
  return encodeURIComponent(val)
    .replace(/%40/gi, '@')
    .replace(/%3A/gi, ':')
    .replace(/%24/g, '$')
    .replace(/%2C/gi, ',')
    .replace(/%20/g, '+')
    .replace(/%5B/gi, '[')
    .replace(/%5D/gi, ']')
};

/**
 * is search params
 * @param val
 * @returns {boolean}
 */
const isURLSearchParams = (val) => {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
};

/**
 * 格式化请求参数
 * @param data
 * @returns {string}
 */
const formatParams = (data) => {
  let arr = []
  for (let name in data) {
    let value = data[name]
    if (isObject(value)) {
      value = JSON.stringify(value)
    }
    arr.push(encode(name) + '=' + encode(value))
  }
  return arr.join('&')
}

/**
 * 合并对象
 * @param a
 * @param b
 * @returns {*}
 */
const merge = (a, b) => {
  for (let key in b) {
    if (!a.hasOwnProperty(key)) {
      a[key] = b[key]
    } else if (isObject(b[key]) && isObject(a[key])) {
      merge(a[key], b[key])
    }
  }
  return a
};

/**
 * foreach object or array
 * @param obj
 * @param fn
 */
const forEach = (obj, fn) => {
  if (obj === null || typeof obj === 'undefined') {
    return;
  }
  if (typeof obj !== 'object') {
    obj = [obj];
  }
  if (Array.isArray(obj)) {
    for (let i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    for (let key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
};

/**
 * check isEmpty object
 * @param object
 * @returns {boolean}
 */
const isEmpty = (object) => {
  let property;
  for (property in object) {
    return false;
  }
  return !property;
};

/**
 * check is null
 * @param obj
 * @returns {boolean}
 */
const isNull = (obj) => {
  return obj == null;
};

export {
  uuid,
  toArray,
  isArray,
  isArrayLike,
  isLength,
  isFunction,
  isObject,
  isObjectLike,
  isPlainObject,
  isString,
  isDocument,
  isJson,
  isWindow,
  each,
  unique,
  extend,
  isFormData,
  encode,
  formatParams,
  merge,
  TypeOf,
  isDate,
  isArrayBuffer,
  isURLSearchParams,
  forEach,
  isEmpty,
  isNull
}
