import { Metaverse } from '../../types/metaverse'

const metaverses: Record<Metaverse, any> = {
    decentraland: {},
    'somnium-space': {},
    sandbox: {},
/*     'axie-infinity': {}, */
}

export const setBulkMetaverseKeys = (metaverse: Metaverse, keys: [string]) => {
    keys.forEach((key) => {
        metaverses[metaverse][key] = key
    })
}
export const getMetaverseKeys = (metaverse: Metaverse) => {
    return Object.keys(metaverses[metaverse])
}
