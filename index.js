"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var memory_fs_1 = __importDefault(require("memory-fs"));
var eval_1 = __importDefault(require("eval"));
var fs_1 = __importDefault(require("fs"));
module.exports = (_a = /** @class */ (function () {
        function StaticSiteWebpackPlugin(options) {
            if (!options.__filename) {
                throw new Error("StaticSiteWebpackPlugin: __filename must be provided");
            }
            this.options = __assign(__assign({}, StaticSiteWebpackPlugin.defaultOptions), options);
        }
        StaticSiteWebpackPlugin.prototype.apply = function (compiler) {
            var _this = this;
            var pluginName = StaticSiteWebpackPlugin.name;
            compiler.hooks.thisCompilation.tap(pluginName, function (compilation) {
                compilation.hooks.optimizeAssets.tapPromise(pluginName, _this.run.bind(_this, compiler, compilation));
            });
        };
        StaticSiteWebpackPlugin.prototype.run = function (compiler, compilation) {
            return __awaiter(this, void 0, void 0, function () {
                var webpack, RawSource, render, _i, _a, _b, path, content;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            webpack = compiler.webpack;
                            RawSource = webpack.sources.RawSource;
                            return [4 /*yield*/, this.getRenderFunction(webpack, compilation)];
                        case 1:
                            render = _c.sent();
                            for (_i = 0, _a = this.renderPages(compilation.getStats(), render); _i < _a.length; _i++) {
                                _b = _a[_i], path = _b[0], content = _b[1];
                                compilation.assets[path] = new RawSource(content);
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        StaticSiteWebpackPlugin.prototype.getRenderFunction = function (webpack, compilation) {
            return __awaiter(this, void 0, void 0, function () {
                var ssrEntry, render;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.compileSsrBundle(webpack, compilation)];
                        case 1:
                            ssrEntry = _a.sent();
                            render = (0, eval_1.default)(ssrEntry, this.options.entry, this.options.globals, true);
                            if ('default' in render) {
                                render = render.default;
                            }
                            if (typeof render !== 'function') {
                                throw new Error("Export from " + this.options.entry + " must be a function returning an HTML string");
                            }
                            return [2 /*return*/, render];
                    }
                });
            });
        };
        StaticSiteWebpackPlugin.prototype.renderPages = function (webpackStats, render) {
            return this.options.paths.map(function (path) { return [
                path.endsWith('.html') ? path : path.replace(/\/$/, '') + "/index.html",
                render({ path: path, webpackStats: webpackStats }),
            ]; });
        };
        StaticSiteWebpackPlugin.prototype.compileSsrBundle = function (webpack, compilation) {
            return __awaiter(this, void 0, void 0, function () {
                var compiler, fs;
                return __generator(this, function (_a) {
                    compiler = webpack(this.createSsrWebpackConfig(compilation.options));
                    fs = new memory_fs_1.default();
                    compiler.outputFileSystem = fs;
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            compiler.run(function (err, stats) {
                                if (err) {
                                    return reject(err);
                                }
                                if (stats === null || stats === void 0 ? void 0 : stats.hasErrors()) {
                                    var message = stats.toString({
                                        errorDetails: true,
                                        warnings: true,
                                    });
                                    return reject(new Error(message));
                                }
                                resolve(fs.data.dist['bundle.js'].toString());
                            });
                        })];
                });
            });
        };
        StaticSiteWebpackPlugin.prototype.createSsrWebpackConfig = function (browserWebpackConfig) {
            var _a;
            var _b = this.options, entry = _b.entry, overrideConfig = _b.overrideConfig;
            var clientConfig = require(this.options.__filename);
            var ssrConfig = __assign(__assign({}, clientConfig), { target: 'node', entry: entry, output: __assign(__assign({}, clientConfig.output), { path: '/dist', filename: 'bundle.js', libraryTarget: 'commonjs' }) });
            ssrConfig.plugins = (_a = ssrConfig.plugins) === null || _a === void 0 ? void 0 : _a.filter(function (plugin) { return !(plugin instanceof StaticSiteWebpackPlugin); });
            // this.dumpConfig(ssrConfig);
            return overrideConfig ? overrideConfig(ssrConfig) : ssrConfig;
        };
        StaticSiteWebpackPlugin.prototype.dump = function (config, filename) {
            if (filename === void 0) { filename = '/tmp/config.json'; }
            fs_1.default.writeFileSync(filename, JSON.stringify(config, null, 2));
        };
        return StaticSiteWebpackPlugin;
    }()),
    _a.defaultOptions = {
        __filename: null,
        paths: ['/'],
        entry: './src/index.ssr.js',
        globals: {},
        overrideConfig: null,
    },
    _a);
