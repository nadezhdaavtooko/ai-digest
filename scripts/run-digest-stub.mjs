// Локальный прогон заглушек пайплайна: news-scout -> writer -> cover-artist -> page-builder.
// Работает только на src/lib/pipeline/fixtures.json, без обращений к Tavily/Replicate/сети.
// Использование: node scripts/run-digest-stub.mjs

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const fixturesPath = path.join(projectRoot, 'src/lib/pipeline/fixtures.json');
const outDir = path.join(projectRoot, 'tmp');
const outFile = path.join(outDir, 'test-article.md');

const TRANSLIT_MAP = {
	а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
	и: 'i', й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
	с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch',
	ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

function slugify(title) {
	const transliterated = title
		.toLowerCase()
		.split('')
		.map((char) => TRANSLIT_MAP[char] ?? char)
		.join('');
	return transliterated
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

// Этап news-scout (stub): темы берутся из fixtures.json, без Tavily.
function newsScoutStub(fixtures) {
	if (!Array.isArray(fixtures.themes) || fixtures.themes.length < 3 || fixtures.themes.length > 5) {
		throw new Error(`news-scout stub: ожидалось 3-5 тем, получено ${fixtures.themes?.length ?? 0}`);
	}
	for (const theme of fixtures.themes) {
		if (!theme.primarySource?.url || !theme.secondarySource?.url) {
			throw new Error(`news-scout stub: у темы "${theme.id}" нет двух источников`);
		}
	}
	return fixtures.themes;
}

// Этап writer (stub): собирает ArticleDraft из темы; тело — плейсхолдер.
function writerStub(theme, pubDate) {
	return {
		themeId: theme.id,
		title: theme.title,
		description: theme.summary,
		pubDate,
		source: theme.primarySource.url,
		tags: theme.tags,
		body: `Плейсхолдер тела статьи по теме "${theme.title}". Реальный текст появится после интеграции с Tavily.`,
		slug: slugify(theme.title),
	};
}

// Этап cover-artist (stub): возвращает тестовый URL обложки, без Replicate.
function coverArtistStub(theme, fixtures) {
	return { themeId: theme.id, url: fixtures.coverUrl };
}

// Этап page-builder (stub): финальные frontmatter и имя файла; без git/gh.
function pageBuilderStub(draft, cover) {
	const required = {
		title: draft.title,
		description: draft.description,
		pubDate: draft.pubDate,
		cover: cover.url,
		source: draft.source,
	};
	for (const [field, value] of Object.entries(required)) {
		if (!value) {
			throw new Error(`page-builder stub: обязательное поле "${field}" пустое`);
		}
	}

	const fileName = `${draft.pubDate}-${draft.slug}.md`;
	if (!/^\d{4}-\d{2}-\d{2}-[a-z0-9-]+\.md$/.test(fileName)) {
		throw new Error(`page-builder stub: имя файла не соответствует формату YYYY-MM-DD-<latin-slug>.md: ${fileName}`);
	}

	return {
		fileName,
		frontmatter: {
			title: draft.title,
			description: draft.description,
			pubDate: draft.pubDate,
			cover: cover.url,
			source: draft.source,
			tags: draft.tags,
		},
		body: draft.body,
	};
}

function yamlString(value) {
	return `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function toFrontmatterMarkdown(result) {
	const fm = result.frontmatter;
	const tags = `[${fm.tags.join(', ')}]`;
	const lines = [
		'---',
		`title: ${yamlString(fm.title)}`,
		`description: ${yamlString(fm.description)}`,
		`pubDate: ${fm.pubDate}`,
		`cover: ${fm.cover}`,
		`source: ${fm.source}`,
		`tags: ${tags}`,
		'---',
		'',
		result.body,
		'',
	];
	return lines.join('\n');
}

function run() {
	const fixtures = JSON.parse(readFileSync(fixturesPath, 'utf-8'));
	const today = new Date().toISOString().slice(0, 10);

	// Прогон всех тем из fixtures.json через writer -> cover-artist -> page-builder.
	const themes = newsScoutStub(fixtures);
	const results = themes.map((theme) => {
		const draft = writerStub(theme, today);
		const cover = coverArtistStub(theme, fixtures);
		return pageBuilderStub(draft, cover);
	});

	console.log(`news-scout stub: получено ${themes.length} тем`);
	for (const result of results) {
		console.log(`  - ${result.fileName}`);
	}

	// Готовый пример ArticleDraft из fixtures.json проходит те же этапы cover-artist -> page-builder.
	const exampleDraft = fixtures.exampleArticle;
	const exampleCover = coverArtistStub({ id: exampleDraft.themeId }, fixtures);
	const exampleResult = pageBuilderStub(exampleDraft, exampleCover);

	mkdirSync(outDir, { recursive: true });
	writeFileSync(outFile, toFrontmatterMarkdown(exampleResult), 'utf-8');

	console.log(`\nПример статьи записан: ${path.relative(projectRoot, outFile)}`);
	console.log(`Имя файла по контракту: ${exampleResult.fileName}`);
	console.log('Все проверки контрактов и frontmatter пройдены.');
}

run();
