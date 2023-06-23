import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql'

import inMemoryDatastore from '../inMemoryDatastore'
import { RoomType } from './types'

type RoomArgs = {
    id: string
}

const room = {
    type: RoomType,
    description: 'Get a room',
    args: {
        id: { type: new GraphQLNonNull(GraphQLString) }
    },
    resolve: async (_, args: RoomArgs) => {
        console.log(inMemoryDatastore.rooms)
        const result = inMemoryDatastore.getRoom(args.id)
        if (!result.success) { throw new Error(result.error) }

        return result.data
    },
}

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        room
    }),
})

export default RootQueryType
