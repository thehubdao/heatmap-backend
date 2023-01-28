import { Metaverse } from '../../types/metaverse'
import { config } from 'dotenv'

config()

export const heatmapMvLandsPerRequest = {
    sandbox: {
        lands: 5000,
    },
    decentraland: {
        lands: 1200,
    },
    'axie-infinity': {
        lands: 1200,
    },
    'somnium-space': {
        lands: 200,
    },
}

export const getMetaverseAddress = (metaverse: Metaverse) => {
    switch (metaverse) {
        case 'sandbox':
            return '0x5cc5b05a8a13e3fbdb0bb9fccd98d38e50f90c38'
        case 'decentraland':
            return '0xF87E31492Faf9A91B02Ee0dEAAd50d51d56D5d4d'
        case 'somnium-space':
            return '0x913ae503153d9A335398D0785Ba60A2d63dDB4e2'
        default:
            return 'None'
    }
}

export const metaverseUrl = (metaverse: Metaverse) => {
    const urls = {
        'somnium-space': `${process.env.SOMNIUM_URL}/map`,
        'axie-infinity': `${process.env.AXIE_URL}/requestMap`,
        decentraland: `${process.env.DECENTRALAND_URL}/map`,
        sandbox: `${process.env.SANDBOX_URL}/map`,
    }
    return urls[metaverse]
}
