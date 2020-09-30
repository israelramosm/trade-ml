const { response } = require("express");

const apiCall = require("./apicall.js");

let alfa = 0.5;
let delta = 0.5;
let alfaIncrease = 0.001;
let deltaIncrease = 0.001;

console.log("index");

apiCall.getHistoricalData()
  .then(response => {
    console.log("get Historical data");

    // Add this \n to have the next pronostico
    response += "\n";
    // Make it array per day
    let dataResponsePerDay = String(response).split("\n");

    calcHolt(dataResponsePerDay);

  })
  .catch();

function calcHolt(dataResponsePerDay) {
  let holt = [];
  dataResponsePerDay.shift();
  // holt[index] = (alfa * close[index-1]) + (1 - alfa) * holt[index-1].proten;
  // T[index] = (delta * (holt[index].pronostico - holt[index-1].pronostico)) + (1 - delta) * holt[index-1].tendencia;
  // Date, Open, High, Low, Close, Adj Close, Volume

  dataResponsePerDay.forEach((element, index) => {
    let data = element.split(",");
    let holtObject = {
      current: {},
      forecast: {},
      analisys: {
        increaseAlfa: 0,
        increaseDelta: 0
      }
    };
    let tDate = data[0].replace("'", "");
    let tOpen = Number(data[1]);
    let tClose = Number(data[4]);
    let closeAnterior;
    let pronosticoAnterior;
    let tendenciaAnterior;
    let pronosticoTendenciaAnterior;

    holtObject.current.date = tDate;
    holtObject.current.open = tOpen;
    holtObject.current.close = tClose;

    if (index === 0) {
      holtObject.forecast.pronostico = tClose;
      holtObject.forecast.tendencia = tClose - tOpen;
      holtObject.forecast.proten = holtObject.forecast.pronostico + holtObject.forecast.tendencia;
    } else {
      let beforeIndex = index - 1;
      pronosticoAnterior = holt[beforeIndex].forecast.pronostico;
      tendenciaAnterior = holt[beforeIndex].forecast.tendencia;
      pronosticoTendenciaAnterior = holt[beforeIndex].forecast.proten;
      closeAnterior = holt[beforeIndex].current.close;

      holtObject.forecast.pronostico = (alfa * closeAnterior) + ((1 - alfa) * pronosticoTendenciaAnterior);
      holtObject.forecast.tendencia = (delta) * (holtObject.forecast.pronostico - pronosticoAnterior) + ((1 - delta) * tendenciaAnterior);
      holtObject.forecast.proten = holtObject.forecast.pronostico + holtObject.forecast.tendencia;

      holtObject.analisys.diffProClose = holtObject.forecast.pronostico - holtObject.current.close;
      holtObject.analisys.diffProTClose = holtObject.forecast.proten - holtObject.current.close;
      holtObject.analisys.diffOpenTClose = (holtObject.current.open + holtObject.forecast.tendencia) - holtObject.current.close;
      holtObject.analisys.increaseAlfa = (holtObject.analisys.diffProClose < -10) || (holtObject.analisys.diffProClose > 10) ? holt[beforeIndex].analisys.increaseAlfa + 1 : holt[beforeIndex].analisys.increaseAlfa;
      holtObject.analisys.increaseDelta = (holtObject.analisys.diffProTClose < -10) || (holtObject.analisys.diffProTClose > 10) ? holt[beforeIndex].analisys.increaseDelta + 1 : holt[beforeIndex].analisys.increaseDelta;

    }
    holt.push(holtObject);
  });
  calculateAlfaDelta(holt);
}


function calculateAlfaDelta(holt) {

  let beforeLastItemIndex = holt.length - 2;
  let beforeLastItem = holt[beforeLastItemIndex];

  let percentMargen = .01;
  let errorMargen = percentMargen * beforeLastItemIndex;
  // .10 * lastItem

  console.log("running while");
  while (beforeLastItem.analisys.increaseAlfa > errorMargen || beforeLastItem.analisys.increaseAlfa > errorMargen) {
    if (beforeLastItem.analisys.increaseAlfa > errorMargen) {
      
      alfa += alfaIncrease;
    } else {
      console.log(alfa);
    }

    if (beforeLastItem.analisys.increaseAlfa > errorMargen) {
      delta += deltaIncrease;
    } else {
      console.log(delta);
    }

    console.log(alfa);
    console.log(delta);
  }

  console.log(beforeLastItem);
  console.log(holt[holt.length - 1]);
}