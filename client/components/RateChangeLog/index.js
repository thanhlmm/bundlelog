import styles from './index.module.scss';

const RateChangeLog = (props) => {
  const handleClick = (e) => {

  }
  return (
    <div className={styles['RateChangeLog']}>
      <h3>How do you think on this update?</h3>

      <div>
        <button onClick={handleClick}>🙌 No changes are needed</button>
        <button onClick={handleClick}>🤟 Search and replace</button>
        <button onClick={handleClick}>😅 Manual refactor</button>
        <button onClick={handleClick}>😱 Completely rewrite</button>
      </div>

      {/* TODO: Ask for update impact (Bugfix, performance, DX, Others)? */}
      <h3>Are you happy with this?</h3>
      <div>
        <button onClick={handleClick}>🐞 Bugfix</button>
        <button onClick={handleClick}>🏎 Performance</button>
        <button onClick={handleClick}>🥰 Develop experience</button>
        <button onClick={handleClick}>🤔 Others</button>
      </div>

      <div className="introduction">Show the community your thought about this update, so someone out there gonna save tons of time 😇</div>
    </div>
  )
}

export default RateChangeLog;