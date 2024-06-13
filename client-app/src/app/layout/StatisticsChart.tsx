import React, { useRef, useEffect } from 'react';
import Chart, { ChartOptions, ChartType } from 'chart.js/auto';
import { categoryOptions } from '../common/options/categoryOptions';


interface StatisticsChartProps {
    categoryCounts: { category: string; count: number }[];
}

const StatisticsChart: React.FC<StatisticsChartProps> = ({ categoryCounts }) => {
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstance = useRef<Chart | null>(null);

    useEffect(() => {
        if (chartRef.current) {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
            renderChart();
        }
    }, [categoryCounts]);

    const renderChart = () => {
        const categories = categoryOptions.map((category) => category.value);
        const counts = categories.map((category) => {
            const foundCategory = categoryCounts.find((c) => c.category === category);
            return foundCategory ? foundCategory.count : 0;
        });

        const data = {
            labels: categoryOptions.map((category) => category.text),
            datasets: [
                {
                    label: 'Category Counts',
                    backgroundColor: 'rgba(75, 192, 192, 1)',
                    borderColor: 'rgba(0, 0, 0, 1)',
                    borderWidth: 1,
                    data: counts,
                },
            ],
        };

        const options: ChartOptions = {
            indexAxis: 'x',
            scales: {
                x: {
                    beginAtZero: true,
                },
                y: {
                    beginAtZero: true,
                },
            },
        };

        if (chartRef.current) {
            const ctx = chartRef.current.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            }
        }

        if (chartRef.current) {
            chartInstance.current = new Chart(chartRef.current, {
                type: 'bar' as ChartType,
                data: data,
                options: options,
            });
        }
    };

    useEffect(() => {
        console.log('categoryCounts:', categoryCounts);
    }, [categoryCounts]);

    useEffect(() => {
        console.log('chartRef.current:', chartRef.current);
    }, [chartRef]);

    useEffect(() => {
        console.log('chartInstance.current:', chartInstance.current);
    }, [chartInstance]);

    return (
        <div>
            <h2>Category Counts</h2>
            <canvas ref={chartRef} />
        </div>
    );
};

export default StatisticsChart;
