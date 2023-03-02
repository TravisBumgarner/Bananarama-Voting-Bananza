import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { Heading } from 'sharedComponents'
import { snippets } from 'theme'

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
    return (
        <Wrapper>
            <Link style={{ textDecoration: 'none' }} to="/">
                <Heading.H1>
                    Bananarama
                </Heading.H1>
            </Link>
        </Wrapper>
    )
}

export default Header
