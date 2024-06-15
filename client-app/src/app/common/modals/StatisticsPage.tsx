import { useEffect, useState, useRef } from 'react';
import agent from '../../api/agent';
import Chart from 'chart.js/auto';
import StatisticsChart from '../../layout/StatisticsChart'; // Import StatisticsChart component

interface Statistics {
    totalActivities: number;
    totalUsers: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    categoryCounts?: any[]; // Adjust as per your actual data structure and needs
    // Add other properties as needed
}

const StatisticsPage = () => {
    const [statistics, setStatistics] = useState<Statistics | null>(null);
    const activitiesChartRef = useRef<Chart<"line"> | null>(null);
    const usersChartRef = useRef<Chart<"line"> | null>(null);
    const activitiesChartCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const usersChartCanvasRef = useRef<HTMLCanvasElement | null>(null);

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

        // Cleanup on unmount
        return () => {
            destroyCharts();
        };
    }, [statistics]);

    const generateMonthLabels = () => {
        if (statistics) {
            // Assuming statistics object contains data for the last 12 months
            const currentMonth = new Date().getMonth(); // Get current month index (0-11)
            const months = [];

            for (let i = 0; i < 12; i++) {
                const monthIndex = (currentMonth + 12 - i) % 12; // Calculate month index in reverse order
                months.push(getMonthName(monthIndex)); // Assuming getMonthName is a function to get month name
            }

            return months.reverse(); // Reverse array to display in correct chronological order (optional)
        }

        return [];
    };

    const initializeCharts = () => {
        if (statistics) {
            destroyCharts(); // Cleanup previous charts if they exist

            // Generate month labels dynamically
            const months = generateMonthLabels();

            // Initialize total activities chart
            const activitiesChartCtx = activitiesChartCanvasRef.current?.getContext('2d');
            if (activitiesChartCtx) {
                activitiesChartRef.current = new Chart(activitiesChartCtx, {
                    type: 'line',
                    data: {
                        labels: months,
                        datasets: [{
                            label: 'Total Activities',
                            data: [statistics.totalActivities], // Replace with actual data array
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 2,
                            fill: false
                        }]
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true
                            },
                            x: {
                                type: 'category',
                                labels: months,
                                position: 'bottom'
                            }
                        }
                    }
                });
            }

            // Initialize total users chart
            const usersChartCtx = usersChartCanvasRef.current?.getContext('2d');
            if (usersChartCtx) {
                usersChartRef.current = new Chart(usersChartCtx, {
                    type: 'line',
                    data: {
                        labels: months,
                        datasets: [{
                            label: 'Total Users',
                            data: [statistics.totalUsers], // Replace with actual data array
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 2,
                            fill: false
                        }]
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true
                            },
                            x: {
                                type: 'category',
                                labels: months,
                                position: 'bottom'
                            }
                        }
                    }
                });
            }
        }
    };

    const destroyCharts = () => {
        // Destroy previous chart instances if they exist
        if (activitiesChartRef.current) {
            activitiesChartRef.current.destroy();
            activitiesChartRef.current = null;
        }
        if (usersChartRef.current) {
            usersChartRef.current.destroy();
            usersChartRef.current = null;
        }
    };

    const getMonthName = (monthIndex: number) => {
        const months = [
            'January', 'February', 'March', 'April',
            'May', 'June', 'July', 'August',
            'September', 'October', 'November', 'December'
        ];
        return months[monthIndex];
    };

    return (
        <div>
            <h1>Website statistics</h1>
            {statistics ? (
                <div>
                    <p>Total Activities: {statistics.totalActivities}</p>
                    <p>Total Users: {statistics.totalUsers}</p>
                    {/* Add more statistics as needed */}
                    {statistics.categoryCounts && <StatisticsChart categoryCounts={statistics.categoryCounts} />}
                    <div style={{ marginBottom: '20px' }}>
                        <h2>Total Activities</h2>
                        <canvas ref={activitiesChartCanvasRef} />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <h2>Total Users</h2>
                        <canvas ref={usersChartCanvasRef} />
                    </div>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default StatisticsPage;
