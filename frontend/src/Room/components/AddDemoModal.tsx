import { ApolloError, gql, useMutation } from '@apollo/client'
import { FormEvent, useCallback, useContext, useState } from 'react'

import { Button, Input } from 'sharedComponents'
import { context } from 'context'
import styled from 'styled-components'
import { TRoom, TUser } from 'types'
import { logger } from 'utilities'

type AddDemoProps = {
    closeModal: () => void
    user: TUser,
    room: TRoom
}

const ADD_DEMO_MUTATION = gql`
    mutation AddDemo($roomId: String!, $presenter: String!, $demo: String!) {
        addDemo(roomId: $roomId, presenter: $presenter, demo: $demo) {
            id
    }
    }    
`

const ButtonWrapper = styled.div`
    justify-content: space-between;
    display: flex;
    > button {
        width: 49%;
    }
`

const AddDemo = ({ closeModal, room, user }: AddDemoProps) => {
    const { dispatch } = useContext(context)
    const [demo, setDemo] = useState<string>('')
    const [presenter, setPresenter] = useState<string>(user.name)

    const onAddDemoSuccess = useCallback(() => {
        closeModal()
    }, [])
    const onAddDemoFailure = useCallback((error: ApolloError) => {
        logger(error.message)
        dispatch({ type: 'ADD_MESSAGE', data: { message: error.message } })
    }, [])
    const [addDemoMutation] = useMutation<any>(ADD_DEMO_MUTATION, {
        onCompleted: onAddDemoSuccess,
        onError: onAddDemoFailure
    })

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        addDemoMutation({
            variables: {
                demo,
                presenter,
                roomId: room.id
            }
        })
        closeModal()
    }

    return (
        <div>
            <div>
                <form onSubmit={handleSubmit}>
                    <Input
                        label="What would you like to demo?"
                        name="demo"
                        value={demo}
                        handleChange={(data) => setDemo(data)}
                    />
                    <Input
                        label="Who is presenting?"
                        name="presenter"
                        value={presenter}
                        handleChange={(data) => setPresenter(data)}
                    />
                    <ButtonWrapper>
                        <Button
                            type="button"
                            key="cancel"
                            variation="cancel"
                            label="Cancel"
                            // icon="cancel"
                            onClick={() => closeModal()}
                        />
                        <Button
                            disabled={demo.length === 0}
                            key="submit"
                            type="submit"
                            variation="rotten"
                            label="Submit Demo"
                        />
                    </ButtonWrapper>
                </form>
            </div>
        </div>
    )
}

export default AddDemo
