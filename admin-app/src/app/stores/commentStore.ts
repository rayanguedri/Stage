import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { makeAutoObservable, runInAction } from "mobx";
import { ChatComment } from "../models/comment";
import { store } from "./store";

export default class CommentStore {
    comments: ChatComment[] = [];
    hubConnection: HubConnection | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    createHubConnection = (activityId: string) => {
        if (store.activityStore.selectedActivity) {
            this.hubConnection = new HubConnectionBuilder()
                .withUrl('http://localhost:5000/chat?activityId=' + activityId, {
                    accessTokenFactory: () => store.userStore.user?.token as string
                })
                .withAutomaticReconnect()
                .configureLogging(LogLevel.Information)
                .build();

            this.hubConnection.start().catch(error => console.log('Error establishing connection: ', error));

            this.hubConnection.on('LoadComments', (comments: ChatComment[]) => {
                runInAction(() => {
                    comments.forEach(comment => {
                        comment.createdAt = new Date(comment.createdAt);
                    });
                    this.comments = comments;
                });
            });

            this.hubConnection.on('ReceiveComment', comment => {
                runInAction(() => {
                    comment.createdAt = new Date(comment.createdAt);
                    this.comments.unshift(comment);
                });
            });

            this.hubConnection.on('CommentDeleted', (commentId: number) => {
                runInAction(() => {
                    this.comments = this.comments.filter(comment => comment.id !== commentId);
                });
            });

            this.hubConnection.on('EditComment', (updatedComment: ChatComment) => {
                runInAction(() => {
                    // Find the comment and replace it with the updated comment
                    const index = this.comments.findIndex(comment => comment.id === updatedComment.id);
                    if (index !== -1) {
                        this.comments[index] = updatedComment;
                    }
                });
            });
        }
    }

    stopHubConnection = () => {
        this.hubConnection?.stop().catch(error => console.log('Error stopping connection: ', error));
    }

    clearComments = () => {
        this.comments = [];
        this.stopHubConnection();
    }

    addComment = async (values:  {body: string, activityId?: string}) => {
        values.activityId = store.activityStore.selectedActivity?.id;
        try {
            await this.hubConnection?.invoke('SendComment', values);
        } catch (error) {
            console.log(error);
        }
    }

    deleteComment = async (commentId: number) => {
        try {
            await this.hubConnection?.invoke('DeleteComment', { commentId });
            location.reload();
        } catch (error) {
            console.error('Failed to delete comment:', error);
        }
    }

    DeleteCommentAdmin = async (commentId: number) => {
        try {
            await this.hubConnection?.invoke('DeleteCommentAdmin', { commentId });
            location.reload();
        } catch (error) {
            console.error('Failed to delete comment:', error);
        }
    }

    //EditCommentAdmin

    editComment = async (commentId: number, body?: string, activityId?: string) => {
        try {
            // Invoke the 'EditComment' method on the server
            await this.hubConnection?.invoke('EditComment', {
                commentId,
                body,
                activityId
            });
            location.reload();
        } catch (error) {
            console.error('Failed to edit comment:', error);
        }
    }

    EditCommentAdmin = async (commentId: number, body?: string, activityId?: string) => {
        try {
            // Invoke the 'EditComment' method on the server
            await this.hubConnection?.invoke('EditCommentAdmin', {
                commentId,
                body,
                activityId
            });
            location.reload();
        } catch (error) {
            console.error('Failed to edit comment:', error);
        }
    }

}
