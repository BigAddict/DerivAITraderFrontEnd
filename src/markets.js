let ws, autoTrade = false, takeProfit = 0;

const marketSelect = document.getElementById("marketSelect");
const askInput = document.getElementById("askInput");
const quoteInput = document.getElementById("quoteInput");
const bidInput = document.getElementById("bidInput");
const pipSizeInput = document.getElementById("pipSizeInput");
const tradeTypeSelect = document.getElementById("tradeTypeSelect");
const timeLeftInput = document.getElementById("timeLeftInput");
const targetProfit = document.getElementById("targetProfit");
const entryAdviceInput = document.getElementById("entryAdviceInput");
const entryProbabilityInput = document.getElementById("entryProbabilityInput");

async function fetchTicks(market) {
    if (ws) ws.close();
    ws = new WebSocket("wss://ws.binaryws.com/websockets/v3?app_id=69972");
    ws.onopen = () => ws.send(JSON.stringify({ "ticks" : market}));
    ws.onmessage = (messageEvent) => {
        const data = JSON.parse(messageEvent.data);
        if (data.tick) {
            askInput.value = data.tick.ask;
            bidInput.value = data.tick.bid;
            quoteInput.value = data.tick.quote;
            pipSizeInput.value = data.tick.pip_size;
        } else {
            console.log("Invalid tick data")
        }
    }
}