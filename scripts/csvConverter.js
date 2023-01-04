let csvToJson = require('convert-csv-to-json');

let fileInputName = 'sandbox_tx.csv'; 
let fileOutputName = 'transfers.json';

csvToJson.generateJsonFileFromCsv(fileInputName,fileOutputName);