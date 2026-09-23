// Контракты данных между этапами дайджест-пайплайна:
// news-scout -> writer -> cover-artist -> page-builder.
// В ПР-1 реализованы только заглушки на fixtures.json (см. scripts/run-digest-stub.mjs).

export interface NewsSource {
	url: string;
	title: string;
}

// Результат этапа news-scout: одна кандидатная тема с минимум двумя источниками.
export interface NewsTheme {
	id: string;
	title: string;
	summary: string;
	primarySource: NewsSource;
	secondarySource: NewsSource;
	tags: string[];
}

// Результат этапа writer: черновик статьи, собранный по теме и источникам.
export interface ArticleDraft {
	themeId: string;
	title: string;
	description: string;
	pubDate: string; // YYYY-MM-DD
	source: string;
	tags: string[];
	body: string;
	slug: string; // латиница/транслит, часть имени файла
}

// Результат этапа cover-artist: URL обложки под тему.
export interface CoverResult {
	themeId: string;
	url: string;
}

// Результат этапа page-builder: финальные frontmatter и имя файла статьи.
export interface PipelineResult {
	fileName: string; // YYYY-MM-DD-<latin-slug>.md
	frontmatter: {
		title: string;
		description: string;
		pubDate: string;
		cover: string;
		source: string;
		tags: string[];
	};
	body: string;
}
