import { Loading } from 'sharedComponents'
import { useNavigate } from 'react-router-dom'
import { useMemo, useContext, useState, useCallback, useEffect } from 'react'
import { ApolloError, gql, useMutation, useSubscription, } from '@apollo/client'
import styled from 'styled-components'

import { arrayToObject, logger, sanitizeRoomId } from 'utilities'
import { context } from 'context'
import { TDemo, TRoom, TRoomMember, TRoomMemberChange, TVote } from '../types'
import { Conclusion, RoomMembers, Signup, Voting, Admin } from './components'

const Sidebar = styled.div`
    width: 190px;
    min-width: 190px;
    margin-right: 1rem;


    button {
        margin-bottom: 0;
    }
`

const JOIN_ROOM_MUTATION = gql`
    mutation JoinRoom($roomId: String!, $userId: String!, $userName: String!) {
        joinRoom(roomId: $roomId, userId: $userId, userName: $userName){
            id
            ownerId
            maxVotes
            icon
            status
            demos {
                demo,
                id,
                presenter
            }
            members {
                name
                id
            }
            votes {
                userId
                demoId
                id,
                roomId
            }
        }
    }
`

const MEMBER_SUBSCRIPTION = gql`
  subscription Member($roomId: String!) {
    member(roomId: $roomId) {
        userId
        roomId
        status
        userName
    }
  }
`

const ROOM_SUBSCRIPTION = gql`
subscription Room($roomId: String!) {
    room(roomId: $roomId) {
       roomId,
       status,
       maxVotes
    }
  }
`

const Wrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: start;
`

type TRoomGraphQL = {
    id: string
    ownerId: TRoomMember['id']
    icon: 'banana'
    maxVotes: number
    members: TRoomMember[]
    status: 'signup' | 'voting' | 'conclusion' | 'deletion'
    demos: TDemo[]
    votes: TVote[]
    winners: TDemo['id'][]
}

const Room = () => {
    const [isLoading, setIsLoading] = useState(true)
    const { dispatch, state } = useContext(context)
    const navigate = useNavigate()

    const onJoinRoomSuccess = useCallback(({ joinRoom }: { joinRoom: TRoomGraphQL }) => {
        const { votes, members, demos, ...rest } = joinRoom
        const mappedData = {
            ...rest,
            votes: arrayToObject(votes, 'id'),
            members: arrayToObject(members, 'id'),
            demos: arrayToObject(demos, 'id'),
        }

        dispatch({
            type: 'ENTER_ROOM',
            data: mappedData
        })
        setIsLoading(false)
    }, [])
    const onJoinRoomFailure = useCallback((error: ApolloError) => {
        dispatch({ type: 'ADD_MESSAGE', data: { message: error.message } })
        logger(error.message)
        dispatch({ type: 'REMOVE_ROOM_ID' })
    }, [])
    const [joinRoomMutation] = useMutation<any>(JOIN_ROOM_MUTATION, {
        onCompleted: onJoinRoomSuccess,
        onError: onJoinRoomFailure
    })

    useSubscription<{ member: TRoomMemberChange }>(MEMBER_SUBSCRIPTION, {
        variables: {
            roomId: state.roomId
        },
        onError: (error) => {
            logger(error)
            dispatch({
                type: 'ADD_MESSAGE',
                data: {
                    message: 'Hmm something went wrong, try reloading.'
                }
            })
        },
        onData: ({ data }) => {
            if (!state.room || !data.data) return
            const { userId, status, userName } = data.data.member
            if (status === 'join') {
                dispatch({
                    type: 'ADD_MEMBERS',
                    data: { [userId]: { id: userId, name: userName } }
                })
            }
        },
    })

    useSubscription<{ room: TRoom }>(ROOM_SUBSCRIPTION, {
        variables: {
            roomId: state.roomId
        },
        onError: (error) => {
            logger(error)
            dispatch({
                type: 'ADD_MESSAGE',
                data: {
                    message: 'Hmm something went wrong, try reloading.'
                }
            })
        },
        onData: ({ data }) => {
            if (!state.room || !data.data) return

            const { status, maxVotes: updatedMaxVotes } = data.data.room
            dispatch({ type: 'UPDATE_ROOM', data: { status, ...(updatedMaxVotes ? { maxVotes: updatedMaxVotes } : {}) } })
        },
    })

    useEffect(() => {
        if (!state.user || state.user.name.length === 0) {
            // Don't join room until user has entered their name.
            return
        }

        joinRoomMutation({
            variables: {
                userName: state.user.name,
                userId: state.user.id,
                roomId: state.roomId ? sanitizeRoomId(state.roomId) : undefined
            }
        })
    }, [sanitizeRoomId, state.user])

    const Content = useMemo(() => {
        if (!state.room || !state.user) return

        switch (state.room.status) {
            case 'signup': {
                return <Signup room={state.room} />
            }
            case 'voting': {
                return <Voting user={state.user} room={state.room} />
            }
            case 'conclusion': {
                return <Conclusion room={state.room} />
            }
        }
    }, [state.room])

    useEffect(() => {
        if (state.room && state.room.status === 'deletion') {
            dispatch({ type: 'ADD_MESSAGE', data: { message: 'Room has closed.' } })
            navigate('/')
        }
    }, [state.room && state.room.status])

    if (isLoading) return <Loading />

    if (!state.room || !state.room.members || !state.user) {
        navigate('/')
        return null
    }

    return (
        <Wrapper>
            <Sidebar>
                <RoomMembers />
                <Admin room={state.room} user={state.user} />
            </Sidebar>
            {Content}
        </Wrapper>
    )
}
export default Room
