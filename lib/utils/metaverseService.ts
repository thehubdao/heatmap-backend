import { Metaverse } from '../../types/metaverse'

const metaverses: Record<Metaverse, Array<any>> = {
    decentraland: [],
    'somnium-space': [],
    sandbox: [],
    'axie-infinity': [],
}

export const pushMetaverseKeys = (metaverse: Metaverse, keys: [string]) => {
    metaverses[metaverse] = metaverses[metaverse].concat(keys)
}
export const getMetaverseKeys = (metaverse: Metaverse) => {
    return metaverses[metaverse]
}
