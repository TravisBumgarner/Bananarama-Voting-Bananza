import { render } from 'react-dom'
import Modal from 'react-modal'
import * as Sentry from '@sentry/react'

import App from './App'
import Error from './Error'

const ROOT = 'root'

Modal.setAppElement(`#${ROOT}`)

Sentry.init({
    dsn: 'https://be149859bef64302ba82f80965acdda0@o196886.ingest.sentry.io/4505407011749888',
    integrations: [
        new Sentry.BrowserTracing({
            // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
            tracePropagationTargets: [
                'localhost',
                /^https:\/\/voting.sillysideprojects\.com/,
            ],
        }),
        new Sentry.Replay(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
})

const SentryWrapper = () => (
    <Sentry.ErrorBoundary fallback={<Error />}>
        <App />
    </Sentry.ErrorBoundary>
)

render(<SentryWrapper />, document.getElementById(ROOT))
