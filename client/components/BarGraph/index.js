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
  const [focusOne, setFocusOne] = useState(-1);
  let sum = 0;

  const onFocus = useCallback(e => {
    if (e.target.dataset.index !== undefined) {
      setFocusOne(+e.target.dataset.index);
    }
  }, []);
  const onLeave = useCallback(e => {
    setFocusOne(-1);
  }, []);

  return (
    <div onMouseMove={onFocus} onMouseLeave={onLeave}>
      <div className="allo-line-container">
        {data.map(({ holdingsPercent, color }, index) => {
          const p = formatPercent(holdingsPercent * 100);
          const othersp = formatPercent((1 - sum) * 100);
          if (holdingsPercent <= 0.0001) {
            return null;
          }
          sum += holdingsPercent;
          return (
            <div key={index} style={{ width: p, background: color }} data-index={index}></div>
          );
        })}
      </div>
      <div className="allo-legend">
        {data.map(({ holdingsPercent, color, symbol }, index) => {
          const p = formatPercent(holdingsPercent * 100);
          const othersp = formatPercent((1 - sum) * 100);
          let disp = holdingsPercent > 0.1 || focusOne === index || 'none';
          if (holdingsPercent <= 0.0001) {
            return null;
          }
          return (
            <div key={index} style={{ width: p, display: disp }}>
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
