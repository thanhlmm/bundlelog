import API from 'client/api';
import { useEffect, useState } from 'react';
import BarGraph from '../BarGraph';
import styles from './index.module.scss';
import cx from 'classnames';

const defaultData = {
  change: {
    1: 0,
    2: 0,
    3: 0,
    4: 0
  },
  impact: {
    1: 0,
    2: 0,
    3: 0,
  }
}

const defaultStats = [
  {
    symbol: 'No changes are needed',
    holdingsPercent: 0.4,
    color: '#00EA92',
  },
  {
    symbol: 'Search and replace',
    holdingsPercent: 0.3,
    color: '#627EEA',
  },
  {
    symbol: 'Manual refactor',
    holdingsPercent: 0.2,
    color: '#F3BA2F',
  },
  {
    symbol: 'Completely rewrite',
    holdingsPercent: 0.1,
    color: '#FF0000',
  }
]

const RateChangeLog = ({ packageName, version }) => {
  const [voteData, setVoteData] = useState(defaultData);
  const KEY = `${packageName}_${version}`;
  const [changeVoted, setChangeVoted] = useState(window.localStorage.getItem(`${KEY}_change`) || undefined);
  const [impactVoted, setImpactVoted] = useState(window.localStorage.getItem(`${KEY}_impact`) || undefined);

  useEffect(() => {
    API.getRate({ packageName, version }).then(setVoteData);
  }, []);

  const handleVoteChange = (vote) => {
    window.localStorage.setItem(`${KEY}_change`, vote)
    setChangeVoted(vote);

    API.setRate({ packageName, version }, {
      action: 'change',
      data: vote,
      oldData: changeVoted
    }).then(response => {
      // TODO: Show toast success

      setVoteData(response);
    })
  }

  const handleVoteImpact = (vote) => {
    window.localStorage.setItem(`${KEY}_impact`, vote);
    setImpactVoted(vote);
    API.setRate({ packageName, version }, {
      action: 'change',
      data: vote,
      oldData: impactVoted
    }).then(response => {
      // TODO: Show toast success
      setVoteData(response);
    })
  }

  const totalVote = Object.keys(voteData.change).reduce((prev, key) => {
    return prev + Number(voteData.change[key]);
  }, 0)

  const stats = totalVote > 0 ? defaultStats.map((type, index) => {
    return {
      ...type,
      holdingsPercent: voteData.change[index + 1] / (totalVote || 1)
    }
  }) : defaultStats;

  console.log(version, totalVote);

  return (
    <div className={styles['RateChangeLog']}>
      <div className={cx("bar-wrapper", { 'no-data': totalVote === 0 })}>
        <div className="hider">
          No data
        </div>
        <BarGraph data={stats} />
      </div>

      <div>
        <h3>How do you think on this update?</h3>

        <div>
          <button onClick={() => handleVoteChange(1)} disabled={changeVoted == 1}>🙌 No changes are needed</button>
          <button onClick={() => handleVoteChange(2)} disabled={changeVoted == 2}>🤟 Search and replace</button>
          <button onClick={() => handleVoteChange(3)} disabled={changeVoted == 3}>😅 Manual refactor</button>
          <button onClick={() => handleVoteChange(4)} disabled={changeVoted == 4}>😱 Completely rewrite</button>
        </div>

        {/* TODO: Ask for update impact (Bugfix, performance, DX, Others)? */}
        <h3>Are you happy with this?</h3>
        <div>
          <button onClick={() => handleVoteImpact(1)} disabled={impactVoted == 1}>🐞 Bugfix</button>
          <button onClick={() => handleVoteImpact(2)} disabled={impactVoted == 2}>🏎 Performance</button>
          <button onClick={() => handleVoteImpact(3)} disabled={impactVoted == 3}>🥰 Develop experience</button>
          <button onClick={() => handleVoteImpact(4)} disabled={impactVoted == 4}>🤔 Others</button>
        </div>

        <div className="introduction">Show the community your thought about this update, so someone out there gonna save tons of time 😇</div>
      </div>
    </div >
  )
}

export default RateChangeLog;