import { gql, useSubscription } from '@apollo/client'
import { useContext } from 'react'
import styled from 'styled-components'

import { Heading, RoomWrapper, Paragraph } from 'sharedComponents'
import { context } from 'context'

import { TDemo, TRoom } from 'types'
import { logger } from 'utilities'
import DemoWrapper from './DemoWrapper'

const DEMO_SUBSCRIPTION = gql`
  subscription Demo($roomId: String!) {
    demo(roomId: $roomId) {
        roomId
        presenter
        demo,
        id
    }
  }
`

const DemosWrapper = styled.ul`
    list-style: none;
    margin: 0;
    padding: 0;
    max-height:60vh;
    overflow-y: auto;
`

const Demo = ({ demo }: { demo: TDemo }) => {
    return (
        <DemoWrapper>
            <div>
                <Heading.H3>{demo.demo}</Heading.H3>
                <Paragraph>{demo.presenter}</Paragraph>
            </div>
            <div>
                {/* spaceholder */}
            </div>
        </DemoWrapper>
    )
}

const Signup = ({ room }: { room: TRoom }) => {
    const { dispatch } = useContext(context)

    useSubscription<{ demo: TDemo }>(DEMO_SUBSCRIPTION, {
        variables: {
            roomId: room.id
        },
        onError: (error) => {
            logger(error)
            dispatch({
                type: 'ADD_MESSAGE',
                data: {
                    message: 'Something went wrong.'
                }
            })
        },
        onData: ({ data }) => {
            if (!data.data) return
            const { presenter, roomId, demo, id } = data.data.demo
            dispatch({
                type: 'ADD_DEMOS',
                data: {
                    [id]: {
                        presenter, roomId, demo, id
                    }
                }
            })
        },
    })

    return (
        <RoomWrapper>
            <Heading.H2>Demos</Heading.H2>
            <DemosWrapper>
                {Object.values(room.demos).map((demo) => <Demo demo={demo} key={demo.id} />)}
            </DemosWrapper>
        </RoomWrapper>
    )
}

export default Signup
