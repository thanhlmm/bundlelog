import { useCallback, useState } from 'react';

function formatPercent(
  value,
  { decimal = 2, useSymbol = true, removeMinus = false } = {},
) {
  if (value === undefined) return '?';
  return (Number(value).toFixed(decimal) + (useSymbol ? '%' : '')).slice(
    removeMinus && value < 0 ? 1 : 0,
  );
}


const BarGraph = ({ data }) => {
  return (
    <div>
      <div className="allo-line-container">
        {data.map(({ holdingsPercent, color }, index) => {
          const p = formatPercent(holdingsPercent * 100);
          if (holdingsPercent <= 0.0001) {
            return null;
          }
          return (
            <div key={index} style={{ width: p, background: color }} data-index={index}></div>
          );
        })}
      </div>
      <div className="allo-legend">
        {data.map(({ holdingsPercent, color, symbol }, index) => {
          const p = formatPercent(holdingsPercent * 100);
          if (holdingsPercent <= 0.0001) {
            return null;
          }
          return (
            <div key={index}>
              <span className="allo-legend-dot" style={{ background: color }}></span>
              <span className="allo-legend-percent">{p}</span>
              <span className="allo-legend-symbol">{' '}{symbol}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BarGraph;
