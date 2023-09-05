import { Profile } from 'passport-42';
declare const Strategy42_base: new (...args: any[]) => any;
export declare class Strategy42 extends Strategy42_base {
    constructor();
    validate(accessToken: string, refreshToken: string, profile: Profile): Promise<any>;
}
export {};
