import { useEffect, useState } from 'react';
import agent from '../../api/agent';
import StatisticsChart from '../../layout/StatisticsChart';


const StatisticsPage = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [statistics, setStatistics] = useState<any>(null); // State to hold statistics data

    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                const statisticsData = await agent.StatisticsAPI.getStatistics();
                setStatistics(statisticsData);
            } catch (error) {
                console.error('Error fetching statistics:', error);
            }
        };

        fetchStatistics();
    }, []);

    return (
        <div>
            <h1>Website statistics</h1>
            {statistics && (
                <div>
                    <p>Total Activities: {statistics.totalActivities}</p>
                    <p>Total Users: {statistics.totalUsers}</p>
                    {/* Add more statistics as needed */}
                    <StatisticsChart categoryCounts={statistics.categoryCounts} />
                </div>
            )}
        </div>
    );
};

export default StatisticsPage;
