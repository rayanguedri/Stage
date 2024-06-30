export interface Statistics {
    totalActivities: number;
    totalUsers: number;
    averageRating: number;
    totalComments: number;
    totalPhotos: number;
    averageTicketsPerActivity: number;
    categoryCounts: CategoryFrequency[];
    commentCountsPerCategory: CategoryCount[];
}

export interface CategoryFrequency {
    category: string;
    count: number;
}

export interface CategoryCount {
    category: string;
    count: number;
}
