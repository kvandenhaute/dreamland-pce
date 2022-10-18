function generateCodes(): Array<string> {
	const codes: Array<string> = [];
	const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

	for (const letter of letters) {
		for (let i = 0; i < 1000; i++) {
			codes.push(letter + i.toString().padStart(3, '0'));
		}
	}

	return codes;
}

function isSet<T>(value: T | null | undefined): value is T {
	return typeof value !== 'undefined' && value !== null;
}

function typeFilter<T>(arr: Array<T | undefined>): Array<T> {
	return arr.filter(isSet);
}

function wait(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export default {
	generateCodes,
	isSet,
	typeFilter,
	wait
};
