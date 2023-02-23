import { v4 as uuid4 } from 'uuid'
import { generateID } from '../utilities'

import { TRoom, TRoomMember, EErrorMessages, TDemo, TVote } from '../types'

type Success<T> = {
    success: true
    data: T
}

type Failure = {
    success: false
    error: EErrorMessages
}

type Response<T = undefined> =
    | Failure
    | Success<T>

class InMemoryDatastore {
    rooms: Record<string, TRoom>

    constructor() {
        this.rooms = {}
    }

    createRoom(owner: TRoomMember): Response<TRoom> {
        let roomId = generateID(4)

        while ((roomId in this.rooms)) {
            // I seriously doubt we'll ever have collisions where this will be a problem.
            // ~ Famous last words.
            roomId = generateID(4)
        }

        this.rooms[roomId] = {
            id: roomId,
            ownerId: owner.id,
            maxVotes: 2,
            icon: 'banana',
            members: [owner],
            status: 'signup',
            demos: [],
            votes: []
        }
        return {
            success: true,
            data: this.rooms[roomId]
        }
    }

    updateRoom(room: Partial<TRoom>): Response<TRoom> {
        if (room.id && room.id in this.rooms) {
            this.rooms[room.id] = { ...this.rooms[room.id], ...room }
            return ({ success: true, data: this.rooms[room.id] })
        }
        return ({ success: false, error: EErrorMessages.RoomDoesNotExist })
    }

    getRoom(id: string): Response<TRoom> {
        if (id in this.rooms) {
            return ({ success: true, data: this.rooms[id] })
        }
        return ({ success: false, error: EErrorMessages.RoomDoesNotExist })
    }

    deleteRoom(id: string): Response<{ id: string }> {
        const wasDeleted = delete this.rooms[id]
        if (wasDeleted) {
            return {
                success: true,
                data: { id }
            }
        }
        return {
            success: false,
            error: EErrorMessages.RoomDoesNotExist
        }
    }

    addMember(roomId: string, member: TRoomMember): Response<undefined> {
        if (roomId in this.rooms) {
            const currentMemberIds = this.rooms[roomId].members.map(({ id }) => id)
            if (!currentMemberIds.includes(member.id)) {
                this.rooms[roomId].members.push(member)
                return {
                    success: true,
                    data: undefined
                }
            }
            return {
                success: false,
                error: EErrorMessages.MemberAlreadyExists
            }
        }
        return {
            success: false,
            error: EErrorMessages.RoomDoesNotExist
        }
    }

    addDemo(roomId: string, presenter: string, demo: string): Response<TDemo> {
        if (roomId in this.rooms) {
            const newDemo = {
                id: uuid4(),
                demo,
                presenter
            }
            this.rooms[roomId].demos.push(newDemo)
            return {
                success: true,
                data: newDemo
            }
        }
        return {
            success: false,
            error: EErrorMessages.RoomDoesNotExist
        }
    }

    addVote(roomId: string, userId: string, demoId: string): Response<TVote> {
        if (roomId in this.rooms) {
            const newVote = {
                id: uuid4(),
                demoId,
                userId,
                roomId
            }
            this.rooms[roomId].votes.push(newVote)
            return {
                success: true,
                data: newVote
            }
        }
        return {
            success: false,
            error: EErrorMessages.RoomDoesNotExist
        }
    }

    deleteVote(roomId: string, userId: string, voteId: string): Response<TVote['id']> {
        if (roomId in this.rooms) {
            const voteToDeleteIndex = this.rooms[roomId].votes.findIndex(({ id }) => id === voteId)
            if (voteToDeleteIndex !== -1 && userId === this.rooms[roomId].votes[voteToDeleteIndex].userId) {
                const modifiedVotes = [
                    ...this.rooms[roomId].votes.slice(0, voteToDeleteIndex),
                    ...this.rooms[roomId].votes.slice(voteToDeleteIndex + 1,)
                ]
                this.rooms[roomId].votes = modifiedVotes

                return {
                    success: true,
                    data: voteId
                }
            }
            return {
                success: false,
                error: EErrorMessages.VoteDoesNotExist
            }
        }
        return {
            success: false,
            error: EErrorMessages.RoomDoesNotExist
        }
    }
}

const inMemoryDatastore = new InMemoryDatastore()

export default inMemoryDatastore
