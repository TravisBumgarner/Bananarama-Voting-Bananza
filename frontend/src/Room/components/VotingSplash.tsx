import styled from 'styled-components'
import { useMemo, useState } from 'react'

import { TRoom } from 'types'

const ANIMATION_DURATION = 0.5 // seconds

const VotingSplashWrapper = styled.div`
    justify-content: center;
    display: flex;
    flex-direction: column;
    align-items: center;
`

const BananasWrapper = styled.div`
  display: inline-block;
  box-sizing: border-box;
  padding: 0.5rem;
  border-radius: 1rem;
  background: radial-gradient(circle at bottom right, rgb(255,224,75),rgb(232,206,175));
  box-shadow:   rgba(0, 0, 0, 0.25) 0px 54px 55px, 
                rgba(0, 0, 0, 0.12) 0px -12px 30px, 
                rgba(0, 0, 0, 0.12) 0px 4px 6px, 
                rgba(0, 0, 0, 0.17) 0px 12px 13px, 
                rgba(0, 0, 0, 0.09) 0px -3px 5px;
  border: 2px solid white;
`

const H1 = styled.h1<{ delay: number }>`
  animation-delay: ${({ delay }) => ANIMATION_DURATION * delay}s;
  font-size: 0px;
  animation-name: header;
  animation-duration: ${ANIMATION_DURATION}s;
  animation-iteration-count: once;
  animation-timing-function: cubic-bezier(.81,.55,.46,1.01);
  animation-fill-mode: forwards;
  @keyframes header {
      0% {
        font-size:0px;
      }
      100% {
        font-size:2rem;
      }
  }
`

const BananaWrapper = styled.div<{ delay: number, isGray: boolean }>`
    display:inline-block;
    filter: grayscale(${({ isGray }) => (isGray ? 1 : 0)});
    animation-name: rotate;
    margin: 0;
    animation-delay: ${({ delay }) => ANIMATION_DURATION * delay}s;
    animation-duration: ${ANIMATION_DURATION}s;
    animation-iteration-count: once;
    animation-timing-function: cubic-bezier(.81,.55,.46,1.01);
    animation-fill-mode: forwards;
    font-size: 0;
    @keyframes rotate {
      0% {
        font-size:0px;
        transform: rotate(30deg);
      }
      50% {
        font-size:100px;
      }
      100% {
        font-size:100px;
        transform: rotate(390deg);
      }
  }
`

const Banana = ({ delay }: { delay: number }) => {
    const [isGray, setIsGray] = useState(false)

    return (
        <BananaWrapper onClick={() => setIsGray(true)} isGray={isGray} delay={delay}>
            🍌
        </BananaWrapper>
    )
}

const VotingSplash = ({ room }: { room: TRoom }) => {
    const Bananas = useMemo(() => {
        const items = []
        for (let i = 0; i < room.maxVotes; i += 1) items.push(<Banana key={`${room.maxVotes}${i}`} delay={i} />)
        return <BananasWrapper>{items}</BananasWrapper>
    }, [room.maxVotes])

    return (
        <VotingSplashWrapper>
            <H1 delay={room.maxVotes}>{room.maxVotes} Votes for you!</H1>
            {Bananas}
        </VotingSplashWrapper>
    )
}

export default VotingSplash
