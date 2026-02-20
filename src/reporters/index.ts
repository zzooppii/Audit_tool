import { Finding } from '../types';
import { reportConsole } from './console';
import { reportJson } from './json';
import { reportMarkdown } from './markdown';

export async function reportFindings(
  findings: Finding[],
  options: { format: string; outputPath?: string }
) {
  const { format, outputPath } = options;

  switch (format) {
    case 'json':
      reportJson(findings, outputPath);
      break;
    case 'markdown':
      reportMarkdown(findings, outputPath);
      break;
    case 'console':
    default:
      reportConsole(findings);
      break;
  }
}