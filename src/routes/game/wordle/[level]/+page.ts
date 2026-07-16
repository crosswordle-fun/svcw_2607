import { error } from '@sveltejs/kit';

export function load({ params }: { params: { level?: string } }) {
	const level = Number(params.level);
	if (!Number.isInteger(level) || level < 1) error(404, 'Wordle level not found');
	return { level };
}
