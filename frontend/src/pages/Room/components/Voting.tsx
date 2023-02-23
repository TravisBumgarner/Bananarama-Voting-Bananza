import { ApolloError, gql, useMutation, useSubscription } from '@apollo/client'
import { useCallback, useContext, useMemo, useState } from 'react'
import styled from 'styled-components'

import { Button, Heading, Paragraph, RoomWrapper } from 'sharedComponents'
import { context } from 'context'
import { TDemo, TRoom, TUser, TVote } from 'types'
import { logger } from 'utilities'
import DemoWrapper from './DemoWrapper'

const VOTE_SUBSCRIPTION = gql`
  subscription Vote($roomId: String!) {
    vote(roomId: $roomId) {
        roomId
        userId
        demoId
        id
    }
  }
`

const ADD_VOTE_MUTATION = gql`
    mutation AddVote($roomId: String!, $userId: String!, $demoId: String!) {
        addVote(roomId: $roomId, userId: $userId, demoId: $demoId) {
            id
        }
    }    
`

const DemosWrapper = styled.ul`
    list-style: none;
    margin: 1rem 0;
    padding: 0;
`

type DemoProps = {
    demo: TDemo
    canVote: boolean
    // user: TUser
    // room: TRoom
    toggleVote: (demoId: string) => void
    userHasVotedFor: boolean
}
const Demo = ({ demo, canVote, toggleVote, userHasVotedFor }: DemoProps) => {
    const handleClick = useCallback(() => toggleVote(demo.id), [toggleVote])
    const label = useMemo(() => (userHasVotedFor ? 'Remove Vote' : 'Add Vote'), [userHasVotedFor])

    const disabled = useMemo(() => {
        if (userHasVotedFor) return false
        return !canVote
    }, [canVote, userHasVotedFor])

    return (
        <DemoWrapper>
            <div>
                <Heading.H3>{demo.demo}</Heading.H3>
                <Paragraph>{demo.presenter}</Paragraph>
            </div>
            <div style={{ fontSize: '3rem' }}>
                <Button
                    disabled={disabled}
                    type="button"
                    label={label}
                    onClick={handleClick}
                    icon="done_all"
                    variation="rotten"
                />
            </div>
        </DemoWrapper>
    )
}

const Voting = ({ room, user }: { room: TRoom, user: TUser }) => {
    const { dispatch } = useContext(context)
    const [votesCast, setVotesCast] = useState<string[]>([])

    const onAddVoteSuccess = useCallback(() => {
        // setIsCastingVote(false)
    }, [])

    const onAddVoteFailure = useCallback((error: ApolloError) => {
        dispatch({ type: 'ADD_MESSAGE', data: { message: error.message } })
    }, [])

    const [addVoteMutation] = useMutation<any>(ADD_VOTE_MUTATION, {
        onCompleted: onAddVoteSuccess,
        onError: onAddVoteFailure
    })

    useSubscription<{ vote: TVote }>(VOTE_SUBSCRIPTION, {
        variables: {
            roomId: room.id
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
            if (!data.data) return
            const { userId, demoId, roomId, id } = data.data.vote
            dispatch({
                type: 'ADD_VOTES',
                data: {
                    [id]: { userId, roomId, demoId, id }
                }
            })
        },
    })

    const voteRemaining = useMemo(() => {
        return room.maxVotes - votesCast.length
    }, [votesCast, room.maxVotes])

    const hasUserAlreadyVoted = useMemo(() => {
        // Check on page load to see if user has cast votes already.s
        return Object.values(room.votes).filter(({ userId }) => userId === user.id).length > 0
    }, [])

    const toggleVote = (demoId: string) => {
        const demoIndex = votesCast.indexOf(demoId)
        if (demoIndex === -1) {
            setVotesCast([...votesCast, demoId])
        } else {
            setVotesCast((prev) => {
                const newVotesCast = [...prev].filter((value) => !(value === demoId))
                return newVotesCast
            })
        }
    }

    const submitVotes = useCallback(async () => {
        votesCast.forEach((demoId) => {
            // This can be refactored
            addVoteMutation({
                variables: {
                    userId: user.id,
                    roomId: room.id,
                    demoId
                }
            })
        })
    }, [votesCast])

    return (
        <RoomWrapper>
            <Heading.H2>Voting</Heading.H2>

            <DemosWrapper>
                {Object.values(room.demos).map((demo) => (
                    <Demo
                        canVote={!hasUserAlreadyVoted && voteRemaining > 0}
                        demo={demo}
                        key={demo.id}
                        userHasVotedFor={votesCast.indexOf(demo.id) > -1}
                        toggleVote={toggleVote}
                    />
                ))}
            </DemosWrapper>
            <div>
                <Button
                    type="button"
                    fullWidth
                    variation="rotten"
                    label="Submit Votes"
                    icon="add"
                    disabled={votesCast.length === 0 || hasUserAlreadyVoted}
                    onClick={submitVotes}
                />
            </div>
        </RoomWrapper>
    )
}

export default Voting
