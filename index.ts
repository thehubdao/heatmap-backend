import { onMessage } from './lib/utils/socketUtils'
import cors from 'cors'
import { setMetaverseCalcs } from './src/controller/limitsController'
import { clientConnect } from './lib/socketService'
import { socketReceiverMessages } from './types/socket'
import { fork } from 'child_process'
import { getLand, setLands, setLand } from './lib/cacheService'
import { ProcessMessages } from './types/process'
import { config } from 'dotenv'
import { Metaverse } from './types/metaverse'
import { join } from 'path'
import * as fs from 'fs';
import WebSocket from 'ws';

const https = require('https');

config()

const PORT = process.env.PORT as string

const privateKey = fs.readFileSync('/etc/letsencrypt/live/heatmap.itrmachines.com/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/heatmap.itrmachines.com/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/heatmap.itrmachines.com/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};


const server = https.createServer(credentials,(req: any, res: any)=>{})

const wss = new WebSocket.Server({ server });

server.listen(PORT);
/* const wss = new WebSocketServer({ port: Number(PORT)}); */

wss.on(socketReceiverMessages.socketConnect, function connection(ws) {
  clientConnect(ws)
  ws.on('error', console.error);

  ws.on('message', (receivedData: any) => {
    const parsedData = receivedData.toString()

    const [message, messageData] = parsedData.split('|')

    onMessage(ws, message, messageData)

  });
});


const child = fork(
  join(__dirname, '/src/process/downloadMetaverseProcess'), ['node --max-old-space-size=8192 build/index.js']
)


const processMessages: any = {
  [ProcessMessages.newMetaverseChunk]({ chunk, metaverse }: any) {
    setLands(chunk, metaverse)
  },
  [ProcessMessages.getCacheKey]({ tokenId, metaverse }: any) {
    const cacheValue = getLand(tokenId, metaverse)
    sendChildMessage(ProcessMessages.sendCacheKey, cacheValue)
  },
  [ProcessMessages.setCacheKey]({ land, metaverse }: any) {
    setLand(land, metaverse)
  },
  [ProcessMessages.setMetaverseCalcs](metaverse: Metaverse) {
    setMetaverseCalcs(metaverse)
  }
}

const sendChildMessage = (message: any, data?: any) => {
  child.send({ message, data })
}

const downloadStart = () => {
  sendChildMessage(ProcessMessages.downloadStart)
}

child.on('message', async ({ message, data }: any) => {
  /* pidusage(child.pid, function (err:any, stats:any) {
      console.log(message,err,stats, new Date().toISOString());
      
      }); */
  const messageHandler = processMessages[message]
  if (!messageHandler) return
  await messageHandler(data)
})

child.on('error', (err) => {
  console.log(err, child.exitCode)
  child.disconnect()
})

child.on('exit', (err) => {
  console.log(err, child.exitCode)
  child.disconnect()
})


downloadStart()
setInterval(downloadStart, 600000)
