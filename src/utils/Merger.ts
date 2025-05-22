export const MergeUsers = (
    users: Map<number, string>,
    maxChunkLength: number = 2000 // Made it a parameter with a default
): string[] => {
    // 1. Get all user strings
    const userStrings = Array.from(users.values()).map(user => String(user));

    // Handle empty input
    if (userStrings.length === 0) {
        return [];
    }

    const chunks: string[] = [];
    let currentChunk = "";

    for (let i = 0; i < userStrings.length; i++) {
        const user = userStrings[i] || "";

        if (currentChunk === "") {
            // If currentChunk is empty, this is the first user for this chunk (or the very first user overall)
            // A single user string can exceed maxChunkLength if it's very long.
            // In this case, it will be the only item in its chunk.
            currentChunk = user;
        } else {
            // Calculate the length if we add a newline and the next user
            // Newline character itself has a length of 1.
            const potentialLength = currentChunk.length + 1 + user.length;

            if (potentialLength <= maxChunkLength) {
                // It fits, so add it to the current chunk
                currentChunk += '\n' + user;
            } else {
                // It doesn't fit.
                // 1. Finalize the current chunk and add it to the chunks array.
                chunks.push(currentChunk);
                // 2. Start a new chunk with the current user.
                currentChunk = user;
            }
        }
    }

    // After the loop, there might be a pending currentChunk that hasn't been pushed.
    // This happens if the loop finishes and the last set of users fit into currentChunk.
    if (currentChunk !== "") {
        chunks.push(currentChunk);
    }

    return chunks;
};