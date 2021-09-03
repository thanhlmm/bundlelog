import React, { PureComponent } from 'react'
// import Analytics from 'client/analytics'

import ResultLayout from 'client/components/ResultLayout'
import AutocompleteInput from 'client/components/AutocompleteInput'
import AutocompleteInputBox from 'client/components/AutocompleteInputBox'
import BuildProgressIndicator from 'client/components/BuildProgressIndicator'
import Router, { withRouter } from 'next/router'
import semver from 'semver'
import ReactMarkdown from 'react-markdown'
import { parsePackageString } from 'utils/common.utils'
import {
  getTimeFromSize,
  DownloadSpeed,
  resolveBuildError,
  formatSize,
} from 'utils'
import Stat from 'client/components/Stat'

import API from 'client/api'
import MetaTags, { DEFAULT_DESCRIPTION_START } from 'client/components/MetaTags'

import EmptyBox from '../../../client/assets/empty-box.svg'
import QuickStatsBar from 'client/components/QuickStatsBar/QuickStatsBar'

import Warning from 'client/components/Warning/Warning'

const isEmptyObject = (input) => {
  try {
    return !!Object.keys(input).length
  } catch (error) {
    return false;
  }
}

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
        console.log(results);
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

  render() {
    const {
      inputInitialValue,
      resultsPromiseState,
      resultsError,
      results,
      changeLogResultsPromiseState,
      changeLogResults
    } = this.state

    const { errorName, errorBody, errorDetails } = resolveBuildError(
      resultsError
    )

    console.log(resultsPromiseState);
    console.log(results);

    const getQuickStatsBar = () =>
      resultsPromiseState === 'fulfilled' && (
        <QuickStatsBar
          description={results.description}
          dependencyCount={results.dependencyCount}
          repository={results.repository}
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

            {changeLogResultsPromiseState === 'fulfilled' && <div className="change-logs">
              {changeLogResults.map(release => <div key={release.id}>
                <h2>
                  <a href={release.html_url} target="_blank" rel="noreferrer" >${release.name}</a>
                </h2>
                <p className="sub">{release.created_at}</p>
                <div className="chane-logs__content">
                  <ReactMarkdown>{release.body}</ReactMarkdown>
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
