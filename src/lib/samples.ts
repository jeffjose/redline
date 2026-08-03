import type { SemanticDiff } from './types';

export type SampleId = 'light' | 'medium' | 'heavy';

export interface Sample {
	id: SampleId;
	name: string;
	blurb: string;
	a: string;
	b: string;
	diff: SemanticDiff;
}

/* ------------------------------------------------------------------ light */

const lightA = `Thanks for taking the time to review the proposal last week. I know everyone's schedules are packed right now. I've gone ahead and incorporated most of your suggestions into the new draft. The updated version is attached. Let me know if you'd like to walk through the changes together.`;

const lightB = `Thanks for taking the time to review the proposal last week. I've incorporated most of your suggestions into the new draft. The updated version is attached. Let me know if you'd like to walk through the changes together.`;

const lightDiff: SemanticDiff = {
	meta: { title: 'Follow-up email — light copyedit' },
	source: {
		label: 'Draft A · yours',
		segments: [
			{
				id: 'a1',
				paragraph: 1,
				text: 'Thanks for taking the time to review the proposal last week.'
			},
			{ id: 'a2', paragraph: 1, text: "I know everyone's schedules are packed right now." },
			{
				id: 'a3',
				paragraph: 1,
				text: "I've gone ahead and incorporated most of your suggestions into the new draft."
			},
			{ id: 'a4', paragraph: 1, text: 'The updated version is attached.' },
			{
				id: 'a5',
				paragraph: 1,
				text: "Let me know if you'd like to walk through the changes together."
			}
		]
	},
	target: {
		label: 'Draft B · edited',
		segments: [
			{
				id: 'b1',
				paragraph: 1,
				text: 'Thanks for taking the time to review the proposal last week.'
			},
			{
				id: 'b2',
				paragraph: 1,
				text: "I've incorporated most of your suggestions into the new draft."
			},
			{ id: 'b3', paragraph: 1, text: 'The updated version is attached.' },
			{
				id: 'b4',
				paragraph: 1,
				text: "Let me know if you'd like to walk through the changes together."
			}
		]
	},
	links: [
		{ kind: 'unchanged', sources: ['a1'], targets: ['b1'] },
		{
			kind: 'deleted',
			sources: ['a2'],
			targets: [],
			why: 'Cuts the scheduling nicety.',
			impact: 'Gets to the point a sentence sooner.'
		},
		{
			kind: 'reworded',
			sources: ['a3'],
			targets: ['b2'],
			why: 'Trims "gone ahead and".',
			impact: 'Same message, less hedging.'
		},
		{ kind: 'unchanged', sources: ['a4'], targets: ['b3'] },
		{ kind: 'unchanged', sources: ['a5'], targets: ['b4'] }
	],
	summary:
		'A light copyedit: one filler sentence cut and one hedge trimmed; everything else left alone.'
};

/* ----------------------------------------------------------------- medium */

const mediumA = `Last spring, our team shipped the new onboarding flow in under six weeks. It was a chaotic sprint, and honestly we cut a few corners to hit the date. The redesign reduced signup drop-off by nearly forty percent.

We started by interviewing twenty churned users. Their feedback was blunt and occasionally painful to hear. Most of them never understood what the product actually did. So we rewrote every screen around a single question: what can you do here in the first minute?`;

const mediumB = `The redesign cut signup drop-off by nearly forty percent. Last spring, our team shipped the new onboarding flow in under six weeks.

We began by interviewing twenty users who had churned. Most of them never understood what the product actually did. Their feedback was blunt. So we rewrote every screen around a single question. What can you do here in the first minute?

That constraint, more than any visual polish, is what moved the number.`;

