import { makeAutoObservable, runInAction } from "mobx";
import agent from "../api/agent";
import { User, UserFormValues } from "../models/user";
import { router } from "../router/Routes";
import { store } from "./store";

export default class UserStore {
    user: User | null = null;
    users: User[] = [];
    userRegistry = new Map<string, User>();

    constructor() {
        makeAutoObservable(this);
    }

    get isLoggedIn() {
        return !!this.user;
    }

    login = async (creds: UserFormValues) => {
        const user = await agent.Account.login(creds);
        store.commonStore.setToken(user.token);
        runInAction(() => this.user = user);
        router.navigate('/activities');
        store.modalStore.closeModal();
    }

    logout = () => {
        store.commonStore.setToken(null);
        this.user = null;
        router.navigate('/');
    }

    register = async (creds: UserFormValues) => {
        try {
            await agent.Account.register(creds);
            router.navigate(`/account/registerSuccess?email=${creds.email}`);
            store.modalStore.closeModal();
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    setImage = (image: string) => {
        if (this.user) {
            this.user.image = image;
        }
    }

    setDisplayName = (name: string) => {
        if (this.user) this.user.displayName = name;
    }

    setUserPhoto = (url: string) => {
        if (this.user) this.user.image = url;
    }

    getUser = async () => {
        try {
            const user = await agent.Account.current();
            runInAction(() => this.user = user);
        } catch (error) {
            console.log(error);
        }
    }

    forgotPassword = async (email: string) => {
        try {
            await agent.Account.forgotPassword(email);
            router.navigate('/forgot-password-success');
        } catch (error) {
            console.error('Forgot password error:', error);
            throw error;
        }
    }

    resetPassword = async (token: string, email: string, newPassword: string) => {
        try {
            await agent.Account.resetPassword(token, email, newPassword);
            router.navigate('/reset-password-success');
        } catch (error) {
            console.error('Reset password error:', error);
            throw error;
        }
    }

    loadUsers = async () => {
        try {
            const users = await agent.Account.listUsers();
            runInAction(() => {
                this.users = users;
                this.userRegistry.clear();
                users.forEach(user => this.userRegistry.set(user.username, user));
                console.log("Loaded users:", this.users);
            });
        } catch (error) {
            console.log(error);
        }
    }

    banUser = async (user: User) => {
        try {
            await agent.Account.banUser(user);
            runInAction(() => {
                user.isBanned = true; // Update local user object
                this.userRegistry.set(user.username, user); // Update user registry
            });
            await this.loadUsers(); // Refresh user list from the backend
            console.log("Banned user:", user);
        } catch (error) {
            console.error('Error banning user:', error);
            throw error;
        }
    }

    unbanUser = async (user: User) => {
        try {
            await agent.Account.unbanUser(user);
            runInAction(() => {
                user.isBanned = false; // Update local user object
                this.userRegistry.set(user.username, user); // Update user registry
            });
            await this.loadUsers(); // Refresh user list from the backend
            console.log("Unbanned user:", user);
        } catch (error) {
            console.error('Error unbanning user:', error);
            throw error;
        }
    }
}
