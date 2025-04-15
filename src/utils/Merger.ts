
export const MergeUsers = (users: Map<number, string>) => {

    const stringValues = Array.from(users.values()).map(user => String(user))

    return stringValues.join('\n')
}