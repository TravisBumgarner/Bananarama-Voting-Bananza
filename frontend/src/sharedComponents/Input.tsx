import styled, { css } from 'styled-components'

import { colors } from 'theme'

const Input = styled.input`
    font-size: 1rem;
    border: 0;
    border-bottom : 2px solid ${colors.supergreen.base};
    padding: 0.5rem 0;
    background-color: transparent;
    font-weight: 700;
    color: ${colors.rotten.base};
    width: 100%;
    box-sizing: border-box;
    text-align: center;
    
    &:focus{
        border-bottom : 4px solid ${colors.rotten.base};
    }

    ::placeholder {
        color: ${colors.rotten.lightest};
  }
`

const sharedLabelCSS = css`
    top: -5px;
    transition: all 0.5s;
    font-size: 0.8rem
`
const LabelWrapper = styled.div<{ showPlaceholder: boolean }>`
    margin: 1rem 0;
    position: relative;
    height: 50px;
    display: flex;
    align-items: end;

    ${Input}{
        display: block;
        width: 100%;
        box-sizing: border-box;
    }

    > span {
        position: absolute;
        top: 20px;
        left: 0;
        pointer-events: none;
        opacity: 0.5;
        transition: all 0.5s;
        width: 100%;
        text-align: center;

        ${({ showPlaceholder }) => {
        return showPlaceholder
            ? sharedLabelCSS
            : ''
    }}
    }

    ${Input}:focus + span {
        ${sharedLabelCSS}
    }
`

type LabelProps = {
    name: string
    label?: string
    value: string
    handleChange: (value: string) => void
    disabled?: boolean
}

const Label = ({
    value, name, label, handleChange, disabled
}: LabelProps) => (
    <LabelWrapper showPlaceholder={value.length > 0}>
        <Input
            disabled={disabled}
            // placeholder={label}
            autoComplete="on"
            name={name}
            onChange={(event) => handleChange(event.target.value)}
            value={value}
        />
        <span>{label}</span>
    </LabelWrapper>
)

export default Label
