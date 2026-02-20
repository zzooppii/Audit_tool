import fs from 'fs';
import path from 'path';
import glob from 'glob';

export function scanFiles(paths: string[], exclude: string[] = []): string[] {
  const allFiles: string[] = [];

  paths.forEach((pattern) => {
    let globPattern = pattern;

    if (fs.existsSync(pattern)) {
      const stat = fs.statSync(pattern);
      if (stat.isDirectory()) {
        globPattern = path.join(pattern, '**/*');
      }
    }

    const files = glob.sync(globPattern, {
      nodir: true,
      ignore: exclude,
      absolute: true,
    });

    allFiles.push(...files);
  });

  return Array.from(new Set(allFiles));
}