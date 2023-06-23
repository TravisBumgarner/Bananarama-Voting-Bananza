import { useContext, useEffect, useMemo } from 'react'
import styled from 'styled-components'

import { Heading, Paragraph, RoomWrapper } from 'sharedComponents'
import { context } from 'context'
import { TDemo, TRoom } from 'types'
import DemoWrapper from './DemoWrapper'

const DemosWrapper = styled.ul`
    list-style: none;
    margin: 0;
    padding: 0;
    box-sizing: border-box
`

type DemoProps = {
    demo: TDemo
    votes: number
}

const Demo = ({ demo, votes }: DemoProps) => {
    return (
        <DemoWrapper>
            <div>
                <Heading.H3>{demo.demo}</Heading.H3>
                <Paragraph>{demo.presenter}</Paragraph>
            </div>
            <div style={{ fontSize: '3rem' }}>
                {'🍌'.repeat(votes)}
            </div>
        </DemoWrapper>
    )
}

const Conclusion = ({ room }: { room: TRoom }) => {
    const { dispatch } = useContext(context)

    const talliedVotes = useMemo(() => {
        const data = Object.values(room.demos).reduce((accum, { id }) => {
            accum[id] = 0
            return accum!
        }, {} as Record<string, number>)

        Object.values(room.votes).forEach(({ demoId }) => data[demoId] += 1) //eslint-disable-line

        return data
    }, [])

    useEffect(() => {
        const votesForWinner = Math.max(...Object.values(talliedVotes))
        const winners: TDemo['id'][] = []

        Object.entries(talliedVotes).forEach(([id, votes]) => {
            if (votes === votesForWinner) winners.push(id)
        })
        dispatch({ type: 'ADD_WINNERS', data: winners })
    }, [])

    const Results = Object.values(room.demos)
        .sort((a, b) => talliedVotes[b.id] - talliedVotes[a.id])
        .map((demo) => (
            <Demo
                demo={demo}
                key={demo.id}
                votes={talliedVotes[demo.id]}
            />
        ))

    return (
        <RoomWrapper>
            <Heading.H2>Conclusion</Heading.H2>
            <DemosWrapper>
                {Results}
            </DemosWrapper>
        </RoomWrapper>
    )
}

export default Conclusion
