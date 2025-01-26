import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
  split,
} from '@apollo/client'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient } from 'graphql-ws'
import { useContext, useEffect, useState } from 'react'
import { BrowserRouter, useLocation } from 'react-router-dom'
import styled from 'styled-components'

import { context, Context } from 'context'
import { GlobalStyle } from 'theme'
import { AlertMessage, PageHeader } from './components'
import Lobby from './Lobby'
import MoreFromMe from './MoreFromMe'
import Room from './Room'

const AppWrapper = styled.div`
  min-width: 80vw;
  width: 100%;
  margin: 1rem;
  box-sizing: border-box;
`

const wsLink = new GraphQLWsLink(
  createClient({
    url: __API_WS_ENDPOINT__,
    on: {
      connected: () => console.log('WS Connected'),
      error: (err) => console.error('WS Error:', err),
    },
  })
)
const httpLink = new HttpLink({ uri: __API_HTTP_ENDPOINT__ })

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  httpLink
)

const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: splitLink,
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
        {state.roomId ? <Room /> : <Lobby />}
      </AppWrapper>
      <MoreFromMe />
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
