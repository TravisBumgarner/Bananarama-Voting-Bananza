import { EErrorMessages } from './types'

const errorLookup: Record<EErrorMessages, { message: string, statusCode: number }> = {
    [EErrorMessages.MemberAlreadyExists]: {
        message: 'That member already exists in the selected room',
        statusCode: 403
    },
    [EErrorMessages.RoomDoesNotExist]: {
        message: 'That room does not exist',
        statusCode: 403
    },
    [EErrorMessages.MemberIsNotRoomOwner]: {
        message: 'The member is not the room owner',
        statusCode: 403
    },
    [EErrorMessages.VoteDoesNotExist]: {
        message: 'The vote does not exist',
        statusCode: 403
    }
}

export default errorLookup
