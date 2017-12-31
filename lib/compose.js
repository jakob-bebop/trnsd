"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function compose() {
    var fs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        fs[_i] = arguments[_i];
    }
    return fs.reverse().reduce(function (c, f) { return f(c); });
}
exports.default = compose;
