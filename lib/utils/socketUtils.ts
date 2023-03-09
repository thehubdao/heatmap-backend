import { socketMessagesController } from '../../src/controller/socketMessagesController'

export const onMessage = (socket: any, message: string, messageRawData: any) => {
    const messageHandler = socketMessagesController(socket)[message]

    if (!messageHandler) return

    const messageData = messageRawData.split(';')

    try { messageHandler(messageData) } catch (err) { console.log(err) }



}
