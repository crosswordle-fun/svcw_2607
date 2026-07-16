import { error } from '@sveltejs/kit';

export function load({ params }: { params: { step?: string } }) {
	const step = Number(params.step);
	if (!Number.isInteger(step) || step < 1 || step > 5) error(404, 'Tutorial step not found');
	return { step };
}
