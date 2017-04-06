export function fail(message) {
    throw new Error(message);
}

// Precondition function that checks if the given predicate is true.
// If not, it will throw an error.
export function checkArgument(predicate, message) {
    if (!predicate) {
        fail(message);
    }
}
