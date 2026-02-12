'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Line
} from 'recharts'
import { AssignmentProgress } from '@/lib/dashboard'

interface AssignmentProgressChartProps {
  data: AssignmentProgress[];
}

const AssignmentProgressChart: React.FC<AssignmentProgressChartProps> = ({ data }) => {
  const t = useTranslations('common')

  if (!data?.length) {
    return <p>{t('noAssignmentProgressData')}</p>
  }

  // Custom tick renderer for XAxis
  const renderCustomXAxisTick = ({ x, y, payload }: { x: number; y: number; payload: { value: string } }) => {
    const lines = String(payload.value).split('\n')
    return (
      <g transform={`translate(${Number(x)},${Number(y) + 15})`}>
        {lines.map((line) => (
          <text
            key={line}
            x={0}
            y={lines.indexOf(line) * 15}
            textAnchor="middle"
            fill="#666"
            fontSize={12}
          >
            {line}
          </text>
        ))}
      </g>
    )
  }

  return (
    <div className="w-full h-80 md:h-96 bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">{t('assignmentProgressChartTitle')}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5, right: 30, left: 20, bottom: 5,
          }}
        >
          <XAxis
            dataKey="assignmentName"
            interval={0}
            height={80}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            tick={renderCustomXAxisTick as any}
          />
          <YAxis stroke="#666" domain={[0, 100]} />
          <Tooltip
            formatter={(value: number | undefined) => value ? [`${value}`, ''] : ['N/A', '']}
            labelFormatter={String}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '10px'
            }}
            labelStyle={{ fontWeight: 'bold', color: '#333' }}
            itemStyle={{ color: '#333' }}
          />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          <Bar
            dataKey="studentPoints"
            name={t('yourPercentage')}
            fill="#8884d8"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="classAveragePoints"
            name={t('classAveragePercentage')}
            fill="#82ca9d"
            radius={[4, 4, 0, 0]}
          />
          <Line
            type="monotone"
            dataKey="studentPoints"
            name={t('yourTrend')}
            stroke="#60a5fa"
            strokeWidth={2}
            dot={{ r: 3, fill: '#60a5fa' }}
            activeDot={{ r: 5 }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default AssignmentProgressChart
