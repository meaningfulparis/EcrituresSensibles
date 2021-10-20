var portName = '/dev/cu.usbmodem1101';

const express = require('express')
const bodyParser = require('body-parser')
const app = express()

/*
* Classic server
*/
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static('public'))
app.get('/', function (req, res) {
   res.sendFile('index.html', { root: __dirname })
})

app.get('/json', function (req, res) {
   res.status(200).json({"message":"ok"})
})

/*
* Socket IO
*/
const server = require('http').Server(app)
const io = require('socket.io')(server)
io.on('connection', (socket) =>{
    console.log(`Connecté au client ${socket.id}`)
})


/*
* Port reading
*/
var serialport = require('serialport');

var myPort = new serialport(portName, {
    baudRate: 9600,
    lock: false
})

const parser = myPort.pipe(new serialport.parsers.Readline({ delimiter: '\r\n'}))

// setInterval(_ => {
//     onData({'now': Date.now()})
// }, 1000)

myPort.on('open', onOpen);
//myPort.on('data', onData);

function onOpen(){
    console.log('Open connections!');
    parser.on('data', onData)
}

function onData(data){
    const intVal = parseInt(data)
    if (!isNaN(intVal)) {
        io.emit('newDataFromInput', parseInt(data))   
    }
    console.log(parseInt(data), ' _ ', data);
}

// App launching
server.listen(3000, function () {
    console.log('Votre app est disponible sur localhost:3000 !')
})