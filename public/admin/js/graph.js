let salesChartInstance = null;
let topCategoriesChartInstance = null;

function renderSalesChart(salesData) {
    const ctx = document.getElementById('salesChart').getContext('2d');

    // Destroy the previous chart instance if it exists
    if (salesChartInstance) {
        salesChartInstance.destroy();
    }

    salesChartInstance = new Chart(ctx, {
        type: 'line', // Ensure it's a line chart
        data: {
            labels: salesData.map(data => data._id),
            datasets: [
                {
                    label: 'Revenue',
                    data: salesData.map(data => data.revenue),
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    fill: true,
                    tension: 0.4 // Smooth the line
                },
                {
                    label: 'Total Amount (Pre-Discount)',
                    data: salesData.map(data => data.totalAmount),
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Orders',
                    data: salesData.map(data => data.orders),
                    borderColor: '#ff4d4d',
                    backgroundColor: 'rgba(255, 77, 77, 0.1)',
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Amount (₹)' }
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    title: { display: true, text: 'Orders' },
                    grid: { drawOnChartArea: false } // Avoid overlapping grid lines
                },
                x: {
                    title: { display: true, text: 'Time Period' }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });
}

function renderTopCategoriesChart(topCategoriesData) {
    const ctx = document.getElementById('topCategoriesChart').getContext('2d');

    // Destroy the previous chart instance if it exists
    if (topCategoriesChartInstance) {
        topCategoriesChartInstance.destroy();
    }

    topCategoriesChartInstance = new Chart(ctx, {
        type: 'bar', // Keep as bar chart
        data: {
            labels: topCategoriesData.map(data => data.name),
            datasets: [{
                label: 'Sales Count',
                data: topCategoriesData.map(data => data.count),
                backgroundColor: ['#007bff', '#28a745', '#ff4d4d', '#ffca28', '#6f42c1']
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Sales Count' }
                },
                x: {
                    title: { display: true, text: 'Category' }
                }
            },
            plugins: {
                legend: {
                    display: false // Hide legend for bar chart
                }
            }
        }
    });
}