
const axios = require("axios");
const fs = require("fs");

// Day = 86400
// From 2000-01-01  https://query1.finance.yahoo.com/v7/finance/download/%5EGSPC?period1=946684800&period2=1601337600&interval=1d&events=history
const url = `https://query1.finance.yahoo.com/v7/finance/download/%5EGSPC?period1=946684800&period2=${timestampFromCurrentDate()}&interval=1d&events=history`;
const dataPath = "data.txt";

const getHistoricalData = async () => {
    console.log("api call");
    var historicalData;
    // Checar si la fecha del archivo es menor a la fecha actual
    // si es menor hacer la llamada
    // si no es menor leer desde el archivo
    try {
        if (getModifiedDateFile() < getCurrentDate())
            historicalData = await axios.get(url);

        if (typeof historicalData === "undefined") {
            var file = fs.readFileSync(dataPath);
            historicalData = file.toString();
        } else {
            fs.writeFileSync(dataPath, historicalData.data);
        }
    } catch (error) {
        console.log("Api Call Error: " + error);
    }

    return historicalData;
}

module.exports.getHistoricalData = getHistoricalData;

function timestampFromCurrentDate() {
    var date = new Date();
    var timestamp = new Date(`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`);
    return timestamp.getTime() / 1000;
}

function getModifiedDateFile() {
    const stats = fs.statSync(dataPath);
    return stats.mtime;
}

function getCurrentDate() {
    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth();
    var currentDay = today.getDate();
    // Creating a date with a fixed hour
    var date = new Date(year, month, currentDay, 0, 0, 0, 0);
    return date;
}