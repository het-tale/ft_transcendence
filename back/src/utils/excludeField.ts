export function exclude<User, Field extends keyof User>(
  user: User,
  field: keyof User,
): Omit<User, Field> {
  const res = Object.entries(user)
    .map(([key, val]: [string, string]) =>
      key !== field
        ? {
            [key]: val,
          }
        : undefined,
    )
    .filter((field) => field !== undefined);

  return Object.assign({}, ...res);
}
