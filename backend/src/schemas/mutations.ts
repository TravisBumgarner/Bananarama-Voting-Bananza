import { GraphQLInt, GraphQLNonNull, GraphQLObjectType, GraphQLString, } from 'graphql'

import { EPubSubActionType, publishEvent } from '../pubsub'
import { EErrorMessages, TRoom } from '../types'
import inMemoryDatastore from '../inMemoryDatastore'
import { RoomStatusEnum, RoomType, DemoType, VoteType } from './types'

type CreateRoomArgs = {
    ownerId: string
    ownerName: string
}

const createRoom = {
    type: RoomType,
    description: 'Create a Room',
    args: {
        ownerId: { type: new GraphQLNonNull(GraphQLString) },
        ownerName: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (_, args: CreateRoomArgs) => {
        const result = inMemoryDatastore.createRoom({ id: args.ownerId, name: args.ownerName })
        if (result.success) {
            return (result.data)
        }
        throw new Error(result.error)
    },
}

type UpdateRoomArgs = {
    userId: string
    roomId: string
    status: TRoom['status']
    maxVotes?: number
}

const updateRoom = {
    type: RoomType,
    description: 'Update a Room',
    args: {
        userId: { type: new GraphQLNonNull(GraphQLString) },
        roomId: { type: new GraphQLNonNull(GraphQLString) },
        maxVotes: { type: GraphQLInt },
        status: { type: new GraphQLNonNull(RoomStatusEnum) },

    },
    resolve: async (_, args: UpdateRoomArgs) => {
        const currentRoomResult = inMemoryDatastore.getRoom(args.roomId)
        if (!currentRoomResult.success) throw new Error(currentRoomResult.error)

        const userIsNotOwner = currentRoomResult.success && currentRoomResult.data?.ownerId !== args.userId
        if (userIsNotOwner) throw new Error(EErrorMessages.MemberIsNotRoomOwner)
        const updateRoomResult = inMemoryDatastore.updateRoom({
            id: args.roomId,
            status: args.status,
            ...(args.maxVotes ? { maxVotes: args.maxVotes } : {})
        })

        if (updateRoomResult.success) {
            await publishEvent({
                type: EPubSubActionType.ROOM_UPDATE_ACTION,
                data: {
                    roomId: args.roomId,
                    status: args.status,
                    ...(args.maxVotes ? { maxVotes: args.maxVotes } : {})
                }
            })

            return updateRoomResult.data
        }

        throw new Error(updateRoomResult.error)
    },
}

type DeleteRoomArgs = {
    userId: string
    id: string
}
const deleteRoom = {
    type: RoomType,
    description: 'Delete a Room',
    args: {
        userId: { type: new GraphQLNonNull(GraphQLString) },
        id: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (_, args: DeleteRoomArgs) => {
        const currentRoomResult = inMemoryDatastore.getRoom(args.id)
        if (!currentRoomResult.success) throw new Error(currentRoomResult.error)

        const userIsNotOwner = currentRoomResult.success && currentRoomResult.data?.ownerId !== args.userId
        if (userIsNotOwner) throw new Error(EErrorMessages.MemberIsNotRoomOwner)

        const deleteRoomResult = inMemoryDatastore.deleteRoom(args.id)
        if (deleteRoomResult.success) {
            await publishEvent({
                type: EPubSubActionType.ROOM_UPDATE_ACTION,
                data: {
                    roomId: args.id,
                    status: 'deletion'
                }
            })

            return deleteRoomResult.data
        }

        throw new Error(deleteRoomResult.error)
    },
}

type JoinRoomArgs = {
    roomId: string
    userId: string
    userName: string
}

const joinRoom = {
    type: RoomType,
    description: 'Join a Room',
    args: {
        roomId: { type: new GraphQLNonNull(GraphQLString) },
        userId: { type: new GraphQLNonNull(GraphQLString) },
        userName: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (_, args: JoinRoomArgs) => {
        const addMemberResult = inMemoryDatastore.addMember(args.roomId, { name: args.userName, id: args.userId })
        if (addMemberResult.success || addMemberResult.error === EErrorMessages.MemberAlreadyExists) {
            if (addMemberResult.success) {
                await publishEvent({
                    type: EPubSubActionType.MEMBER_UPDATE_ACTION,
                    data: {
                        roomId: args.roomId,
                        userId: args.userId,
                        userName: args.userName,
                        status: 'join'
                    }
                })
            }
            const getRoomResult = inMemoryDatastore.getRoom(args.roomId)
            if (getRoomResult.success) {
                return getRoomResult.data
            }
            throw new Error(getRoomResult.error)
        }
        throw new Error(addMemberResult.error)
    },
}

type AddDemoArgs = {
    roomId: string
    presenter: string
    demo: string
}

const addDemo = {
    type: DemoType,
    description: 'Create a Demo',
    args: {
        roomId: { type: new GraphQLNonNull(GraphQLString) },
        presenter: { type: new GraphQLNonNull(GraphQLString) },
        demo: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (_, args: AddDemoArgs) => {
        const addDemoResult = inMemoryDatastore.addDemo(args.roomId, args.presenter, args.demo)
        if (addDemoResult.success) {
            await publishEvent({
                type: EPubSubActionType.ADD_DEMO_ACTION,
                data: { ...addDemoResult.data, roomId: args.roomId }
            })
            return addDemoResult.data
        }
        throw new Error(addDemoResult.error)
    },
}

type AddVoteArgs = {
    id: string
    roomId: string
    userId: string
    demoId: string
}

const addVote = {
    type: VoteType,
    description: 'Add a Vote',
    args: {
        roomId: { type: new GraphQLNonNull(GraphQLString) },
        userId: { type: new GraphQLNonNull(GraphQLString) },
        demoId: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (_, args: AddVoteArgs) => {
        const addVoteResult = inMemoryDatastore.addVote(args.roomId, args.userId, args.demoId)
        if (addVoteResult.success) {
            await publishEvent({
                type: EPubSubActionType.ADD_VOTE_ACTION,
                data: { ...addVoteResult.data, roomId: args.roomId }
            })
            return addVoteResult.data
        }
        throw new Error(addVoteResult.error)
    },
}

type DeleteVoteArgs = {
    id: string
    roomId: string
    userId: string
    voteId: string
}

const deleteVote = {
    type: VoteType,
    description: 'Delete a Vote',
    args: {
        roomId: { type: new GraphQLNonNull(GraphQLString) },
        userId: { type: new GraphQLNonNull(GraphQLString) },
        voteId: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (_, args: DeleteVoteArgs) => {
        const deleteVoteResult = inMemoryDatastore.deleteVote(args.roomId, args.userId, args.voteId)
        if (deleteVoteResult.success) {
            // await publishEvent({
            //     type: EPubSubActionType.ADD_VOTE_ACTION,
            //     data: { ...deleteVoteResult.data, roomId: args.roomId }
            // })
            return {
                id: deleteVoteResult.data
            }
        }
        throw new Error(deleteVoteResult.error)
    },
}

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        joinRoom,
        createRoom,
        updateRoom,
        addDemo,
        addVote,
        deleteRoom,
        deleteVote
    })
})

export default RootMutationType
