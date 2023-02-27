import { Metaverse } from "../types/metaverse"

const metaverses: Record<Metaverse, any> = {
    "somnium-space": {},
    decentraland: {},
    sandbox: {}
}

export const setLand = (land: any, metaverse: Metaverse) => {
    metaverses[metaverse][land.tokenId] = land
    
}

export const setLands = (lands: any[], metaverse: Metaverse) => {
    for (const land of lands) {
        setLand(land, metaverse)
    }
}

export const getLand = (tokenId: string, metaverse: Metaverse) => {
    console.log(metaverse,tokenId, metaverses[metaverse][tokenId])
    return metaverses[metaverse][tokenId]
}

export const getMetaverse = (metaverse: Metaverse) => {
    return metaverses[metaverse]
}
