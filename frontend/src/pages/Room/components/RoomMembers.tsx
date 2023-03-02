import { useCallback, useContext, useMemo } from 'react'
import styled from 'styled-components'

import { Button, Heading, Icon, Paragraph } from 'sharedComponents'
import { context } from 'context'
import { colors, snippets } from 'theme'
import { TRoom } from 'types'
import { sanitizeRoomId } from 'utilities'

const ListItem = styled.li`
    list-style: none;
    color: ${colors.rotten.base};
    margin: 0;
    padding: 0;
    font-weight: 400;
    display: flex;
    justify-content: center;
    align-items: center;

    span {
        margin-left: 0.5rem;
    }
`

const List = styled.ul`
    margin: 0;
    padding: 0;
    text-align: center;
`

const RoomMembersWrapper = styled.div`
    ${snippets.section}    
    padding: 1rem;
    box-sizing: border-box;
`

const DefaultMembers = ({ members }: { members: TRoom['members'] }) => {
    return (
        <List>
            {Object.values(members)
                .sort((a, b) => {
                    return b.name.toLowerCase() < a.name.toLowerCase()
                        ? 1
                        : -1
                })
                .map(({ id, name }) => {
                    return (

                        <ListItem key={id}>
                            {name}
                        </ListItem>
                    )
                })}
        </List>
    )
}

const VotingMembers = ({ members, votes, maxVotes }: TRoom) => {
    const votesCastByUser = useMemo(() => {
        const votesCounter: Record<string, number> = {}
        Object.values(members).forEach(({ id }) => { votesCounter[id] = 0 })

        Object.values(votes).forEach(({ userId }) => { votesCounter[userId] += 1 })
        return votesCounter
    }, [votes, members, maxVotes])

    return (
        <List>
            {Object.values(members)
                .sort((a, b) => {
                    return b.name.toLowerCase() < a.name.toLowerCase()
                        ? 1
                        : -1
                })
                .map(({ id, name }) => {
                    return (
                        <ListItem key={id}>
                            {name}  {votesCastByUser[id] > 0 ? <Icon name="done_all" /> : ''}
                        </ListItem>
                    )
                })}
        </List>
    )
}

const RoomMembers = () => {
    const { state: { room }, dispatch } = useContext(context)

    const Body = useMemo(() => {
        if (!room) {
            return null
        }

        switch (room.status) {
            case 'signup':
            case 'conclusion': {
                return <DefaultMembers members={room.members} />
            }
            case 'voting': {
                return <VotingMembers {...room} />
            }
        }
    }, [!!room, room?.members, room?.votes])

    const memberCount = useMemo(() => {
        if (!room) return 0
        return Object.values(room.members).length
    }, [!!room, room?.members])

    const copyRoomToClipboard = useCallback(() => {
        dispatch({ type: 'ADD_MESSAGE', data: { message: 'Room URL copied to clipboard.' } })
        navigator.clipboard.writeText(window.location.href)
    }, [window.location.href])

    return (
        <RoomMembersWrapper>
            <Heading.H2>{memberCount} Member{memberCount !== 1 && 's'}</Heading.H2>
            {Body}
            <Button
                fullWidth
                type="button"
                label="Share Room"
                icon="content_copy"
                variation="rotten"
                onClick={copyRoomToClipboard}
            />
            <Paragraph align="center">Room Code: {sanitizeRoomId(window.location.pathname.replace('/', ''))}</Paragraph>
        </RoomMembersWrapper>
    )
}

export default RoomMembers
