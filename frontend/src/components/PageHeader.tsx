import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { Heading } from 'sharedComponents'
import { snippets } from 'theme'
import { useContext } from 'react'
import { context } from '../Context'

const Wrapper = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    
    /* ${snippets.section} */
    /* padding: 1rem; */
    /* margin-bottom: 1rem; */

    > button {
        margin-left: 1rem;
    }
`

const Header = () => {
    const {dispatch} = useContext(context)
    return (
        <Wrapper>
            {/* This bad. :sad_panda */}
            <Link style={{ textDecoration: 'none' }} to="/" onClick={() => dispatch({type: "REMOVE_ROOM_ID"})}> {/* eslint-disable-line */}
                <Heading.H1>
                    Bananarama Voting!
                </Heading.H1>
            </Link>
        </Wrapper>
    )
}

export default Header
