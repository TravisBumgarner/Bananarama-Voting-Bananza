import { useContext, useCallback, useState, useMemo } from 'react'
import { Button, Heading, Paragraph } from 'sharedComponents'
import { ApolloError, gql, useMutation } from '@apollo/client'

import { TRoom, TUser } from 'types'
import { Exactly, logger } from 'utilities'
import { context } from 'context'
import styled from 'styled-components'
import { colors, snippets } from 'theme'

const AdminWrapper = styled.div`
    ${snippets.section}
    margin-top: 1rem;
    padding: 1rem;
`

const UPDATE_ROOM_MUTATION = gql`
    mutation UpdateRoom($userId: String!, $roomId: String!, $status: RoomStatusEnum!, $maxVotes: Int) {
        updateRoom(userId: $userId, roomId: $roomId, status: $status, maxVotes: $maxVotes) {
            id,
            status
        }
    }    
`

const Admin = ({ room, user }: { room: TRoom, user: TUser }) => {
    const { dispatch, state } = useContext(context)
    const [maxVotes, setMaxVotes] = useState(2)

    if (!room || !user || room.ownerId !== user.id) return null

    const onUpdateRoomSuccess = useCallback((data: { updateRoom: Exactly<TRoom, 'status'> }) => {
        if (room) return // This shouldn't fire before the room's details have been populated
        dispatch({
            type: 'UPDATE_ROOM',
            data: { status: data.updateRoom.status }
        })
    }, [room])
    const onUpdateRoomError = useCallback((error: ApolloError) => {
        logger(error.message)
        dispatch({ type: 'ADD_MESSAGE', data: { message: error.message } })
    }, [])
    const [updateRoomMutation] = useMutation<any>(UPDATE_ROOM_MUTATION, {
        onCompleted: onUpdateRoomSuccess,
        onError: onUpdateRoomError
    })

    const handleRoomChange = useCallback((status: TRoom['status']) => {
        if (!room) return
        const variables = {
            status,
            userId: user.id,
            roomId: room.id,
            ...(status === 'voting' ? { maxVotes } : {})
        }

        updateRoomMutation({ variables })
    }, [room, maxVotes])

    const copyResults = () => {
        const winnersDetails = Object.values(room.demos).filter(({ id }) => room.winners.includes(id))
        let message = ''

        if (winnersDetails.length > 1) message += `${winnersDetails.length} way tie!\n`
        message += `${(new Date().toDateString())}\n`
        winnersDetails.forEach(({ presenter, demo }) => {
            message += `${presenter} - ${demo}\n\n`
        })
        navigator.clipboard.writeText(message)
    }

    const hasDemos = useMemo(() => {
        if (!state.room) return false

        return Object.keys(state.room.demos).length > 0
    }, [state.room?.demos])

    let content
    if (room.status === 'signup') {
        content = (
            <>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
                    <Button
                        variation="rotten"
                        type="button"
                        icon="remove"
                        label="🍌"
                        disabled={maxVotes === 1}
                        onClick={() => setMaxVotes((prev) => prev - 1)}
                    />
                    <Button
                        variation="rotten"
                        icon="add"
                        type="button"
                        label="🍌"
                        onClick={() => setMaxVotes((prev) => prev + 1)}
                    />
                </div>
                <Paragraph align="center" color={colors.rotten.base}>{maxVotes} Votes per Member</Paragraph>
                <Button
                    fullWidth
                    type="button"
                    icon="how_to_vote"
                    variation="rotten"
                    label="Start Voting"
                    disabled={!hasDemos}
                    onClick={() => handleRoomChange('voting')}
                />
            </>
        )
    }
    if (room.status === 'voting') {
        content = (
            <Button
                type="button"
                fullWidth
                variation="rotten"
                label="Announce Results"
                icon="campaign"
                onClick={() => handleRoomChange('conclusion')}
            />
        )
    }
    if (room.status === 'conclusion') {
        content = (
            <>
                <Button
                    type="button"
                    fullWidth
                    variation="rotten"
                    label="Delete Room"
                    icon="delete"
                    onClick={() => handleRoomChange('deletion')}
                />
                <Button
                    type="button"
                    fullWidth
                    variation="rotten"
                    label="Copy Results"
                    icon="content_copy"
                    onClick={copyResults}
                />
            </>
        )
    }

    return (
        <AdminWrapper>
            <Heading.H2>Admin</Heading.H2>
            {content}
        </AdminWrapper>
    )
}

export default Admin
