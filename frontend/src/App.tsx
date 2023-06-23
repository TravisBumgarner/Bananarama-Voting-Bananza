import { useContext, useEffect } from 'react'
import { BrowserRouter, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { ApolloClient, HttpLink, InMemoryCache, ApolloProvider, split } from '@apollo/client'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient } from 'graphql-ws'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'

import { GlobalStyle } from 'theme'
import { context, Context } from 'context'
import { AlertMessage, PageHeader, Router } from './components'

const AppWrapper = styled.div`
    min-width: 80vw;
    width: 100%;
    margin: 1rem;
    box-sizing: border-box;
`

const wsLink = new GraphQLWsLink(createClient({ url: __API_WS_ENDPOINT__ }))
const httpLink = new HttpLink({ uri: __API_HTTP_ENDPOINT__ })

const splitLink = split(
    ({ query }) => {
        const definition = getMainDefinition(query)
        return (
            definition.kind === 'OperationDefinition'
            && definition.operation === 'subscription'
        )
    },
    wsLink,
    httpLink,
)

const apolloClient = new ApolloClient({
    cache: new InMemoryCache(),
    link: splitLink
})

const App = () => {
    const { dispatch } = useContext(context)
    const location = useLocation()

    useEffect(() => {
        dispatch({ type: 'RESET_ROOM_STATE' })
    }, [location])

    return (
        <AppWrapper>
            <PageHeader />
            <AlertMessage />
            <Router />
        </AppWrapper>
    )
}

const ContextWrapper = () => (
    <BrowserRouter>
        <ApolloProvider client={apolloClient}>
            <Context>
                <>
                    <GlobalStyle />
                    <App />
                </>
            </Context>
        </ApolloProvider>
    </BrowserRouter>
)

export default ContextWrapper
