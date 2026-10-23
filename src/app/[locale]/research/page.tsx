import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { cache, type ReactNode } from 'react';
import type { Metadata } from 'next';
import Markdown, { type Components } from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { isLocale, locales, type Locale } from '../../../i18n/locale';
import 'katex/dist/katex.min.css';
import styles from './research.module.css';

const ARTICLE_FILES: Record<Locale, string> = {
  en: 'research-paper-blog.en.md',
  'zh-TW': 'research-paper-blog.zh-TW.md',
};

const UI: Record<Locale, {
  kicker: string;
  start: string;
  contents: string;
  figureAria: string;
  figureCaption: string;
  leftAgent: string;
  rightAgent: string;
}> = {
  en: {
    kicker: 'A guide to the research',
    start: 'Start reading',
    contents: 'On this page',
    figureAria: 'Three indivisible goods moving between two people along an allocation line.',
    figureCaption: 'One set of goods. More than one idea of fair.',
    leftAgent: 'Person A',
    rightAgent: 'Person B',
  },
  'zh-TW': {
    kicker: '研究導讀',
    start: '開始閱讀',
    contents: '文章章節',
    figureAria: '三件不可分割物品沿著分配線，在兩位參與者之間移動。',
    figureCaption: '同一組物品，不只一種公平。',
    leftAgent: '參與者 A',
    rightAgent: '參與者 B',
  },
};

const readArticle = cache(async (locale: Locale) => {
  const file = path.join(process.cwd(), 'docs', ARTICLE_FILES[locale]);
  const markdown = await readFile(file, 'utf8');
  const header = markdown.match(/^# (.+)\n\n_(.+)_\n\n---\n\n/);

  if (!header) throw new Error(`Invalid research article header: ${file}`);

  const body = markdown.slice(header[0].length);
  const sections = [...body.matchAll(/^## (.+)$/gm)]
    .map((match) => ({ title: match[1], id: headingId(match[1]) }))
    .filter(({ title }) => !['閱讀完整論文', '參考資料', 'Read the full paper', 'References'].includes(title));

  return { title: header[1], description: header[2], body, sections };
});

function headingId(value: string) {
  return value
    .toLocaleLowerCase()
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-|-$/g, '');
}

function headingText(children: ReactNode) {
  return Array.isArray(children) ? children.join('') : String(children);
}

const markdownComponents: Components = {
  h2: ({ children }) => <h2 id={headingId(headingText(children))}>{children}</h2>,
  a: ({ href, children }) => {
    const external = href?.startsWith('http');
    return <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>{children}</a>;
  },
  table: ({ children }) => <div className={styles.tableScroll}><table>{children}</table></div>,
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const resolved = isLocale(locale) ? locale : 'en';
  const article = await readArticle(resolved);
  return {
    title: article.title,
    description: article.description,
  };
}

export default async function ResearchPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolved = isLocale(locale) ? locale : 'en';
  const article = await readArticle(resolved);
  const ui = UI[resolved];

  return (
    <main id="main-content" className={styles.page}>
      <section className={styles.hero} aria-labelledby="research-title">
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>{ui.kicker}</p>
          <h1 id="research-title">{article.title}</h1>
          <p className={styles.dek}>{article.description}</p>
          <a className={styles.startLink} href="#research-article">{ui.start}</a>
        </div>

        <figure className={styles.allocationFigure} aria-label={ui.figureAria}>
          <div className={styles.rule} aria-hidden="true"><i /><span>EF1</span><i /></div>
          <div className={styles.allocationScene} aria-hidden="true">
            <div className={`${styles.agent} ${styles.agentLeft}`}>
              <strong>A</strong>
              <span>{ui.leftAgent}</span>
            </div>
            <div className={styles.goods}>
              <span className={styles.goodOne}>1</span>
              <span className={styles.goodTwo}>2</span>
              <span className={styles.goodThree}>3</span>
            </div>
            <div className={`${styles.agent} ${styles.agentRight}`}>
              <strong>B</strong>
              <span>{ui.rightAgent}</span>
            </div>
          </div>
          <figcaption>{ui.figureCaption}</figcaption>
        </figure>
      </section>

      <div className={styles.readingLayout}>
        <nav className={styles.chapterRail} aria-label={ui.contents}>
          <span>{ui.contents}</span>
          <ol>
            {article.sections.map((section) => (
              <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>
            ))}
          </ol>
        </nav>

        <article id="research-article" className={styles.article}>
          <Markdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={markdownComponents}
          >
            {article.body}
          </Markdown>
        </article>
      </div>
    </main>
  );
}
