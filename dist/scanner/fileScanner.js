"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanFiles = scanFiles;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const glob_1 = __importDefault(require("glob"));
function scanFiles(paths, exclude = []) {
    const allFiles = [];
    paths.forEach((pattern) => {
        let globPattern = pattern;
        if (fs_1.default.existsSync(pattern)) {
            const stat = fs_1.default.statSync(pattern);
            if (stat.isDirectory()) {
                globPattern = path_1.default.join(pattern, '**/*');
            }
        }
        const files = glob_1.default.sync(globPattern, {
            nodir: true,
            ignore: exclude,
            absolute: true,
        });
        allFiles.push(...files);
    });
    return Array.from(new Set(allFiles));
}
