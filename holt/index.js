
const axios = require("axios");
const fs = require("fs");
// Day = 86400
// day 27 = 1601164800
// 01-01-2000 09-27-2020
// TODO: mirar intervalo para hacer la solicitud por dia
// TODO: modificar el timestamp para tener dia anterior y dia actual
const url = `https://query1.finance.yahoo.com/v7/finance/download/%5EGSPC?period1=946684800&period2=${timestampFromCurrentDate()}&interval=1d&events=history`;
var alfa = 0.2;
var beta = 0.4;

var historicalData;

axios.get(url)
  .then(function (response) {
    historicalData = response;
    fs.writeFileSync("data.txt", response);
  })
  .catch(function (error) {
    //console.log(error);
  })
  .then(function () {
  });

if(typeof historicalData === "undefined") {
    var file = fs.readFileSync("./data.txt");
    historicalData = file.toString();
}

// added to see the next pronostico
historicalData += "\n";
var dataResponsePerDay = String(historicalData).split("\n");

// holt[index] = (alfa * close[index-1]) + (1 - alfa) * holt[index-1].proten;
// T[index] = (beta * (holt[index].pronostico - holt[index-1].pronostico)) + (1 - beta) * holt[index-1].tendencia;

var holt = [];

// Date, Open, High, Low, Close, Adj Close, Volume
dataResponsePerDay.forEach((element, index) => {
    var data = element.split(",");
    var holtObject = {};
    var tDate = data[0].replace("'","");
    var tOpen = Number(data[1]);
    var tClose = Number(data[4]);
    var closeAnterior;
    var pronosticoAnterior;
    var tendenciaAnterior;
    var pronosticoTendenciaAnterior;
    if(index === 0) {
        holtObject.date = tDate;
        holtObject.open = tOpen;
        holtObject.close = tClose;
        holtObject.pronostico = tClose;
        holtObject.tendencia = tClose - tOpen;
        holtObject.proten = holtObject.pronostico + holtObject.tendencia

    } else {
        pronosticoAnterior = holt[index-1].pronostico;
        tendenciaAnterior = holt[index-1].tendencia;
        pronosticoTendenciaAnterior = holt[index-1].proten;
        closeAnterior = holt[index-1].close;

        holtObject.date = tDate;
        holtObject.open = tOpen;
        holtObject.close = tClose;
        holtObject.pronostico = (alfa * closeAnterior) + ((1 - alfa) * pronosticoTendenciaAnterior);
        holtObject.tendencia = (beta) * (holtObject.pronostico - pronosticoAnterior) + ((1 - beta) * tendenciaAnterior);
        holtObject.proten = holtObject.pronostico + holtObject.tendencia;
    }
    
    holt.push(holtObject);
});

console.log(holt);


function timestampFromCurrentDate() {
    var date = new Date();
    var timestamp = new Date(`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`);
    return timestamp.getTime()/1000;
}