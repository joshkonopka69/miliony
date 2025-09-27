import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Svg, Circle, Line, Rect, Text as SvgText, G } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface AnalyticsChartProps {
  type: 'line' | 'bar' | 'pie' | 'area';
  title: string;
  data: ChartData[];
  xAxis?: string;
  yAxis?: string;
  height?: number;
  colors?: string[];
}

export function AnalyticsChart({
  type,
  title,
  data,
  xAxis,
  yAxis,
  height = 200,
  colors = ['#2196F3', '#4CAF50', '#FF9800', '#F44336', '#9C27B0', '#00BCD4', '#8BC34A', '#FF5722'],
}: AnalyticsChartProps) {
  const chartWidth = screenWidth - 40;
  const chartHeight = height;
  const padding = 40;
  const innerWidth = chartWidth - padding * 2;
  const innerHeight = chartHeight - padding * 2;

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));

  const renderLineChart = () => {
    if (data.length < 2) return null;

    const points = data.map((item, index) => {
      const x = padding + (index / (data.length - 1)) * innerWidth;
      const y = padding + innerHeight - ((item.value - minValue) / (maxValue - minValue)) * innerHeight;
      return `${x},${y}`;
    }).join(' ');

    return (
      <Svg width={chartWidth} height={chartHeight}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
          const y = padding + ratio * innerHeight;
          return (
            <Line
              key={index}
              x1={padding}
              y1={y}
              x2={padding + innerWidth}
              y2={y}
              stroke="#e0e0e0"
              strokeWidth={1}
            />
          );
        })}
        
        {/* Line */}
        <Line
          x1={padding}
          y1={padding + innerHeight - ((data[0].value - minValue) / (maxValue - minValue)) * innerHeight}
          x2={padding + innerWidth}
          y2={padding + innerHeight - ((data[data.length - 1].value - minValue) / (maxValue - minValue)) * innerHeight}
          stroke={colors[0]}
          strokeWidth={2}
        />
        
        {/* Data points */}
        {data.map((item, index) => {
          const x = padding + (index / (data.length - 1)) * innerWidth;
          const y = padding + innerHeight - ((item.value - minValue) / (maxValue - minValue)) * innerHeight;
          return (
            <Circle
              key={index}
              cx={x}
              cy={y}
              r={4}
              fill={colors[0]}
            />
          );
        })}
        
        {/* Labels */}
        {data.map((item, index) => {
          const x = padding + (index / (data.length - 1)) * innerWidth;
          return (
            <SvgText
              key={index}
              x={x}
              y={chartHeight - 10}
              fontSize="10"
              fill="#666"
              textAnchor="middle"
            >
              {item.label}
            </SvgText>
          );
        })}
      </Svg>
    );
  };

  const renderBarChart = () => {
    const barWidth = innerWidth / data.length * 0.8;
    const barSpacing = innerWidth / data.length * 0.2;

    return (
      <Svg width={chartWidth} height={chartHeight}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
          const y = padding + ratio * innerHeight;
          return (
            <Line
              key={index}
              x1={padding}
              y1={y}
              x2={padding + innerWidth}
              y2={y}
              stroke="#e0e0e0"
              strokeWidth={1}
            />
          );
        })}
        
        {/* Bars */}
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * innerHeight;
          const x = padding + index * (barWidth + barSpacing) + barSpacing / 2;
          const y = padding + innerHeight - barHeight;
          const color = item.color || colors[index % colors.length];
          
          return (
            <Rect
              key={index}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={color}
            />
          );
        })}
        
        {/* Labels */}
        {data.map((item, index) => {
          const x = padding + index * (barWidth + barSpacing) + barSpacing / 2 + barWidth / 2;
          return (
            <SvgText
              key={index}
              x={x}
              y={chartHeight - 10}
              fontSize="10"
              fill="#666"
              textAnchor="middle"
            >
              {item.label}
            </SvgText>
          );
        })}
      </Svg>
    );
  };

  const renderPieChart = () => {
    const centerX = chartWidth / 2;
    const centerY = chartHeight / 2;
    const radius = Math.min(innerWidth, innerHeight) / 2 - 20;
    
    let currentAngle = 0;
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
      <Svg width={chartWidth} height={chartHeight}>
        {data.map((item, index) => {
          const percentage = item.value / total;
          const angle = percentage * 360;
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;
          
          const x1 = centerX + radius * Math.cos((startAngle - 90) * Math.PI / 180);
          const y1 = centerY + radius * Math.sin((startAngle - 90) * Math.PI / 180);
          const x2 = centerX + radius * Math.cos((endAngle - 90) * Math.PI / 180);
          const y2 = centerY + radius * Math.sin((endAngle - 90) * Math.PI / 180);
          
          const largeArcFlag = angle > 180 ? 1 : 0;
          const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
          ].join(' ');
          
          currentAngle += angle;
          
          return (
            <G key={index}>
              <path
                d={pathData}
                fill={item.color || colors[index % colors.length]}
              />
              <SvgText
                x={centerX + (radius + 20) * Math.cos((startAngle + angle / 2 - 90) * Math.PI / 180)}
                y={centerY + (radius + 20) * Math.sin((startAngle + angle / 2 - 90) * Math.PI / 180)}
                fontSize="12"
                fill="#333"
                textAnchor="middle"
              >
                {item.label}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    );
  };

  const renderAreaChart = () => {
    if (data.length < 2) return null;

    const points = data.map((item, index) => {
      const x = padding + (index / (data.length - 1)) * innerWidth;
      const y = padding + innerHeight - ((item.value - minValue) / (maxValue - minValue)) * innerHeight;
      return `${x},${y}`;
    }).join(' ');

    const areaPath = `M ${padding} ${padding + innerHeight} L ${points} L ${padding + innerWidth} ${padding + innerHeight} Z`;

    return (
      <Svg width={chartWidth} height={chartHeight}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
          const y = padding + ratio * innerHeight;
          return (
            <Line
              key={index}
              x1={padding}
              y1={y}
              x2={padding + innerWidth}
              y2={y}
              stroke="#e0e0e0"
              strokeWidth={1}
            />
          );
        })}
        
        {/* Area */}
        <path
          d={areaPath}
          fill={colors[0]}
          fillOpacity={0.3}
        />
        
        {/* Line */}
        <Line
          x1={padding}
          y1={padding + innerHeight - ((data[0].value - minValue) / (maxValue - minValue)) * innerHeight}
          x2={padding + innerWidth}
          y2={padding + innerHeight - ((data[data.length - 1].value - minValue) / (maxValue - minValue)) * innerHeight}
          stroke={colors[0]}
          strokeWidth={2}
        />
        
        {/* Data points */}
        {data.map((item, index) => {
          const x = padding + (index / (data.length - 1)) * innerWidth;
          const y = padding + innerHeight - ((item.value - minValue) / (maxValue - minValue)) * innerHeight;
          return (
            <Circle
              key={index}
              cx={x}
              cy={y}
              r={4}
              fill={colors[0]}
            />
          );
        })}
        
        {/* Labels */}
        {data.map((item, index) => {
          const x = padding + (index / (data.length - 1)) * innerWidth;
          return (
            <SvgText
              key={index}
              x={x}
              y={chartHeight - 10}
              fontSize="10"
              fill="#666"
              textAnchor="middle"
            >
              {item.label}
            </SvgText>
          );
        })}
      </Svg>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return renderLineChart();
      case 'bar':
        return renderBarChart();
      case 'pie':
        return renderPieChart();
      case 'area':
        return renderAreaChart();
      default:
        return null;
    }
  };

  const renderLegend = () => {
    if (type === 'pie' || data.length <= 1) return null;

    return (
      <View style={styles.legend}>
        {data.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View
              style={[
                styles.legendColor,
                { backgroundColor: item.color || colors[index % colors.length] }
              ]}
            />
            <Text style={styles.legendText}>{item.label}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderAxisLabels = () => {
    if (type === 'pie') return null;

    return (
      <View style={styles.axisLabels}>
        {yAxis && (
          <Text style={styles.yAxisLabel}>{yAxis}</Text>
        )}
        {xAxis && (
          <Text style={styles.xAxisLabel}>{xAxis}</Text>
        )}
      </View>
    );
  };

  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No data available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chartContainer}>
        {renderChart()}
        {renderAxisLabels()}
      </View>
      {renderLegend()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 16,
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666666',
  },
  axisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  yAxisLabel: {
    fontSize: 12,
    color: '#666666',
    transform: [{ rotate: '-90deg' }],
  },
  xAxisLabel: {
    fontSize: 12,
    color: '#666666',
  },
  noDataContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#999999',
  },
});
