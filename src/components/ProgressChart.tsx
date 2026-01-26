'use client'

import React from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { WeeklyProgress } from '@/lib/dashboard'

interface ProgressChartProps {
  data: WeeklyProgress[];
}

const ProgressChart: React.FC<ProgressChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <p>No hay datos de progreso semanal disponibles.</p>
  }

  return (
    <div className="w-full h-80 md:h-96 bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Progreso Semanal vs. Promedio de la Clase</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5, right: 30, left: 20, bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="weekLabel" stroke="#666" />
          <YAxis stroke="#666" domain={[0, 100]} />
          <Tooltip
            formatter={(value: number | undefined) => value !== undefined ? [`${value.toFixed(2)}%`, ''] : ['N/A', '']}
            labelFormatter={(label: string) => `Semana: ${label}`}
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
          <Line
            type="monotone"
            dataKey="studentScore"
            name="Tu Puntuación"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="classAverage"
            name="Promedio de la Clase"
            stroke="#82ca9d"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ProgressChart
