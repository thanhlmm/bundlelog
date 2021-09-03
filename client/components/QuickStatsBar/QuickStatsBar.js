import React, { Component } from 'react'
import DOMPurify from 'dompurify'
// import './QuickStatsBar.scss'
import { sanitizeHTML } from '../../../utils/common.utils'

import TreeShakeIcon from '../../assets/tree-shake.svg'
import SideEffectIcon from '../../assets/side-effect.svg'
import DependencyIcon from '../../assets/dependency.svg'
import GithubIcon from '../../assets/github-logo.svg'
import NPMIcon from '../../assets/npm-logo.svg'
import InfoIcon from '../../assets/info.svg'

class QuickStatsBar extends Component {
  static defaultProps = {
    description: '',
  }

  getTrimmedDescription = () => {
    let trimmed
    const { description } = this.props
    if (description.trim().endsWith('.')) {
      trimmed = description.substring(0, description.length - 1)
    } else {
      trimmed = description.trim()
    }

    return sanitizeHTML(trimmed)
  }

  render() {
    const {
      dependencyCount,
      name,
      repository,
    } = this.props

    return (
      <div className="quick-stats-bar">
        <div
          className="quick-stats-bar__stat quick-stats-bar__stat--description "
          title={this.getTrimmedDescription()}
        >
          <InfoIcon />
          <span
            className="quick-stats-bar__stat--description-content"
            dangerouslySetInnerHTML={{ __html: this.getTrimmedDescription() }}
            style={{
              maxWidth: `${500}px`,
            }}
          />
        </div>

        <div className="quick-stats-bar__stat quick-stats-bar__stat--optional">
          <DependencyIcon className="quick-stats-bar__stat-icon" />
          <span>
            Latest
          </span>
        </div>
        <div className="quick-stats-bar__stat">
          <a
            className="quick-stats-bar__link"
            href={'https://npmjs.org/package/' + name}
            target="_blank"
            rel="noopener noreferrer"
          >
            <NPMIcon className="quick-stats-bar__logo-icon quick-stats-bar__logo-icon--npm" />
          </a>
          {repository && (
            <a
              className="quick-stats-bar__link"
              href={repository}
              target="_blank"
              rel="noopener noreferrer"
            >
              <GithubIcon className="quick-stats-bar__logo-icon quick-stats-bar__logo-icon quick-stats-bar__logo-icon--github" />
            </a>
          )}
        </div>
      </div>
    )
  }
}

export default QuickStatsBar
