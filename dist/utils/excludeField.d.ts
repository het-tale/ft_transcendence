export declare function exclude<User, Field extends keyof User>(user: User, field: keyof User): Omit<User, Field>;
