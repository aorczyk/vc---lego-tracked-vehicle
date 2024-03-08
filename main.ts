let y = 0
let x = 0
let xLast = 0
let yLast = 0
let state = 0
let lastState = 0
let rightInputType = 0
let latestCommands: { [key: string]: number } = {}

basic.clearScreen()
pfTransmitter.connectIrSenderLed(AnalogPin.P0)

bluetooth.startUartService()

bluetooth.onBluetoothConnected(function () {
    led.plot(2, 2)
})

bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    let command = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))
    let commadParts = command.split("=")

    latestCommands[commadParts[0]] = parseFloat(commadParts[1])
})

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
            y = commandValue
            if (state == 1) {
                pfTransmitter.setSpeed(1, 1, y - x)
                pfTransmitter.setSpeed(1, 2, (y + x) * -1)
            } else {
                pfTransmitter.setSpeed(1, 1, commandValue)
            }
        } else if (commandName == "ox" || commandName == "sr" || commandName == "jrx") {
            x = commandValue
            if (state == 1) {
                pfTransmitter.setSpeed(1, 1, y - x)
                pfTransmitter.setSpeed(1, 2, (y + x) * -1)
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
            x = -4
            y = 4
            pfTransmitter.setSpeed(1, 1, x)
            pfTransmitter.setSpeed(1, 2, y)
        } else if (commandName == "down") {
            x = 4
            y = -4
            pfTransmitter.setSpeed(1, 1, x)
            pfTransmitter.setSpeed(1, 2, y)
        } else if (commandName == "right") {
            x = -3
            y = -3
            pfTransmitter.setSpeed(1, 1, x)
            pfTransmitter.setSpeed(1, 2, y)
        } else if (commandName == "left") {
            x = 3
            y = 3
            pfTransmitter.setSpeed(1, 1, x)
            pfTransmitter.setSpeed(1, 2, y)
        } else if (commandName == "none") {
            x = 0
            y = 0
            pfTransmitter.brake(1, 1)
            pfTransmitter.brake(1, 2)
        }

        if (lastState != state) {
            lastState = state
            if (state == 0) {
                bluetooth.uartWriteLine("vc;b;1;1")
                bluetooth.uartWriteLine("vc;b;2;0")
                bluetooth.uartWriteLine("vc;m;Mode 1;1")
            } else {
                bluetooth.uartWriteLine("vc;b;1;0")
                bluetooth.uartWriteLine("vc;b;2;1")
                bluetooth.uartWriteLine("vc;m;Mode 2;1")
            }
        }

        if (xLast != x || yLast != y) {
            led.unplot(Math.floor(2 * xLast / 7) + 2, Math.floor(2 * yLast / 7) + 2)
            xLast = x
            yLast = y
            led.plot(Math.floor(2 * xLast / 7) + 2, Math.floor(2 * yLast / 7) + 2)
        }
    }
})