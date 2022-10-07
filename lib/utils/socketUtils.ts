import { Socket } from 'socket.io'
import { Controller } from '../../types/socket'

export const defineHandlers = (socket: Socket, handlers: Controller) => {
    const handlerKeys = Object.keys(handlers)
    handlerKeys.forEach((key) => {
        socket.on(key, handlers[key])
    })
}
