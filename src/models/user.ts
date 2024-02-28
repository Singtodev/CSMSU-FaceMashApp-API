export interface User {
    uid?:        number;
    role?:       number;
    email?:      string;
    full_name?:  string;
    password?:   string;
    avatar_url?: string;
    create_at?:  string;
}

// Converts JSON strings to/from your types
export class Convert {
    public static toUser(json: string): User {
        return JSON.parse(json);
    }

    public static userToJson(value: User): string {
        return JSON.stringify(value);
    }
}
