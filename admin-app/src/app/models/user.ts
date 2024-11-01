export interface User {
    username: string;
    displayName: string;
    token: string;
    image?: string;
    email: string;
    isBanned?: boolean;
   
}


export interface UserFormValues {
    email: string;
    password: string;
    displayName?: string;
    username?: string;
    isBanned?: boolean;
    
}