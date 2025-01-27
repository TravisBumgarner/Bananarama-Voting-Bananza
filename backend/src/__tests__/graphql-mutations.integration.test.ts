import axios from 'axios'
import { graphql } from 'graphql'
import { TRoom } from 'index'
import schema from '../schemas'
import { createBaseRoom } from './utilities'

beforeAll(async () => {
    try {
        await axios.get('http:/localhost:8000/ok')
    } catch {
        throw new Error('Backend is not running')
    }
})

let startingRoom: TRoom
beforeEach(async () => {
    startingRoom = await createBaseRoom()
})

describe('GraphQL Mutations', () => {
    it('deletes a room', async () => {
        const deleteRoomSource = `
            mutation {
                deleteRoom(id: "${startingRoom.id}", userId: "${startingRoom.ownerId}") {
                    id
                }
            }
        `
        const { data: { deleteRoom } } = await graphql({ schema, source: deleteRoomSource }) as any
        expect(deleteRoom.id).toEqual(startingRoom.id)
        // Need a test for subscription
    })

    it('updates a room to voting', async () => {
        const roomUpdates: Partial<TRoom> = {
            status: 'voting',
            maxVotes: 4
        }
        const updateRoomSource = `
            mutation {
                updateRoom(
                    userId: "${startingRoom.ownerId}",
                    roomId:"${startingRoom.id}",
                    status: ${roomUpdates.status},
                    maxVotes: ${roomUpdates.maxVotes}
                ) {
                    id,
                    status,
                    maxVotes
                }
            }
        `
        // Need to figure out how to show errors when they occur. Currently they get swallowed
        // Probably an issue with `as X`
        const { data: { updateRoom } } = await graphql({ schema, source: updateRoomSource }) as { data: { updateRoom: Partial<TRoom> } }

        const expected: Partial<TRoom> = { ...startingRoom, ...roomUpdates }
        expect(expected.id).toEqual(updateRoom.id)
        expect(expected.status).toEqual(updateRoom.status)
        expect(expected.maxVotes).toEqual(updateRoom.maxVotes)
    })

    it('updates a room to conclusion', async () => {
        const roomUpdates: Partial<TRoom> = {
            status: 'conclusion',
        }
        const updateRoomSource = `
            mutation {
                updateRoom(
                    userId: "${startingRoom.ownerId}",
                    roomId:"${startingRoom.id}",
                    status: ${roomUpdates.status},
                ) {
                    id,
                    status,
                    maxVotes
                }
            }
        `

        const { data: { updateRoom } } = await graphql({ schema, source: updateRoomSource }) as { data: { updateRoom: Partial<TRoom> } }

        const expected: Partial<TRoom> = { ...startingRoom, ...roomUpdates }
        expect(expected.id).toEqual(updateRoom.id)
        expect(expected.status).toEqual(updateRoom.status)
    })
})
