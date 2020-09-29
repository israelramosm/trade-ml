const { response } = require("express");

const apiCall = require("./apicall.js");

var alfa = 0.2;
var beta = 0.4;

console.log("index");

var holt = [];

apiCall.getHistoricalData()
  .then(response => {
    console.log("get Historical data");

    response += "\n";
    var dataResponsePerDay = String(response).split("\n");
    dataResponsePerDay.shift();

    // holt[index] = (alfa * close[index-1]) + (1 - alfa) * holt[index-1].proten;
    // T[index] = (beta * (holt[index].pronostico - holt[index-1].pronostico)) + (1 - beta) * holt[index-1].tendencia;
    // Date, Open, High, Low, Close, Adj Close, Volume
    dataResponsePerDay.forEach((element, index) => {
      var data = element.split(",");
      var holtObject = {};
      var tDate = data[0].replace("'", "");
      var tOpen = Number(data[1]);
      var tClose = Number(data[4]);
      var closeAnterior;
      var pronosticoAnterior;
      var tendenciaAnterior;
      var pronosticoTendenciaAnterior;
      if (index === 0) {
        holtObject.date = tDate;
        holtObject.open = tOpen;
        holtObject.close = tClose;
        holtObject.pronostico = tClose;
        holtObject.tendencia = tClose - tOpen;
        holtObject.proten = holtObject.pronostico + holtObject.tendencia

      } else {
        pronosticoAnterior = holt[index - 1].pronostico;
        tendenciaAnterior = holt[index - 1].tendencia;
        pronosticoTendenciaAnterior = holt[index - 1].proten;
        closeAnterior = holt[index - 1].close;

        holtObject.date = tDate;
        holtObject.open = tOpen;
        holtObject.close = tClose;
        holtObject.pronostico = (alfa * closeAnterior) + ((1 - alfa) * pronosticoTendenciaAnterior);
        holtObject.tendencia = (beta) * (holtObject.pronostico - pronosticoAnterior) + ((1 - beta) * tendenciaAnterior);
        holtObject.proten = holtObject.pronostico + holtObject.tendencia;
      }

      holt.push(holtObject);
    });

    for (let index = holt.length - 10; index < holt.length; index++) {
      const element = holt[index];
      console.log(element);
    }
  })
  .catch();
