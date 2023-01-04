var fs = require('fs')
var transfers = require('./transfers')
var lodash = require('lodash')
let metaverseTransfers = {}
transfers.forEach((transfer) => {
    if (
        transfer.Token_ID ==
        '1643391951'
    )
        console.log("BEFORE",metaverseTransfers[transfer.Token_ID])
    metaverseTransfers[transfer.Token_ID] != undefined
        ? (metaverseTransfers[transfer.Token_ID] +=
               1)
        : (metaverseTransfers[transfer.Token_ID] = 0)
    if (
        transfer.Token_ID ==
        '1643391951'
    )
        console.log("AFTER",metaverseTransfers[transfer.Token_ID])
})

fs.writeFileSync(
    'sandboxTransfers.json',
    JSON.stringify(metaverseTransfers)
)
