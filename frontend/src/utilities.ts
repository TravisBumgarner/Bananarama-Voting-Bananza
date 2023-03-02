import * as Sentry from '@sentry/react'

type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>
type Exactly<T, K extends keyof T> = Pick<T, K>

const logger = (message: any) => {
    if (__LOGGING_LEVEL__ === 'sentry') {
        Sentry.captureException(JSON.stringify(message))
    }
    console.log(JSON.stringify(message)) // eslint-disable-line
}

const sanitizeRoomId = (dangerousString: string) => {
    const re = /[^a-z0-9-]/gi
    const cleanString = dangerousString.replace(re, '')
    return cleanString.toLowerCase()
}

const getLocalStorage = (key: string) => {
    const result = localStorage.getItem(key)
    return result ? JSON.parse(result) : ''
}

const setLocalStorage = (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value))
}

const arrayToObject = <T extends Record<string, any>>(array: T[], key: keyof T) => array.reduce((accumulator, item) => {
    const value = item[key]
    accumulator[value] = item
    return accumulator
}, {} as Record<string, T>)

export {
    logger,
    AtLeast,
    Exactly,
    sanitizeRoomId,
    getLocalStorage,
    setLocalStorage,
    arrayToObject
}
