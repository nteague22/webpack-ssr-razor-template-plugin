"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WebpackTemplatePlugin = exports.ComponentWithReduxModule = exports.ComponentModule = exports.IPluginTemplateOptions = void 0;

var _webpack = require("webpack");

var _react = _interopRequireWildcard(require("react"));

var _reactRedux = require("react-redux");

var _redux = require("redux");

var _server = _interopRequireDefault(require("react-dom/server"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _util = _interopRequireDefault(require("util"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _createForOfIteratorHelper(o) { if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) { var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var it, normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Plugin options for each template type to build
 */
var IPluginTemplateOptions = {
  /** @type {ComponentWithReduxModule[]} */
  templates: [],

  /** @type {ComponentModule[]} */
  basicTemplates: [],
  templatePath: "",
  templateExtension: "",
  templateName: "",
  modelPath: "",
  modelName: "",
  modelNamespace: ""
};
/**
 * A component module that is simple and does not need redux or state
 */

exports.IPluginTemplateOptions = IPluginTemplateOptions;

var ComponentModule = function ComponentModule(_ref) {
  var _ref$component = _ref.component,
      component = _ref$component === void 0 ? null : _ref$component,
      _ref$name = _ref.name,
      name = _ref$name === void 0 ? "" : _ref$name;

  _classCallCheck(this, ComponentModule);

  /** @type{React.Component | React.ReactElement} */
  this.component = component;
  /** @type {string} */

  this.name = name;
};
/**
 * A component module that uses redux and needs the initial state to reliably generate the SSR output
 */


exports.ComponentModule = ComponentModule;

var ComponentWithReduxModule = function ComponentWithReduxModule(_ref2) {
  var _ref2$component = _ref2.component,
      component = _ref2$component === void 0 ? null : _ref2$component,
      _ref2$model = _ref2.model,
      model = _ref2$model === void 0 ? {} : _ref2$model,
      _ref2$reducers = _ref2.reducers,
      reducers = _ref2$reducers === void 0 ? {} : _ref2$reducers,
      _ref2$name = _ref2.name,
      name = _ref2$name === void 0 ? "" : _ref2$name;

  _classCallCheck(this, ComponentWithReduxModule);

  /** @type {import("react").ReactElement|Component} */
  this.component = component;
  this.model = model;
  /** @type {import("redux").ReducersMapObject} */

  this.reducers = reducers;
  /** @type {string} */

  this.name = name;
};

exports.ComponentWithReduxModule = ComponentWithReduxModule;

var WebpackTemplatePlugin = /*#__PURE__*/function () {
  /**
   * Builds a new plugin instance
   * @param {IPluginTemplateOptions} options the file options 
   */
  function WebpackTemplatePlugin(options) {
    _classCallCheck(this, WebpackTemplatePlugin);

    this.options = options;
  }
  /**
   * hooks in plugin
   * @param {import('webpack').Compiler} compiler the running compiler to hook into
   */


  _createClass(WebpackTemplatePlugin, [{
    key: "apply",
    value: function apply(compiler) {
      var _this = this;

      var _this$options = this.options,
          outputTemplatePattern = _this$options.outputTemplatePattern,
          templateName = _this$options.templateName,
          templatePath = _this$options.templatePath,
          templatePattern = _this$options.templatePattern,
          useFilenameForOutput = _this$options.useFilenameForOutput;
      compiler.hooks.done.tapPromise("Building ".concat(this.options.templateName, " Template"), function (stat) {
        var ops = [];

        var _iterator = _createForOfIteratorHelper(_this.options.templates),
            _step;

        try {
          var _loop = function _loop() {
            var tmp = _step.value;

            var redcr = _redux.combineReducers.apply(void 0, _toConsumableArray(tmp.reducers));

            var store = (0, _redux.createStore)(redcr, redcr({}, null), (0, _redux.applyMiddleware)({}));

            var render = /*#__PURE__*/_react["default"].createElement(_reactRedux.Provider, {
              store: store
            }, (0, _react.createElement)(tmp.component)); // for a redux backed template, we build out the razor template as well as the view model


            ops.push(new Promise(function (resolve, reject) {
              _fs["default"].writeFile(_path["default"].resolve(_this.options.templatePath, tmp.name, _this.options.templateExtension), _server["default"].renderToString(render), function (err) {
                if (err) {
                  reject(err.message + "\n" + err.stack);
                }

                resolve();
              });
            })); // Using the generated suffix to ensure developer expectations for created files

            ops.push(new Promise(function (resolve, reject) {
              _fs["default"].writeFile(_path["default"].resolve(_this.options.modelPath, "".concat(_this.options.modelName, ".generated.cs")), buildComponentPropsToViewModel(tmp.model, _this.options.modelName, _this.options.modelNamespace), function (err) {
                if (err) {
                  reject("".concat(err.message, "\n").concat(err.stack));
                }

                resolve();
              });
            }));
          };

          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            _loop();
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        var _iterator2 = _createForOfIteratorHelper(_this.options.basicTemplates),
            _step2;

        try {
          var _loop2 = function _loop2() {
            var basic = _step2.value;
            var outputComp = (0, _react.createElement)(basic.component);
            ops.push(new Promise(function (resolve, reject) {
              _fs["default"].writeFile(_path["default"].resolve(_this.options.templatePath, basic.name, _this.options.templateExtension), _server["default"].renderToString(outputComp), function (err) {
                if (err) {
                  reject(err.message + '\n' + err.stack);
                }

                resolve();
              });
            }));
          };

          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            _loop2();
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }

        return Promise.all(ops);
      });
    }
  }, {
    key: "buildComponentPropsToViewModel",
    value: function buildComponentPropsToViewModel(jsModel, viewModelName, namespace) {
      var propertyDefs = [];

      for (var _i = 0, _Object$keys = Object.keys(jsModel); _i < _Object$keys.length; _i++) {
        var pr = _Object$keys[_i];
        var prType = "Object";
        var prName = pr;

        if (/^[a-z]+/.test(pr)) {
          prName = pr[0].toLocaleUpperCase() + pr.substring(1);
        }

        prName = prName.replace(/([a-zA-Z])\-([a-zA-Z])/, "$1$2");

        switch (_typeof(jsModel[pr])) {
          case "string":
            prType = "string";
            break;

          case "boolean":
            prType = "bool";
            break;

          case "number":
            if (/\./.test(jsModel[pr].toString())) {
              prType = "decimal";
              break;
            }

            prType = "int";
            break;

          default:
            if (_util["default"].types.isDate(jsModel[pr])) {
              prType = "DateTime";
              break;
            }

        }

        propertyDefs.push("public ".concat(prType, " ").concat(prName, " { get; set; }"));
      }

      var outPut = "";

      if (namespace) {
        output += "namespace ".concat(namespace, " {\n");
      }

      outPut += "public class ".concat(viewModelName, " {\n ").concat(propertyDefs.join("\n"), "\n}");

      if (namespace) {
        outPut += "\n}\n";
      }

      return outPut;
    }
  }]);

  return WebpackTemplatePlugin;
}();

exports.WebpackTemplatePlugin = WebpackTemplatePlugin;