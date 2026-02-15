import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, PieChart, Pie } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';

const COLORS = {
  todo: '#3b82f6',
  inprogress: '#eab308',
  done: '#22c55e',
};

export const TaskProgress = ({ tasks }) => {
  
  const { colors } = useTheme();
  const getTaskStats = () => {
    const stats = {
      todo: tasks.filter((t) => t.status === 'todo').length,
      inprogress: tasks.filter((t) => t.status === 'inprogress').length,
      done: tasks.filter((t) => t.status === 'done').length,
    };

    const total = stats.todo + stats.inprogress + stats.done;
    const completionPercentage = total > 0 ? Math.round((stats.done / total) * 100) : 0;

    return { stats, total, completionPercentage };
  };

  const { stats, total, completionPercentage } = getTaskStats();

  const barData = [
    { name: 'To Do', count: stats.todo, fill: COLORS.todo },
    { name: 'In Progress', count: stats.inprogress, fill: COLORS.inprogress },
    { name: 'Done', count: stats.done, fill: COLORS.done },
  ];

  const pieData = [
    { name: 'Completed', value: stats.done },
    { name: 'Pending', value: stats.todo + stats.inprogress },
  ];

  // Custom label renderer - MORE space for labels
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    const RADIAN = Math.PI / 180;
    // Push even FURTHER out to prevent cutoff (55px instead of 45px)
    const radius = outerRadius + 55;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill={colors.text}
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        style={{ 
          fontSize: '14px', 
          fontWeight: '600',
          pointerEvents: 'none',
        }}
      >
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Custom tooltip to fix dark blue background
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: colors.bgSecondary,
            border: `1px solid ${colors.border}`,
            borderRadius: '6px',
            padding: '8px 12px',
            color: colors.text,
          }}
        >
          <p style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>
            {payload[0].name}: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      style={{
        backgroundColor: colors.bgSecondary,
        borderRadius: '8px',
        padding: '24px',
        marginTop: '24px',
        border: `1px solid ${colors.border}`,
        boxShadow: `0 1px 3px ${colors.shadow}`,
      }}
      data-testid="task-progress-chart"
    >
      <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '700', color: colors.text }}>
        Task Progress Dashboard
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            padding: '16px',
            backgroundColor: '#eff6ff',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#3b82f6' }}>
            {stats.todo}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>To Do</div>
        </div>

        <div
          style={{
            padding: '16px',
            backgroundColor: '#fef9c3',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#eab308' }}>
            {stats.inprogress}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>In Progress</div>
        </div>

        <div
          style={{
            padding: '16px',
            backgroundColor: '#dcfce7',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#22c55e' }}>
            {stats.done}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Done</div>
        </div>

        <div
          style={{
            padding: '16px',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937' }}>
            {completionPercentage}%
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Completed</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', textAlign: 'center', color: colors.text }}>
            Tasks by Status
          </h3>
          <BarChart width={400} height={250} data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: colors.text }}
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              tick={{ fill: colors.text }}
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: colors.text }} />
            <Bar dataKey="count" name="Tasks">
              {barData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </div>

        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', textAlign: 'center', color: colors.text }}>
            Completion Overview
          </h3>
          {/* Increased width to 500px to accommodate "Completed 100%" text */}
          <PieChart width={500} height={300}>
            <Pie
              data={pieData}
              cx={250}
              cy={150}
              labelLine={true}
              label={renderCustomLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              style={{ outline: 'none' }}
            >
              <Cell fill="#22c55e" />
              <Cell fill="#94a3b8" />
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </div>
      </div>
    </div>
  );
};