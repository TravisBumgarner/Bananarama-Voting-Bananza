import { useCallback } from 'react'
import styled from 'styled-components'

import { Button } from 'sharedComponents'

const MoreFromMeWrapper = styled.div`
    box-sizing: border-box;
    position: fixed;
    right: 1rem;
    bottom: 1rem;
`

const RoomMembers = () => {
    const openInNewTab = useCallback(() => {
        window.open('https://sillysideprojects.com', '_blank')
    }, [])

    return (
        <MoreFromMeWrapper>
            <Button
                fullWidth
                type="button"
                label="More from the Creator"
                icon="content_copy"
                variation="cancel"
                onClick={openInNewTab}
            />
        </MoreFromMeWrapper>
    )
}

export default RoomMembers
