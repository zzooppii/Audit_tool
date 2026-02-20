export function classifyFiles(files: string[]): Record<string, string[]> {
  const result: Record<string, string[]> = {
    solidity: [],
    typescript: [],
    javascript: [],
    python: [],
    unknown: [],
  };

  files.forEach((file) => {
    if (file.endsWith('.sol')) {
      result.solidity.push(file);
    } else if (file.endsWith('.ts')) {
      result.typescript.push(file);
    } else if (file.endsWith('.js')) {
      result.javascript.push(file);
    } else if (file.endsWith('.py')) {
      result.python.push(file);
    } else {
      result.unknown.push(file);
    }
  });

  return result;
}