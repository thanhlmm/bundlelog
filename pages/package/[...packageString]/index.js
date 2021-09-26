import React, { PureComponent } from 'react'

import ResultLayout from 'client/components/ResultLayout'
import AutocompleteInput from 'client/components/AutocompleteInput'
import AutocompleteInputBox from 'client/components/AutocompleteInputBox'
import BuildProgressIndicator from 'client/components/BuildProgressIndicator'
import RateChangeLog from 'client/components/RateChangeLog';
import Router, { withRouter } from 'next/router'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
// import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { parsePackageString } from 'utils/common.utils'
import {
  resolveBuildError,
  formatSize,
} from 'utils'

import API from 'client/api'
import MetaTags, { DEFAULT_DESCRIPTION_START } from 'client/components/MetaTags'

import EmptyBox from '../../../client/assets/empty-box.svg'
import QuickStatsBar from 'client/components/QuickStatsBar/QuickStatsBar'
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime)


import Warning from 'client/components/Warning/Warning'
import BarGraph from 'client/components/BarGraph'

class ResultPage extends PureComponent {
  state = {
    results: {},
    resultsPromiseState: null,
    resultsError: null,
    changeLogResultsPromiseState: null,
    inputInitialValue: this.getPackageString(this.props.router) || '',
    changeLogResults: [],
    similarPackages: [],
    similarPackagesCategory: '',
    repoName: '',
  }

  getPackageString(router) {
    return router.query.packageString.join('/')
  }

  componentDidMount() {
    // Analytics.pageView('package result')

    const packageString = this.getPackageString(this.props.router)
    if (packageString) {
      this.handleSearchSubmit(packageString)
    }
  }

  componentDidUpdate(prevProps) {
    const packageString = this.getPackageString(prevProps.router)
    const nextPackageString = this.getPackageString(this.props.router)

    if (!nextPackageString) {
      return
    }

    const currentPackage = parsePackageString(packageString)
    const nextPackage = parsePackageString(nextPackageString)

    if (currentPackage.name !== nextPackage.name) {
      this.handleSearchSubmit(nextPackageString)
    }
  }

  fetchResults = packageString => {
    const startTime = Date.now()

    API.getInfo(packageString)
      .then(results => {
        if (this.activeQuery !== packageString) return
        // const newPackageString = `${results.name}@${results.version}`
        const newPackageString = results.name;
        this.setState(
          {
            inputInitialValue: newPackageString,
            results,
            repoName: results.repoName,
            resultsPromiseState: 'fulfilled'
          }
        )
      })
      .catch(err => {
        this.setState({
          resultsError: err,
          resultsPromiseState: 'rejected',
        })
        console.error(err)
      })
  }

  fetchChangeLog = packageString => {
    API.getChangeLog(packageString)
      .then(results => {
        if (this.activeQuery !== packageString) return

        this.setState({
          changeLogResultsPromiseState: 'fulfilled',
          changeLogResults: results,
        })
      })
      .catch(err => {
        this.setState({ changeLogResultsPromiseState: 'rejected' })
        console.error('Fetching history failed:', err)
      })
  }

  handleSearchSubmit = packageString => {
    // Analytics.performedSearch(packageString)
    const normalizedQuery = packageString.trim()

    this.setState(
      {
        results: {},
        changeLogResultsPromiseState: 'pending',
        resultsPromiseState: 'pending',
        inputInitialValue: normalizedQuery,
        similarPackages: [],
        changeLogResults: [],
      },
      () => {
        Router.push(`/package/${normalizedQuery}`)
        // Analytics.pageView('package result')
        this.activeQuery = normalizedQuery
        this.fetchResults(normalizedQuery)
        this.fetchChangeLog(normalizedQuery)
      }
    )
  }

  handleProgressDone = () => {
    this.setState({
      resultsPromiseState: 'fulfilled',
    })
  }

  handleBarClick = reading => {
    const { results } = this.state

    const packageString = `${results.name}@${reading.version}`
    this.setState({ inputInitialValue: packageString })
    this.handleSearchSubmit(packageString)

    // Analytics.graphBarClicked({
    //   packageName: packageString,
    //   idDisabled: reading.disabled,
    // })
  }

