import styled from 'styled-components'

import { Button } from 'sharedComponents'
import { colors } from 'theme'

const StyledNav = styled.ul`
    z-index: 998;
    position: absolute;
    width: 240px;
    right: 0;
    display: ${({ showMenu }: { showMenu: boolean }) => (showMenu ? 'block' : 'none')};
    list-style: none;
    flex-direction: row;
    padding: 1rem;
    background-color: ${colors.PRIMARY.base};
    border: 4px solid ${colors.PRIMARY.base};
    clip-path: polygon(3% 0, 7% 1%, 11% 0%, 16% 2%, 20% 0, 23% 2%, 28% 2%, 32% 1%, 35% 1%, 39% 3%, 41% 1%, 45% 0%, 47% 2%, 50% 2%, 53% 0, 58% 2%, 60% 2%, 63% 1%, 65% 0%, 67% 2%, 69% 2%, 73% 1%, 76% 1%, 79% 0, 82% 1%, 85% 0, 87% 1%, 89% 0, 92% 1%, 96% 0, 98% 3%, 99% 3%, 99% 6%, 100% 11%, 98% 15%, 100% 21%, 99% 28%, 100% 32%, 99% 35%, 99% 40%, 100% 43%, 99% 48%, 100% 53%, 100% 57%, 99% 60%, 100% 64%, 100% 68%, 99% 72%, 100% 75%, 100% 79%, 99% 83%, 100% 86%, 100% 90%, 99% 94%, 99% 98%, 95% 99%, 92% 99%, 89% 100%, 86% 99%, 83% 100%, 77% 99%, 72% 100%, 66% 98%, 62% 100%, 59% 99%, 54% 99%, 49% 100%, 46% 98%, 43% 100%, 40% 98%, 38% 100%, 35% 99%, 31% 100%, 28% 99%, 25% 99%, 22% 100%, 19% 99%, 16% 100%, 13% 99%, 10% 99%, 7% 100%, 4% 99%, 2% 97%, 1% 97%, 0% 94%, 1% 89%, 0% 84%, 1% 81%, 0 76%, 0 71%, 1% 66%, 0% 64%, 0% 61%, 0% 59%, 1% 54%, 0% 49%, 1% 45%, 0% 40%, 1% 37%, 0% 34%, 1% 29%, 0% 23%, 2% 20%, 1% 17%, 1% 13%, 0 10%, 1% 6%, 1% 3%); 
    margin: 0.5rem;
    text-transform: uppercase;

    ${Button} {
        margin: 0.5rem 0; // For whatever reason I cannot figure out how to get a button to fit in a dropdown. 
    }
`

type DropdownMenuProps = {
    title: string
    children: any[]
}

const DropdownMenu = ({ title, children }: DropdownMenuProps) => {
    const [showMenu, setShowMenu] = useState<boolean>(false)

    const handleClose = () => setShowMenu(false)

    useEffect(() => {
        if (showMenu) {
            window.addEventListener('click', handleClose)
        }
        return () => window.removeEventListener('click', handleClose)
    }, [showMenu])

    return (
        <div style={{ position: 'relative' }}>
            <Button variation="secondary" onClick={() => setShowMenu(!showMenu)}>{title}</Button>
            <StyledNav showMenu={showMenu}>
                {children.map((child, index) => <li key={index}>{child}</li>)} {/* eslint-disable-line */}
            </StyledNav>
        </div>
    )
}
export default DropdownMenu
