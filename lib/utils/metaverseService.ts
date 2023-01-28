import { Metaverse } from "../../types/metaverse";
import { getKey } from "../cacheService";

export const getMetaverseKeys = (metaverse:Metaverse) => {
return getKey(`${metaverse}-keys`)
    
}
