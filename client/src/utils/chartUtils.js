/**
 * Utility functions for chart configuration and styling
 */

/**
 * Get default chart options for line charts
 * @param {string} title - Chart title
 * @returns {object} - Chart options object
 */
export const getLineChartOptions = (title = '') => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              maximumSignificantDigits: 3
            }).format(value);
          }
        }
      }
    }
  };
};

/**
 * Get default chart options for bar charts
 * @param {string} title - Chart title
 * @returns {object} - Chart options object
 */
export const getBarChartOptions = (title = '') => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              maximumSignificantDigits: 3
            }).format(value);
          }
        }
      }
    }
  };
};

/**
 * Get default chart options for pie/doughnut charts
 * @param {string} title - Chart title
 * @returns {object} - Chart options object
 */
export const getPieChartOptions = (title = '') => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const percentage = context.parsed || 0;
            return `${label}: ${new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(value)} (${percentage.toFixed(1)}%)`;
          }
        }
      }
    }
  };
};

/**
 * Get a predefined color palette for charts
 * @param {number} count - Number of colors needed
 * @returns {string[]} - Array of color codes
 */
export const getChartColorPalette = (count = 10) => {
  const baseColors = [
    '#4285F4', // Blue
    '#EA4335', // Red
    '#FBBC05', // Yellow
    '#34A853', // Green
    '#8E24AA', // Purple
    '#16A2D7', // Light Blue
    '#FF6D00', // Orange
    '#00897B', // Teal
    '#757575', // Gray
    '#6200EA', // Deep Purple
    '#C0CA33', // Lime
    '#D81B60', // Pink
    '#F4511E', // Deep Orange
    '#00ACC1', // Cyan
    '#43A047', // Light Green
    '#6D4C41', // Brown
    '#546E7A', // Blue Gray
    '#FFD600', // Amber
    '#5D4037', // Deep Brown
    '#E91E63'  // Bright Pink
  ];

  // If we need more colors than in our base palette, we'll repeat with different opacity
  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }
  
  const result = [...baseColors];
  const neededExtra = count - baseColors.length;
  
  for (let i = 0; i < neededExtra; i++) {
    const baseColor = baseColors[i % baseColors.length];
    // Create a slightly different shade
    result.push(adjustColorBrightness(baseColor, i % 2 === 0 ? 20 : -20));
  }
  
  return result;
};

/**
 * Adjust the brightness of a hex color
 * @param {string} hex - Hex color code
 * @param {number} percent - Percentage to adjust brightness
 * @returns {string} - Adjusted hex color
 */
const adjustColorBrightness = (hex, percent) => {
  // Convert hex to RGB
  let r = parseInt(hex.substring(1, 3), 16);
  let g = parseInt(hex.substring(3, 5), 16);
  let b = parseInt(hex.substring(5, 7), 16);

  // Adjust brightness
  r = Math.max(0, Math.min(255, r + (r * percent / 100)));
  g = Math.max(0, Math.min(255, g + (g * percent / 100)));
  b = Math.max(0, Math.min(255, b + (b * percent / 100)));

  // Convert back to hex
  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
};

const chartUtils = {
  getLineChartOptions,
  getBarChartOptions,
  getPieChartOptions,
  getChartColorPalette
};

export default chartUtils;