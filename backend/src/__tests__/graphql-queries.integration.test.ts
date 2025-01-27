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

describe('GraphQL Queries', () => {
    it('gets a room', async () => {
        const roomSource = `
            query {
                room(id: "${startingRoom.id}") {
                    ownerId,
                    id
                }
            }
        `
        const { data: { room } } = await graphql({ schema, source: roomSource }) as any
        expect(room.id).toEqual(startingRoom.id)
    })
})
