"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfig = void 0;
exports.defaultConfig = {
    paths: ['.'],
    tests: [],
    exclude: ['node_modules/**'],
    networks: [],
    rules: {},
    report: {
        format: 'console',
    },
    accessControl: {
        modifiers: ['onlyOwner', 'onlyAdmin', 'onlyRole', 'authorized'],
    },
};
