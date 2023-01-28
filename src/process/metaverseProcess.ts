import { updateMetaverses } from '../../lib/metaverseService'
import { resetAtMidnight } from '../../lib/utils/processUtils'
import { downloadStart } from './parentProcess'

resetAtMidnight(downloadStart)
