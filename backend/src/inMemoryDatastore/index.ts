import { v4 as uuid4 } from 'uuid'
import { hri } from 'human-readable-ids'

import { TRoom, TParticipant, EErrorMessages, TEntry, TVote } from '../types'

type Success<T> = {
    success: true
    data?: T
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

    createRoom(owner: TParticipant): Response<TRoom> {
        const roomId = hri.random()
        this.rooms[roomId] = {
            id: roomId,
            ownerId: owner.id,
            maxVotes: 2,
            icon: 'banana',
            members: [owner],
            status: 'signup',
            entries: [],
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

    deleteRoom(id: string): Response {
        const wasDeleted = delete this.rooms[id]
        if (wasDeleted) {
            return {
                success: true
            }
        }
        return {
            success: false,
            error: EErrorMessages.RoomDoesNotExist
        }
    }

    addMember(roomId: string, member: TParticipant): Response {
        if (roomId in this.rooms) {
            const currentMemberIds = this.rooms[roomId].members.map(({ id }) => id)
            if (!currentMemberIds.includes(member.id)) {
                this.rooms[roomId].members.push(member)
                return {
                    success: true,
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

    addEntry(roomId: string, userId: string, entry: string): Response<TEntry> {
        if (roomId in this.rooms) {
            const newEntry = {
                id: uuid4(),
                entry,
                userId
            }
            this.rooms[roomId].entries.push(newEntry)
            return {
                success: true,
                data: newEntry
            }
        }
        return {
            success: false,
            error: EErrorMessages.RoomDoesNotExist
        }
    }

    addVote(roomId: string, userId: string, entryId: string): Response<TVote> {
        if (roomId in this.rooms) {
            const newVote = {
                id: uuid4(),
                entryId,
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
}

const inMemoryDatastore = new InMemoryDatastore()

export default inMemoryDatastore
