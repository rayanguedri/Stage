export interface Statistics {
    totalActivities: number;
    totalUsers: number;
    categoryFrequencies: CategoryFrequency[];
    commentCounts: CommentCount[];
}

export interface CategoryFrequency {
    category: string;
    count: number;
}

export interface CommentCount {
    activityId: string;
    count: number;
}
