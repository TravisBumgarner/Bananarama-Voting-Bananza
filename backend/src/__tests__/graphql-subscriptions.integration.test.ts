// import axios from 'axios'
// import { TRoom, TRoomMember } from 'index'
// import { ApolloClient, gql, InMemoryCache } from '@apollo/client/core'
// import { createClient } from 'graphql-ws'
// import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
// import { graphql } from 'graphql'
// import WebSocket from 'ws'
// import { createBaseRoom } from './utilities'
// import schema from '../schemas'

// const wsLink = new GraphQLWsLink(createClient({ url: 'ws://localhost:8000/graphql', webSocketImpl: WebSocket }))

// const apolloClient = new ApolloClient({
//     cache: new InMemoryCache(),
//     link: wsLink,
// })

// beforeAll(async () => {
//     try {
//         await axios.get('http:/localhost:8000/ok')
//     } catch {
//         throw new Error('Backend is not running')
//     }
// })

// let startingRoom: TRoom
// beforeEach(async () => {
//     startingRoom = await createBaseRoom()
// })

// describe.only('GraphQL Subscriptions', () => {
//     it('gets a room member update', async () => {
//         const subscriptionPromise = new Promise((resolve, reject) => {
//             apolloClient.subscribe({
//                 query: gql`
//                     subscription Member{
//                         member(roomId: "${startingRoom.id}") {
//                             userId
//                             roomId
//                             status
//                             userName
//                         }
//                     }
//                 `
//             }).subscribe({
//                 next: resolve,
//                 error: reject
//             })
//         })

//         const memberUpdate: TRoomMember = {
//             name: 'asdasd',
//             id: 'bobasdid'
//         }
//         const updateRoomMemberSource = `
//             mutation JoinRoom {
//                 joinRoom(roomId: "${startingRoom.id}", userId: "${memberUpdate.id}", userName: "${memberUpdate.name}"){
//                     id,
//                     members {
//                         name,
//                         id
//                     }
//                 }
//             }
//         `
//         await new Promise((r) => { setTimeout(r, 2000) })

//         const response = await graphql({ schema, source: updateRoomMemberSource }) as { data: { updateRoom: Partial<TRoom> } }
//         console.log('RESPONSE PLZ', JSON.stringify(response))
//         const result = await (subscriptionPromise)
//         console.log(result)
//     })
// })
