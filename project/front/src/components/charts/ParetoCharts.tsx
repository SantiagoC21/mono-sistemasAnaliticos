import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ParetoItem } from '../../types/analysis';

interface Props {
  data: ParetoItem[];
}

const ParetoChart: React.FC<Props> = ({ data }) => {
  // Mostramos solo el Top 15 para que no se sature
  const chartData = data.slice(0, 15);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{top: 20, right: 30, left: 20, bottom: 5}}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="etiqueta" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="frecuencia" name="Frecuencia">
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.clase === 'A' ? '#dc3545' : '#82ca9d'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ParetoChart;