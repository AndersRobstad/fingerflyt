#!/usr/bin/env node
/**
 * Dev-time only: builds static/wordlists/{nb,en}.json from the
 * hermitdave/FrequencyWords frequency-ranked corpora (CC BY-SA — see the
 * attribution in README.md). Not part of the runtime bundle; re-run this
 * whenever the word banks need refreshing.
 *
 * Usage: node scripts/build-wordlists.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'static', 'wordlists');
const TARGET_COUNT = 2500;
const MIN_LEN = 2;
const MAX_LEN = 14;

/** A deliberately small, good-faith denylist — not exhaustive. */
const DENYLIST = new Set([
	// Norwegian
	'faen',
	'jævla',
	'jævlig',
	'helvete',
	'kuk',
	'fitte',
	'hore',
	'homo',
	'nigger',
	'neger',
	// English
	'fuck',
	'shit',
	'bitch',
	'cunt',
	'nigger',
	'nigga',
	'whore',
	'rape',
	'porn'
]);

const LANGS = {
	nb: {
		url: 'https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2016/no/no_50k.txt',
		pattern: /^[a-zæøå]+$/
	},
	en: {
		url: 'https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2016/en/en_50k.txt',
		pattern: /^[a-z]+$/
	}
};

async function fetchFrequencyList(url) {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
	return res.text();
}

function processList(raw, pattern) {
	const words = [];
	const seen = new Set();
	for (const line of raw.split('\n')) {
		const spaceIdx = line.indexOf(' ');
		if (spaceIdx === -1) continue;
		const word = line.slice(0, spaceIdx).toLowerCase();
		if (word.length < MIN_LEN || word.length > MAX_LEN) continue;
		if (!pattern.test(word)) continue;
		if (DENYLIST.has(word)) continue;
		if (seen.has(word)) continue;
		seen.add(word);
		words.push(word);
		if (words.length >= TARGET_COUNT) break;
	}
	return words;
}

async function main() {
	await mkdir(OUT_DIR, { recursive: true });
	for (const [lang, { url, pattern }] of Object.entries(LANGS)) {
		process.stdout.write(`Fetching ${lang} from ${url}...\n`);
		const raw = await fetchFrequencyList(url);
		const words = processList(raw, pattern);
		const outPath = path.join(OUT_DIR, `${lang}.json`);
		await writeFile(outPath, JSON.stringify(words), 'utf8');
		process.stdout.write(`Wrote ${words.length} words to ${outPath}\n`);
	}
}

main().catch((err) => {
	console.error(err);
	process.exitCode = 1;
});
