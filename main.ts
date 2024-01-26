bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    command = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))
    commadParts = command.split("=")
    commandName = commadParts[0]
    commandValue = parseFloat(commadParts[1])

    latestCommands[commandName] = commandValue
})
bluetooth.onBluetoothConnected(function () {
    led.plot(2, 2)
})
let commandValue = 0
let commandName = ""
let commadParts: string[] = []
let command = ""
let rightInputType = 0
let state = 0
let lastState = 0
let oy = 0
let ox = 0
let xLed = 0
let yLed = 0
basic.clearScreen()

ox = 0
oy = 0
state = 0
lastState = 0
rightInputType = 0
let queue: string[] = []
let latestCommands: { [key: string]: number } = {}


bluetooth.startUartService()
pfTransmitter.connectIrSenderLed(AnalogPin.P0)


basic.forever(function () {
    while (Object.keys(latestCommands).length) {
        let commandName = Object.keys(latestCommands)[0]
        let commandValue = latestCommands[commandName]
        delete latestCommands[commandName];

        if (commandName == "-v") {
            bluetooth.uartWriteLine("vc;ox;1;-30;30;-7;7;1;0;10")
            bluetooth.uartWriteLine("vc;oy;1;-30;30;-7;7;1;0;10")
            bluetooth.uartWriteLine("vc;sl;1;-7;7;1;1;50")
            bluetooth.uartWriteLine("vc;sr;1;-7;7;1;0;50")
            bluetooth.uartWriteLine("vc;jrx;-7;7;1;0;10")
            bluetooth.uartWriteLine("vc;jry;-7;7;1;1;10")
            bluetooth.uartWriteLine("vc;il;0;")
            bluetooth.uartWriteLine("vc;ir;0;")
            bluetooth.uartWriteLine("vc;o;0;")
            bluetooth.uartWriteLine("vc;m;VC - LEGO;")
            bluetooth.uartWriteLine("vc;m;Mode 1;1")
        } else if (commandName == "oy" || commandName == "sl" || commandName == "jry") {
            oy = commandValue
            if (state == 1) {
                pfTransmitter.setSpeed(1, 1, oy - ox)
                pfTransmitter.setSpeed(1, 2, (oy + ox) * -1)
            } else {
                pfTransmitter.setSpeed(1, 1, commandValue)
            }
        } else if (commandName == "ox" || commandName == "sr" || commandName == "jrx") {
            ox = commandValue
            if (state == 1) {
                pfTransmitter.setSpeed(1, 1, oy - ox)
                pfTransmitter.setSpeed(1, 2, (oy + ox) * -1)
            } else {
                pfTransmitter.setSpeed(1, 2, commandValue)
            }
        } else if (commandName == "1") {
            state = 0
        } else if (commandName == "2") {
            state = 1
        } else if (commandName == "vcir") {
            rightInputType = commandValue
            if (commandValue == 1) {
                state = 0
                bluetooth.uartWriteLine("vc;il;1;")
            } else if (commandValue == 2) {
                state = 1
            }
        } else if (commandName == "vco") {
            if (commandValue == 1) {
                state = 1
            } else {
                if (rightInputType == 1) {
                    state = 0
                }
            }
        } else if (commandName == "up") {
            ox = -7
            oy = 7
            pfTransmitter.setSpeed(1, 1, -7)
            pfTransmitter.setSpeed(1, 2, 7)
        } else if (commandName == "down") {
            ox = 7
            oy = -7
            pfTransmitter.setSpeed(1, 1, 7)
            pfTransmitter.setSpeed(1, 2, -7)
        } else if (commandName == "right") {
            ox = -7
            oy = -7
            pfTransmitter.setSpeed(1, 1, -7)
            pfTransmitter.setSpeed(1, 2, -7)
        } else if (commandName == "left") {
            ox = 7
            oy = 7
            pfTransmitter.setSpeed(1, 1, 7)
            pfTransmitter.setSpeed(1, 2, 7)
        } else if (commandName == "none") {
            ox = 0
            oy = 0
            pfTransmitter.brake(1, 1)
            pfTransmitter.brake(1, 2)
        }

        if (lastState != state) {
            lastState = state
            if (state == 0) {
                bluetooth.uartWriteLine("vc;b;1;1")
                bluetooth.uartWriteLine("vc;b;2;0")
                bluetooth.uartWriteLine("vc;m;Mode 1;2")
            } else {
                bluetooth.uartWriteLine("vc;b;1;0")
                bluetooth.uartWriteLine("vc;b;2;1")
                bluetooth.uartWriteLine("vc;m;Mode 2;2")
            }
        }

        if (xLed != ox || yLed != oy) {
            led.unplot(Math.floor(2 * xLed / 7) + 2, Math.floor(2 * yLed / 7) + 2)
            xLed = ox
            yLed = oy
            led.plot(Math.floor(2 * xLed / 7) + 2, Math.floor(2 * yLed / 7) + 2)
        }
    }
})
