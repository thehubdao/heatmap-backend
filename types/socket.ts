export enum socketSenderMessages {
    newBulkData = 'new-land-bulk-data',
    newLandData = 'new-land-data',
    renderFinish = 'render-finish',
    ping = 'ping',
    giveLand = 'give-land'

}

export enum socketReceiverMessages {
    socketConnect = 'connection',
    socketDisconnect = 'disconnect',
    renderStart = 'render-start',
    pong = 'pong',
    getLand = 'get-land',
    renderContinue = 'render-continue',
}
export type Controller = Record<string, (...args: any[]) => void>
