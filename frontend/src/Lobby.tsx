import { gql, useMutation } from '@apollo/client'
import { useContext, useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import styled from 'styled-components'
import { v4 as uuidv4 } from 'uuid'

import { colors, snippets } from 'theme'
import { Button, Input } from 'sharedComponents'
import { context } from 'context'
import { getLocalStorage, setLocalStorage, logger, sanitizeRoomId } from 'utilities'

const SuperWrapper = styled.div`
  max-width: 700px;
  margin: 0 auto;
`

const Wrapper = styled.div`
  padding: 0 1rem;
  margin: 1rem 0;
  ${snippets.section};
`

const FabulousOrWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  div {
    border: 1px solid ${colors.supergreen.base};
    width: 100%;
    margin: 0 1rem;
  }

  p {
    text-align: center;
    font-size: 2rem;
    color: ${colors.supergreen.base};
    margin: 0.5rem 0;
  }
`

const CREATE_ROOM_MUTATION = gql`
  mutation CreateRoom($ownerId: String!, $ownerName: String!) {
    createRoom(ownerId: $ownerId, ownerName: $ownerName) {
      id
    }
  }
`

const LobbyModal = () => {
    const [createRoomMutation] = useMutation<{ createRoom: { id: string } }>(CREATE_ROOM_MUTATION)
    const {
        dispatch,
        state: { user },
    } = useContext(context)
    const [roomId, setRoomId] = useState('')
    const [name, setName] = useState<string>(getLocalStorage('user').name || '')
    const [searchParams, setSearchParams] = useSearchParams()
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const roomIdParam = sanitizeRoomId(searchParams.get('roomId') || '')
        if (roomIdParam) {
            setRoomId(roomIdParam)
        }
    }, [])

    useEffect(() => {
        let id: string
        if (name === getLocalStorage('user').name) {
            // If the user hasn't changed their name, grab the ID from storage.
            // Otherwise, generate a new one.
            id = getLocalStorage('user').id
        } else {
            id = uuidv4()
        }
        setLocalStorage('user', { name, id })
        dispatch({ type: 'JOIN', data: { name, id } })
    }, [name])

    const createRoom = useCallback(async () => {
        if (!user) return
        setIsLoading(true)
        const response = await createRoomMutation({ variables: { ownerId: user.id, ownerName: user.name } })
        if (response.data?.createRoom.id) {
            dispatch({ type: 'SET_ROOM_ID', data: response.data.createRoom.id })
            setSearchParams({ roomId: response.data.createRoom.id })
        } else {
            setIsLoading(false)
            logger(`failed to create room ${JSON.stringify(response.data)}`)
            dispatch({ type: 'ADD_MESSAGE', data: { message: 'Failed to create room :(' } })
        }
    }, [!!user])

    const joinRoom = useCallback(async () => {
        dispatch({ type: 'SET_ROOM_ID', data: roomId })
    }, [roomId])

    return (
        <SuperWrapper>
            <Wrapper>
                <div>
                    <Input label="What is your name?" name="Name" value={name} handleChange={(data) => setName(data)} />
                </div>
            </Wrapper>
            <Wrapper>
                <div>
                    <Input
                        name="joinroom"
                        value={roomId}
                        label="Enter an Existing Room Code"
                        handleChange={(value: string) => setRoomId(value)}
                    />
                    <Button
                        disabled={roomId.length === 0 || name.length === 0}
                        label="Join Room"
                        icon="door_open"
                        fullWidth
                        onClick={joinRoom}
                        type="button"
                        variation="rotten"
                    />
                </div>
                <FabulousOrWrapper>
                    <div />
                    <p>OR</p>
                    <div />
                </FabulousOrWrapper>
                <Button
                    label="Create Room"
                    icon="door_front"
                    onClick={createRoom}
                    fullWidth
                    type="button"
                    variation="rotten"
                    disabled={isLoading || name.length === 0}
                />

            </Wrapper>
        </SuperWrapper>
    )
}

export default LobbyModal
