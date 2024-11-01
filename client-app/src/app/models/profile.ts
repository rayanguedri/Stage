/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import { User } from "./user";

export interface Profile {
    username: string;
    displayName: string;
    image?: string;
    bio?: string;
    following: boolean;
    followersCount: number;
    followingCount: number;
    photos?: Photo[];

    
}

export class Profile implements Profile {
    constructor(user: User) {
        this.username = user.username;
        this.displayName = user.displayName;
        this.image = user.image;
    }
    username: string;
    displayName: string;
    image?: string;
    bio?: string;
    following = false;
    followersCount = 0;
    followingCount = 0;
}

export interface Photo {
    id: string;
    url: string;
    isMain: boolean;
    photos?: Photo[];
}

export interface UserActivity {
    id: string;
    title: string;
    category: string;
    date: Date;
}
