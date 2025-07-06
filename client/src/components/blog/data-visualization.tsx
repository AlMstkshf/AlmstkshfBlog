import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { LazyChart } from '@/components/ui/lazy-loader';

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  trend?: 'up' | 'down' | 'stable';
  color?: string;
  icon?: React.ReactNode;
  isRTL?: boolean;
}

interface ChartDataPoint {
  name: string;
  value: number;
  label?: string;
}

interface DataVisualizationProps {
  type: 'stat-card' | 'bar-chart' | 'pie-chart' | 'line-chart' | 'area-chart' | 'comparison' | 'timeline';
  data: ChartDataPoint[] | any;
  title: string;
  description?: string;
  colors?: string[];
  height?: number;
  className?: string;
  isRTL?: boolean;
}

const DEFAULT_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
];

export function StatCard({ title, value, description, trend, color = '#3B82F6', icon, isRTL = false }: StatCardProps) {
  const trendIcon = trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→';
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
      <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3`}>
          {icon && <div style={{ color }}>{icon}</div>}
          <h3 className={`text-lg font-semibold text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}>{title}</h3>
        </div>
        {trend && (
          <span className={`text-2xl ${trendColor}`} aria-label={`Trend: ${trend}`}>
            {trendIcon}
          </span>
        )}
      </div>
      <div className="mb-2">
        <span 
          className="text-3xl font-bold" 
          style={{ color }}
          role="img" 
          aria-label={`Statistic value: ${value}`}
        >
          {value}
        </span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

export function DataVisualization({ 
  type, 
  data, 
  title, 
  description, 
  colors = DEFAULT_COLORS, 
  height = 300,
  className = "",
  isRTL = false 
}: DataVisualizationProps) {
  const chartId = `chart-${title.toLowerCase().replace(/\s+/g, '-')}`;

  const renderChart = () => {
    switch (type) {
      case 'bar-chart':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart 
              data={data} 
              margin={isRTL ? { top: 20, right: 20, left: 30, bottom: 5 } : { top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, textAnchor: isRTL ? 'end' : 'middle', fontFamily: isRTL ? 'Cairo, sans-serif' : 'Inter, sans-serif' }}
                stroke="#666"
                reversed={isRTL}
                interval={0}
                height={60}
                angle={isRTL ? -45 : 0}
              />
              <YAxis 
                tick={{ fontSize: 12, textAnchor: isRTL ? 'end' : 'start', fontFamily: isRTL ? 'Cairo, sans-serif' : 'Inter, sans-serif' }}
                stroke="#666"
                orientation={isRTL ? 'right' : 'left'}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#f8fafc', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  direction: isRTL ? 'rtl' : 'ltr',
                  textAlign: isRTL ? 'right' : 'left',
                  fontFamily: isRTL ? 'Cairo, sans-serif' : 'Inter, sans-serif'
                }}
              />
              <Bar 
                dataKey="value" 
                fill={colors[0]}
                radius={[4, 4, 0, 0]}
                name={title}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie-chart':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#f8fafc', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'line-chart':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart 
              data={data} 
              margin={isRTL ? { top: 20, right: 20, left: 30, bottom: 5 } : { top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, textAnchor: isRTL ? 'end' : 'middle', fontFamily: isRTL ? 'Cairo, sans-serif' : 'Inter, sans-serif' }}
                stroke="#666"
                reversed={isRTL}
                interval={0}
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 12, textAnchor: isRTL ? 'end' : 'start', fontFamily: isRTL ? 'Cairo, sans-serif' : 'Inter, sans-serif' }}
                stroke="#666"
                orientation={isRTL ? 'right' : 'left'}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#f8fafc', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  direction: isRTL ? 'rtl' : 'ltr',
                  textAlign: isRTL ? 'right' : 'left',
                  fontFamily: isRTL ? 'Cairo, sans-serif' : 'Inter, sans-serif'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={colors[0]}
                strokeWidth={3}
                dot={{ fill: colors[0], strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area-chart':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart 
              data={data} 
              margin={isRTL ? { top: 20, right: 20, left: 30, bottom: 5 } : { top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, textAnchor: isRTL ? 'end' : 'middle', fontFamily: isRTL ? 'Cairo, sans-serif' : 'Inter, sans-serif' }}
                stroke="#666"
                reversed={isRTL}
                interval={0}
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 12, textAnchor: isRTL ? 'end' : 'start', fontFamily: isRTL ? 'Cairo, sans-serif' : 'Inter, sans-serif' }}
                stroke="#666"
                orientation={isRTL ? 'right' : 'left'}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#f8fafc', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  direction: isRTL ? 'rtl' : 'ltr',
                  textAlign: isRTL ? 'right' : 'left',
                  fontFamily: isRTL ? 'Cairo, sans-serif' : 'Inter, sans-serif'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={colors[0]}
                fill={`${colors[0]}20`}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'comparison':
        return (
          <div className={`grid grid-cols-2 gap-4 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? "rtl" : "ltr"}>
            {data.map((item: any, index: number) => (
              <div key={index} className={`text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg ${isRTL ? 'font-arabic' : ''}`}>
                <div 
                  className="text-2xl font-bold mb-2" 
                  style={{ 
                    color: colors[index % colors.length],
                    fontFamily: isRTL ? 'Cairo, sans-serif' : 'Inter, sans-serif'
                  }}
                >
                  {item.value}%
                </div>
                <div 
                  className="text-sm text-gray-600 dark:text-gray-400"
                  style={{ fontFamily: isRTL ? 'Cairo, sans-serif' : 'Inter, sans-serif' }}
                >
                  {item.name}
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return <div className="text-center text-gray-500">Chart type not supported</div>;
    }
  };

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 my-8 border border-gray-200 dark:border-gray-700 ${className} ${isRTL ? 'chart-container-rtl' : ''}`}
      role="img"
      aria-labelledby={`${chartId}-title`}
      aria-describedby={description ? `${chartId}-desc` : undefined}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className={`mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
        <h3 
          id={`${chartId}-title`}
          className={`text-xl font-bold text-gray-900 dark:text-white mb-2 ${isRTL ? 'arabic-chart-text' : ''}`}
          style={{ fontFamily: isRTL ? 'Cairo, sans-serif' : 'Inter, sans-serif' }}
        >
          {title}
        </h3>
        {description && (
          <p 
            id={`${chartId}-desc`}
            className={`text-gray-600 dark:text-gray-400 text-sm ${isRTL ? 'arabic-chart-text' : ''}`}
            style={{ 
              fontFamily: isRTL ? 'Cairo, sans-serif' : 'Inter, sans-serif',
              lineHeight: isRTL ? '1.8' : '1.5'
            }}
          >
            {description}
          </p>
        )}
      </div>
      
      <div className={`w-full ${isRTL ? 'chart-container-rtl' : ''}`}>
        {renderChart()}
      </div>
      
      {/* SEO-friendly data table fallback */}
      <details className="mt-4 text-sm">
        <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
          View Data Table
        </summary>
        <table className="mt-2 w-full border-collapse border border-gray-300 dark:border-gray-600">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-left">Category</th>
              <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-left">Value</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(data) && data.map((item: any, index: number) => (
              <tr key={index}>
                <td className="border border-gray-300 dark:border-gray-600 px-2 py-1">{item.name}</td>
                <td className="border border-gray-300 dark:border-gray-600 px-2 py-1">{item.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}