const mediumDiff: SemanticDiff = {
	meta: { title: 'Onboarding retro — editor pass' },
	source: {
		label: 'Draft A · yours',
		segments: [
			{
				id: 'a1',
				paragraph: 1,
				text: 'Last spring, our team shipped the new onboarding flow in under six weeks.'
			},
			{
				id: 'a2',
				paragraph: 1,
				text: 'It was a chaotic sprint, and honestly we cut a few corners to hit the date.'
			},
			{
				id: 'a3',
				paragraph: 1,
				text: 'The redesign reduced signup drop-off by nearly forty percent.'
			},
			{ id: 'a4', paragraph: 2, text: 'We started by interviewing twenty churned users.' },
			{
				id: 'a5',
				paragraph: 2,
				text: 'Their feedback was blunt and occasionally painful to hear.'
			},
			{
				id: 'a6',
				paragraph: 2,
				text: 'Most of them never understood what the product actually did.'
			},
			{
				id: 'a7',
				paragraph: 2,
				text: 'So we rewrote every screen around a single question: what can you do here in the first minute?'
			}
		]
	},
	target: {
		label: 'Draft B · edited',
		segments: [
			{
				id: 'b1',
				paragraph: 1,
				text: 'The redesign cut signup drop-off by nearly forty percent.'
			},
			{
				id: 'b2',
				paragraph: 1,
				text: 'Last spring, our team shipped the new onboarding flow in under six weeks.'
			},
			{ id: 'b3', paragraph: 2, text: 'We began by interviewing twenty users who had churned.' },
			{
				id: 'b4',
				paragraph: 2,
				text: 'Most of them never understood what the product actually did.'
			},
			{ id: 'b5', paragraph: 2, text: 'Their feedback was blunt.' },
			{ id: 'b6', paragraph: 2, text: 'So we rewrote every screen around a single question.' },
			{ id: 'b7', paragraph: 2, text: 'What can you do here in the first minute?' },
			{
				id: 'b8',
				paragraph: 3,
				text: 'That constraint, more than any visual polish, is what moved the number.'
			}
		]
	},
	links: [
		{
			kind: 'moved+reworded',
			sources: ['a3'],
			targets: ['b1'],
			why: 'Leads with the strongest fact instead of burying it after the anecdote.',
			impact: 'The reader is hooked by the result before hearing the process.'
		},
		{ kind: 'unchanged', sources: ['a1'], targets: ['b2'] },
		{
			kind: 'deleted',
			sources: ['a2'],
			targets: [],
			why: 'Cuts the self-undermining aside about corner-cutting.',
			impact: 'Preserves authority; the chaos admission weakened the claim beside it.'
		},
		{
			kind: 'reworded',
			sources: ['a4'],
			targets: ['b3'],
			why: '"Began" and "users who had churned" — more precise, slightly more formal.',
			impact: 'Matches the register of the new outcome-first opening.'
		},
		{
			kind: 'moved',
			sources: ['a6'],
			targets: ['b4'],
			why: 'Promotes the key research finding above the color commentary.',
			impact: 'The reader gets the insight before the team’s feelings about it.'
		},
		{
			kind: 'reworded',
			sources: ['a5'],
			targets: ['b5'],
			why: 'Trims "occasionally painful to hear".',
			impact: 'Keeps the punch of "blunt" without dwelling on the team.'
		},
		{
			kind: 'split',
			sources: ['a7'],
			targets: ['b6', 'b7'],
			why: 'One long compound sentence becomes a setup and a punchline.',
			impact: 'The guiding question now lands as its own beat.'
		},
		{
			kind: 'inserted',
			sources: [],
			targets: ['b8'],
			why: 'New closing ties the method back to the metric.',
			impact: 'Gives the piece an argument, not just a chronology.'
		}
	],
	summary:
		'The editor restructured the piece to lead with the outcome, cut self-undermining asides, tightened wordy sentences, and added a closing line that turns a chronology into an argument.'
};

/* ------------------------------------------------------------------ heavy */

const heavyA = `Two years ago, we started building Meridian because our own team kept losing track of decisions buried in chat threads. We tried every tool on the market first, and none of them stuck. Today, we're finally ready to show you what we've been working on.

Meridian is a decision log that lives inside your existing tools. It watches Slack, email, and docs for moments that look like decisions. When it finds one, it asks the people involved to confirm it in one click. Confirmed decisions become a searchable, permanent record.

We know launch posts usually oversell things, so we want to be honest about limitations. Meridian currently only supports English. Pricing starts at eight dollars per seat, and there's a free tier for teams under ten people.`;

const heavyB = `Meridian is a decision log that lives inside your existing tools. It watches Slack, email, and docs for moments that look like decisions, then asks the people involved to confirm them in one click. Confirmed decisions become a searchable, permanent record.

We built it because our own team kept losing decisions in chat threads. Two years and one graveyard of abandoned tools later, we think we've found the shape that sticks.

A few honest limitations: it's English-only for now. Pricing starts at eight dollars per seat, with a free tier for teams under ten. If your team has ever asked "wait, when did we decide that?" — Meridian is for you.`;

