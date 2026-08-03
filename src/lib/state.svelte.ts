import { parseDiff } from './diff';
import { getSample, type SampleId } from './samples';
import type { SemanticDiff } from './types';

const STORAGE_KEY = 'redline:v1';

export const app = $state({
	view: 'input' as 'input' | 'viewer',
	draftA: '',
	draftB: '',
	json: '',
	error: '',
	diff: null as SemanticDiff | null,
	/** Which built-in sample is on screen, if any (null once you render your own). */
	sampleId: null as SampleId | null
});

export function restore() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return;
		const saved = JSON.parse(raw);
		app.draftA = saved.draftA ?? '';
		app.draftB = saved.draftB ?? '';
		app.json = saved.json ?? '';
		app.diff = saved.diff ?? null;
		app.sampleId = saved.sampleId ?? null;
		app.view = saved.view === 'viewer' && app.diff ? 'viewer' : 'input';
	} catch {
		// A corrupt save never blocks the app.
	}
}

function persist() {
	try {
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({
				view: app.view,
				draftA: app.draftA,
				draftB: app.draftB,
				json: app.json,
				diff: app.diff,
				sampleId: app.sampleId
			})
		);
	} catch {
		// Quota errors etc. — persistence is best-effort.
	}
}

export function renderDiff() {
	try {
		app.diff = parseDiff(app.json);
		app.error = '';
		app.sampleId = null;
		app.view = 'viewer';
		persist();
	} catch (e) {
		app.error = e instanceof Error ? e.message : String(e);
	}
}

export function loadSample(id?: SampleId | string | null) {
	const sample = getSample(id);
	app.draftA = sample.a;
	app.draftB = sample.b;
	app.diff = sample.diff;
	app.json = JSON.stringify(sample.diff, null, 2);
	app.error = '';
	app.sampleId = sample.id;
	app.view = 'viewer';
	persist();
}

export function editInputs() {
	app.view = 'input';
	persist();
}

export function saveInputs() {
	persist();
}
