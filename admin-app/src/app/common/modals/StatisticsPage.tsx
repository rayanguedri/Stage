import { useEffect, useState, useRef, useCallback } from 'react';
import agent from '../../api/agent';
import Chart from 'chart.js/auto';

interface Statistics {
    totalActivities: number;
    totalUsers: number;
    averageRating: number;
    totalComments: number;
    totalPhotos: number;
    averageTicketsPerActivity: number;
    categoryCounts: CategoryFrequency[];
    commentCountsPerCategory: CategoryCount[];
}

interface CategoryFrequency {
    category: string;
    count: number;
}

interface CategoryCount {
    category: string;
    count: number;
}

const StatisticsPage = () => {
    const [statistics, setStatistics] = useState<Statistics | null>(null);
    const ratingChartRef = useRef<Chart<"bar"> | null>(null);
    const commentsChartRef = useRef<Chart<"bar"> | null>(null);
    const photosChartRef = useRef<Chart<"bar"> | null>(null);
    const ticketsChartRef = useRef<Chart<"bar"> | null>(null);
    const categoryChartRef = useRef<Chart<"bar"> | null>(null);

    const generateCategoryLabels = useCallback(() => {
        if (statistics) {
            return statistics.categoryCounts.map(c => c.category);
        }
        return [];
    }, [statistics]);

    const initializeCharts = useCallback(() => {
        if (statistics) {
            destroyCharts();

            
            const ratingChartCtx = document.getElementById('ratingChart') as HTMLCanvasElement;
            if (ratingChartCtx) {
                ratingChartRef.current = new Chart(ratingChartCtx, {
                    type: 'bar',
                    data: {
                        labels: ['Average Rating'],
                        datasets: [{
                            label: 'Average Rating',
                            data: [statistics.averageRating.toFixed(2)],
                            backgroundColor: 'rgba(255, 99, 132, 0.5)',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                suggestedMax: 5 // Assuming ratings are on a 0-5 scale
                            }
                        }
                    }
                });
            }

            // Comments Chart
            const commentsChartCtx = document.getElementById('commentsChart') as HTMLCanvasElement;
            if (commentsChartCtx) {
                commentsChartRef.current = new Chart(commentsChartCtx, {
                    type: 'bar',
                    data: {
                        labels: ['Total Comments'],
                        datasets: [{
                            label: 'Total Comments',
                            data: [statistics.totalComments],
                            backgroundColor: 'rgba(54, 162, 235, 0.5)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            }

            // Photos Chart
            const photosChartCtx = document.getElementById('photosChart') as HTMLCanvasElement;
            if (photosChartCtx) {
                photosChartRef.current = new Chart(photosChartCtx, {
                    type: 'bar',
                    data: {
                        labels: ['Total Photos'],
                        datasets: [{
                            label: 'Total Photos',
                            data: [statistics.totalPhotos],
                            backgroundColor: 'rgba(75, 192, 192, 0.5)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            }

            // Tickets Chart
            const ticketsChartCtx = document.getElementById('ticketsChart') as HTMLCanvasElement;
            if (ticketsChartCtx) {
                ticketsChartRef.current = new Chart(ticketsChartCtx, {
                    type: 'bar',
                    data: {
                        labels: ['Average Tickets per Activity'],
                        datasets: [{
                            label: 'Average Tickets per Activity',
                            data: [statistics.averageTicketsPerActivity.toFixed(2)],
                            backgroundColor: 'rgba(153, 102, 255, 0.5)',
                            borderColor: 'rgba(153, 102, 255, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            }

            // Category Chart
            const categoryChartCtx = document.getElementById('categoryChart') as HTMLCanvasElement;
            if (categoryChartCtx) {
                categoryChartRef.current = new Chart(categoryChartCtx, {
                    type: 'bar',
                    data: {
                        labels: generateCategoryLabels(),
                        datasets: [{
                            label: 'Category Counts',
                            data: statistics.categoryCounts.map(c => c.count),
                            backgroundColor: statistics.categoryCounts.map(() => `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.5)`),
                            borderColor: statistics.categoryCounts.map(() => `rgba(54, 162, 235, 1)`),
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            }
        }
    }, [statistics, generateCategoryLabels]);

    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                const statisticsData: Statistics = await agent.StatisticsAPI.getStatistics();
                setStatistics(statisticsData);
            } catch (error) {
                console.error('Error fetching statistics:', error);
            }
        };

        fetchStatistics();
    }, []);

    useEffect(() => {
        if (statistics) {
            initializeCharts();
        }

        return () => {
            destroyCharts();
        };
    }, [initializeCharts, statistics]);

    const destroyCharts = () => {
        if (ratingChartRef.current) {
            ratingChartRef.current.destroy();
            ratingChartRef.current = null;
        }
        if (commentsChartRef.current) {
            commentsChartRef.current.destroy();
            commentsChartRef.current = null;
        }
        if (photosChartRef.current) {
            photosChartRef.current.destroy();
            photosChartRef.current = null;
        }
        if (ticketsChartRef.current) {
            ticketsChartRef.current.destroy();
            ticketsChartRef.current = null;
        }
        if (categoryChartRef.current) {
            categoryChartRef.current.destroy();
            categoryChartRef.current = null;
        }
    };

    return (
        <div>
            <h1>Website Statistics</h1>
            {statistics ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                    <div style={{ flex: '1 1 300px', maxWidth: '300px', marginBottom: '20px' }}>
                        <canvas id="ratingChart" />
                    </div>
                    <div style={{ flex: '1 1 300px', maxWidth: '300px', marginBottom: '20px' }}>
                        <canvas id="commentsChart" />
                    </div>
                    <div style={{ flex: '1 1 300px', maxWidth: '300px', marginBottom: '20px' }}>
                        <canvas id="photosChart" />
                    </div>
                    <div style={{ flex: '1 1 300px', maxWidth: '300px', marginBottom: '20px' }}>
                        <canvas id="ticketsChart" />
                    </div>
                    <div style={{ flex: '1 1 300px', maxWidth: '300px', marginBottom: '20px' }}>
                        <canvas id="categoryChart" />
                    </div>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default StatisticsPage;