const heavyDiff: SemanticDiff = {
	meta: { title: 'Launch post — full restructure' },
	source: {
		label: 'Draft A · yours',
		segments: [
			{
				id: 'a1',
				paragraph: 1,
				text: 'Two years ago, we started building Meridian because our own team kept losing track of decisions buried in chat threads.'
			},
			{
				id: 'a2',
				paragraph: 1,
				text: 'We tried every tool on the market first, and none of them stuck.'
			},
			{
				id: 'a3',
				paragraph: 1,
				text: "Today, we're finally ready to show you what we've been working on."
			},
			{
				id: 'a4',
				paragraph: 2,
				text: 'Meridian is a decision log that lives inside your existing tools.'
			},
			{
				id: 'a5',
				paragraph: 2,
				text: 'It watches Slack, email, and docs for moments that look like decisions.'
			},
			{
				id: 'a6',
				paragraph: 2,
				text: 'When it finds one, it asks the people involved to confirm it in one click.'
			},
			{
				id: 'a7',
				paragraph: 2,
				text: 'Confirmed decisions become a searchable, permanent record.'
			},
			{
				id: 'a8',
				paragraph: 3,
				text: 'We know launch posts usually oversell things, so we want to be honest about limitations.'
			},
			{ id: 'a9', paragraph: 3, text: 'Meridian currently only supports English.' },
			{
				id: 'a10',
				paragraph: 3,
				text: "Pricing starts at eight dollars per seat, and there's a free tier for teams under ten people."
			}
		]
	},
	target: {
		label: 'Draft B · edited',
		segments: [
			{
				id: 'b1',
				paragraph: 1,
				text: 'Meridian is a decision log that lives inside your existing tools.'
			},
			{
				id: 'b2',
				paragraph: 1,
				text: 'It watches Slack, email, and docs for moments that look like decisions, then asks the people involved to confirm them in one click.'
			},
			{
				id: 'b3',
				paragraph: 1,
				text: 'Confirmed decisions become a searchable, permanent record.'
			},
			{
				id: 'b4',
				paragraph: 2,
				text: 'We built it because our own team kept losing decisions in chat threads.'
			},
			{
				id: 'b5',
				paragraph: 2,
				text: "Two years and one graveyard of abandoned tools later, we think we've found the shape that sticks."
			},
			{
				id: 'b6',
				paragraph: 3,
				text: "A few honest limitations: it's English-only for now."
			},
			{
				id: 'b7',
				paragraph: 3,
				text: 'Pricing starts at eight dollars per seat, with a free tier for teams under ten.'
			},
			{
				id: 'b8',
				paragraph: 3,
				text: 'If your team has ever asked "wait, when did we decide that?" — Meridian is for you.'
			}
		]
	},
	links: [
		{
			kind: 'moved',
			sources: ['a4'],
			targets: ['b1'],
			why: 'The product definition now opens the post — no origin-story windup.',
			impact: 'A reader who gives you one sentence learns what Meridian is.'
		},
		{
			kind: 'merged',
			sources: ['a5', 'a6'],
			targets: ['b2'],
			why: 'Two mechanical steps become one continuous motion.',
			impact: 'The "how" fits in a single breath; the paragraph reads faster.'
		},
		{ kind: 'unchanged', sources: ['a7'], targets: ['b3'] },
		{
			kind: 'moved+reworded',
			sources: ['a1'],
			targets: ['b4'],
			why: 'Origin story demoted below the product and stripped to its point.',
			impact: 'Context now supports the pitch instead of delaying it.'
		},
		{
			kind: 'moved+reworded',
			sources: ['a2'],
			targets: ['b5'],
			why: 'The failed-tools aside becomes a punchy credibility beat.',
			impact: 'Signals experience without listing grievances.'
		},
		{
			kind: 'deleted',
			sources: ['a3'],
			targets: [],
			why: 'Cuts the "finally ready to show you" throat-clearing.',
			impact: 'The post starts at the product, not at the podium.'
		},
		{
			kind: 'merged',
			sources: ['a8', 'a9'],
			targets: ['b6'],
			why: 'The apology for honesty is folded into the honesty itself.',
			impact: 'Limitations land as confidence, not preemptive defense.'
		},
		{
			kind: 'reworded',
			sources: ['a10'],
			targets: ['b7'],
			why: 'Tightens the free-tier clause.',
			impact: 'Same facts, fewer words.'
		},
		{
			kind: 'inserted',
			sources: [],
			targets: ['b8'],
			why: "New closing names the reader's pain verbatim.",
			impact: 'Ends on recognition — the reader self-selects.'
		}
	],
	summary:
		'A full restructure: the product now leads, the origin story is demoted and compressed, the mechanics and the limitations are each merged into single sentences, throat-clearing is cut, and a new closing hook speaks directly to the reader.'
};

/* ------------------------------------------------------------------------ */

export const SAMPLES: Sample[] = [
	{
		id: 'light',
		name: 'light',
		blurb: 'A light copyedit — one cut, one trim',
		a: lightA,
		b: lightB,
		diff: lightDiff
	},
	{
		id: 'medium',
		name: 'medium',
		blurb: 'An editor pass — moves, rewords, a split, a cut, an insert',
		a: mediumA,
		b: mediumB,
		diff: mediumDiff
	},
	{
		id: 'heavy',
		name: 'heavy',
		blurb: 'A full restructure — reordering, merges, and a new close',
		a: heavyA,
		b: heavyB,
		diff: heavyDiff
	}
];

export function getSample(id: string | null | undefined): Sample {
	return SAMPLES.find((s) => s.id === id) ?? SAMPLES[1];
}
