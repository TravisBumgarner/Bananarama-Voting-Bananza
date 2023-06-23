import styled from 'styled-components'
import { snippets } from 'theme'

const DemoWrapper = styled.li<{ isHovered?: boolean }>`
    ${snippets.subSection};
    border-radius: 0.7em;
    margin: 1rem 0;
    padding: 0.5rem;
    box-sizing: border-box;
    border: 4px solid transparent; 

    &:hover {
        ${({ isHovered }) => (isHovered ? 'border: 4px solid green;' : '')}
    }
    
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    > div:first-child {
        min-width: 300px;
        flex-grow: 1;
    }

    > div:last-child {
    }

    &:last-child{
        margin-bottom: 0;
    }
`

export default DemoWrapper