  getMetaTags = () => {
    const { router } = this.props
    const { resultsPromiseState, results } = this.state
    let name, version, formattedSizeText, formattedGZIPSizeText

    if (resultsPromiseState === 'fulfilled') {
      name = results.name
      version = results.version
      const formattedSize = formatSize(results.size)
      const formattedGZIPSize = formatSize(results.gzip)
      formattedSizeText = `${formattedSize.size.toFixed(1)} ${formattedSize.unit
        }`
      formattedGZIPSizeText = `${formattedGZIPSize.size.toFixed(1)} ${formattedGZIPSize.unit
        }`
    } else {
      name = parsePackageString(this.getPackageString(router)).name
      version = parsePackageString(this.getPackageString(router)).version
      formattedSizeText = ''
      formattedGZIPSizeText = ''
    }

    const origin =
      typeof window === 'undefined'
        ? 'https://bundlelog.com'
        : window.location.origin

    const title = version ? `${name} v${version}` : name
    const description =
      resultsPromiseState === 'fulfilled'
        ? `Size of ${title} is ${formattedSizeText} (minified), and ${formattedGZIPSizeText} when compressed using GZIP. ${DEFAULT_DESCRIPTION_START}`
        : `Find the size of javascript package ${title}. ${DEFAULT_DESCRIPTION_START}`

    return (
      <MetaTags
        title={`${title} ❘ Bundlelog`}
        image={
          origin + `/api/stats-image?name=${name}&version=${version}&wide=true`
        }
        description={description}
        twitterDescription="Insights into npm packages"
        canonicalPath={`/package/${name}`}
        isLargeImage={true}
      />
    )
  }

  transformContent = (content = '', repoName = '') => {
    // Transform issues link
    let newContent = content
    newContent = newContent.replace(/#\d+/g, (match) => {
      // https://github.com/tradingview/lightweight-charts/issues/831
      return `[${match}](https://github.com/${repoName}/issues/${match.replace('#', '')})`
    });

    // Transform author
    newContent = newContent.replace(/@\w+/g, (match) => {
      console.log(match)
      // https://github.com/tradingview/lightweight-charts/issues/831
      return `[${match}](https://github.com/${match})`;
    });

    return newContent;
  }

  render() {
    const { router } = this.props;
    const {
      inputInitialValue,
      resultsPromiseState,
      resultsError,
      results,
      repoName,
      changeLogResultsPromiseState,
      changeLogResults
    } = this.state

    const { errorName, errorBody, errorDetails } = resolveBuildError(
      resultsError
    )

    const getQuickStatsBar = () =>
      resultsPromiseState === 'fulfilled' && (
        <QuickStatsBar
          description={results.description}
          dependencyCount={results.dependencyCount}
          repository={`https://github.com/${results.repoName}`}
          name={results.name}
        />
      )

    return (
      <ResultLayout>
        {this.getMetaTags()}
        <section className="content-container-wrap">
          <div className="content-container">
            <AutocompleteInputBox footer={getQuickStatsBar()}>
              <AutocompleteInput
                key={inputInitialValue}
                initialValue={inputInitialValue}
                className="result-page__search-input"
                onSearchSubmit={this.handleSearchSubmit}
                renderAsH1={true}
              />
            </AutocompleteInputBox>
            {resultsPromiseState === 'pending' && (
              <div className="result-pending">
                <BuildProgressIndicator
                  isDone={!!results.version}
                  onDone={this.handleProgressDone}
                />
              </div>
            )}

            {changeLogResultsPromiseState === 'rejected' && <div className="change-logs__error">
              <Warning>Not found any change log for this package. If you think this is bug 🐞, please open an issue!</Warning>
            </div>}

            {changeLogResultsPromiseState === 'fulfilled' && <div className="change-logs">
              {changeLogResults.map(release => <div key={release.id} className="change-logs__item">
                <h2 className="title">
                  <a href={release.html_url} target="_blank" rel="noreferrer" >{release.name || release.tag_name}</a>
                </h2>
                <p className="sub">{dayjs(release.created_at).format('DD MMMM, YYYY')} - <span className="change-logs__time--ralative">{dayjs(release.created_at).fromNow()}</span></p>

                <div className="change-logs__links">
                  <a href={release.html_url.replace('releases/tag', 'tree')} target="_blank" rel="noreferrer" >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </a>

                  {/* <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg> */}
                </div>
                <div className="change-logs__content">
                  {/* TODO: Ask auto link issue */}
                  <ReactMarkdown
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '')
                        return !inline && match ? (
                          <SyntaxHighlighter
                            // style={dark}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        )
                      }
                    }}
                  >
                    {this.transformContent(release.body, repoName)}
                  </ReactMarkdown>
                </div>
                <div className="change-logs__stats">
                  <RateChangeLog packageName={router.query.packageString[0]} version={release.tag_name} />
                </div>
              </div>)}
            </div>}

          </div>

          {resultsPromiseState === 'rejected' && (
            <div className="result-error">
              <EmptyBox className="result-error__img" />
              <h2 className="result-error__code">{errorName}</h2>
              <p
                className="result-error__message"
                dangerouslySetInnerHTML={{ __html: errorBody }}
              />
              {errorDetails && (
                <details className="result-error__details">
                  <summary> Stacktrace</summary>
                  <pre>{errorDetails}</pre>
                </details>
              )}
            </div>
          )}
        </section>
      </ResultLayout>
    )
  }
}

export const getServerSideProps = () => {
  return { props: {} }
}

export default withRouter(ResultPage)
