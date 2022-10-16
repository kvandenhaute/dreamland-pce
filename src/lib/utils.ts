function isSet<T>(value: T | null | undefined): value is T {
	return typeof value !== 'undefined' && value !== null;
}

function typeFilter<T>(arr: Array<T | undefined>): Array<T> {
	return arr.filter(isSet);
}

export default {
	isSet,
	typeFilter
};
