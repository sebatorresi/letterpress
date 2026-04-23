import { writeFileSync } from 'fs';
import { join } from 'path';
import { generateCSS } from '../src/letterpress.ts';

const outputPath = join(process.cwd(), 'src', 'letterpress.css');
const css = generateCSS();
writeFileSync(outputPath, css, 'utf-8');
console.log(`Generated ${outputPath}`);
