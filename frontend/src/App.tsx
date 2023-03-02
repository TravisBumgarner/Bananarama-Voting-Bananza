import { useContext, useEffect, useState } from 'react'
import { BrowserRouter, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { ApolloClient, HttpLink, InMemoryCache, ApolloProvider, split } from '@apollo/client'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient } from 'graphql-ws'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'

import { GlobalStyle } from 'theme'
import { context, Context } from 'context'
import { AlertMessage, PageHeader, Router } from './components'
import { JoinModal } from './modals'
import Modal from './sharedComponents/Modal'

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
    const { state, dispatch } = useContext(context)
    const location = useLocation()
    const [showJoinModal, setShowJoinModal] = useState<boolean>(true)

    useEffect(() => {
        dispatch({ type: 'RESET_ROOM_STATE' })
    }, [location])

    useEffect(() => {
        // retrigger modal if user clicks outside
        if (!showJoinModal && !state.user) setShowJoinModal(true)
    }, [showJoinModal, state.user])

    return (
        <>
            <AppWrapper>
                <PageHeader />
                <AlertMessage />
                <Router />
            </AppWrapper>
            <Modal
                showModal={showJoinModal}
                closeModal={() => setShowJoinModal(false)}
                contentLabel="Welcome!"
            >
                <JoinModal closeModal={() => setShowJoinModal(false)} />
            </Modal>
        </>
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
