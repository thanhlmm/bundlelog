import '../styles/globals.css'

import 'client/components/Layout/Layout.scss'
import 'client/components/AutocompleteInput/AutocompleteInput.scss';
import 'client/components/AutocompleteInputBox/AutocompleteInputBox.scss';
import 'client/components/BarGraph/BarGraph.scss';
import 'client/components/BuildProgressIndicator/BuildProgressIndicator.scss';
import 'client/components/Icons/SideEffectIcon.scss';
import 'client/components/Icons/TreeShakeIcon.scss';
import 'client/components/BuildProgressIndicator/BuildProgressIndicator.scss';
import 'client/components/Icons/SideEffectIcon.scss';
import 'client/components/Icons/TreeShakeIcon.scss';
import 'client/components/JumpingDots/JumpingDots.scss';
import 'client/components/Layout/Layout.scss';
import 'client/components/ProgressHex/ProgressHex.scss';
import 'client/components/JumpingDots/JumpingDots.scss';
import 'client/components/Layout/Layout.scss';
import 'client/components/ProgressHex/ProgressHex.scss';
import 'client/components/QuickStatsBar/QuickStatsBar.scss';
import 'client/components/ResultLayout/ResultLayout.scss';
import 'client/components/SimilarPackageCard/SimilarPackageCard.scss';
import 'client/components/Stat/Stat.scss';
import 'client/components/Warning/Warning.scss';

import 'pages/package/[...packageString]/ResultPage.scss';

import './index.scss';

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default MyApp
