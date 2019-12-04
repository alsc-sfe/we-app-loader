/*
 * SystemJS named register extension
 * Supports System.register('name', [..deps..], function (_export, _context) { ... })
 *
 * Names are written to the registry as-is
 * System.register('x', ...) can be imported as System.import('x')
 */
(function () {
  const systemJSPrototype = window.System.constructor.prototype;

  const { constructor } = window.System;
  const SystemJS = function () {
    constructor.call(this);
    this.registerRegistry = Object.create(null);
  };
  SystemJS.prototype = systemJSPrototype;
  window.System = new SystemJS();

  const { register } = systemJSPrototype;
  systemJSPrototype.register = function (name, deps, declare) {
    if (typeof name !== 'string') {
      return register.apply(this, arguments);
    }

    this.registerRegistry[name] = [deps, declare];

    this.getRegister();

    // Provide an empty module to signal success.
    // return register.call(this, [], () => { return {} });
  };

  const { resolve } = systemJSPrototype;
  systemJSPrototype.resolve = function (id, parentURL) {
    if ((id[0] === '/' || id[0] === '.') && ((id[1] === '/' || id[1] === '.') && id[2] === '/')) {
      return resolve.call(this, id, parentURL);
    }
    if (id in this.registerRegistry) {
      return id;
    }
    return resolve.call(this, id, parentURL);
  };

  const { instantiate } = systemJSPrototype;
  systemJSPrototype.instantiate = function (url, firstParentUrl) {
    return this.registerRegistry[url] || instantiate.call(this, url, firstParentUrl);
  };
})();
