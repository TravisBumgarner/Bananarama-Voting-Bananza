import * as Sentry from '@sentry/node'
import bodyParser from 'body-parser'
import cors from 'cors'
import express from 'express'
import { graphqlHTTP } from 'express-graphql'
import { useServer } from 'graphql-ws/lib/use/ws'
import { WebSocketServer } from 'ws'

import errorLookup from './errorLookup'
import schema from './schemas'
import { logger } from './utilities'

const app = express()

Sentry.init({
    dsn: 'https://21f36e63b04346e58ab22979c147b1b4@o196886.ingest.sentry.io/4505407029903360',
    integrations: [
        // enable HTTP calls tracing
        new Sentry.Integrations.Http({ tracing: true }),
        // enable Express.js middleware tracing
        new Sentry.Integrations.Express({ app }),
        // Automatically instrument Node.js libraries and frameworks
        ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),
    ],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
})

process.on('uncaughtException', (error: any) => logger(error))
process.on('unhandledRejection', (error: any) => logger(error))

app.use(Sentry.Handlers.requestHandler())
app.use(Sentry.Handlers.tracingHandler())

const CORS_DEV = [
    'localhost:3000',
]

const COORS_PROD = [
    'bananarama.best'
]

// For Cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    next()
})
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? COORS_PROD
        : CORS_DEV

}))

app.use(bodyParser.json())

app.get('/ok', async (req: express.Request, res: express.Response) => {
    res.send('pong!')
})

app.get('/api/ok', async (req: express.Request, res: express.Response) => {
    res.send('api pong!')
})

app.use('/graphql', graphqlHTTP(() => ({
    schema,
    graphiql: process.env.NODE_ENV !== 'production',
    customFormatErrorFn: (err) => {
        logger(err.message)
        if (err.message in errorLookup) return errorLookup[err.message]
        return {
            statusCode: 500,
            message: 'Something went wrong'
        }
    }
})))

app.use(Sentry.Handlers.errorHandler())
app.use((err, req: express.Request, res: express.Response) => {
    res.statusCode = 500
})
const PORT = 8000
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`App listening at http://0.0.0.0:${PORT}`) //eslint-disable-line

    const wsServer = new WebSocketServer({ server, path: '/graphql' })
    useServer({ schema }, wsServer)
})
