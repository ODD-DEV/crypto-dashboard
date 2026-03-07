import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDir = path.join(process.cwd(), 'content/strategies');

export interface StrategyContent {
  title: string;
  description: string;
  content: string;
}

export function getStrategyContent(slug: string, locale: string): StrategyContent | null {
  const filePath = path.join(contentDir, locale, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);

  return {
    title: data.title,
    description: data.description,
    content,
  };
}
