const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const hbs = require('hbs');
const config = require('./app/config/config');
const gameBoxGrid = [0,1,2,3,4,5,6,7,8];
const currentPlayer = config.Player.HumanPlayer;
// set the view engine to use handlebars
app.set('view engine', 'hbs');
app.set('views', __dirname + '/app/views');

//Defining middleware to serve static files
app.use('/static',express.static(__dirname +'/public'));
var blocks = {};

hbs.registerHelper('extend', function(name, context){
    var block = blocks[name];
    if(!block){
        block = blocks[name] = [];
    }

    block.push(context.fn(this)); // this is older version of handlebars

})

app.get('/', (req, res) => {
       
    //res.send('page loaded');
    res.render('index', { 
        layout: 'layouts', 
        title: 'Tic Tac Toe Page', 
        grid: gameBoxGrid,
        humanPlayer: config.Player.HumanPlayer,
        machinePlayer: config.Player.MachinePlayer,
        currentPlayer: currentPlayer
    });
});


// socket io  connection
io.on('connection', (socket) => {

    socket.on('humanPlayerTurn', (clickedBoxData) => {
        let activeBoxes = clickedBoxData.activeBoxes;
        let randomBoxId = Math.floor(Math.random() * activeBoxes.length);
        let status = ( activeBoxes.length > 0 
            &&  clickedBoxData.id != activeBoxes[randomBoxId] ) 
        ? 'active' : 'finish';
        let machinePlayerBox = clickedBoxData.id != activeBoxes[randomBoxId] 
        ? activeBoxes[randomBoxId] : '';
        //console.log(clickedBoxData, machinePlayerBox, status, randomBoxId);
       //console.log('grid-index: ' + msg);
      
        io.emit('machinePlayerTurn', { 
          id: machinePlayerBox,
          value: config.Player.MachinePlayer,
          gameStatus: status
        });

    });

    socket.on('checkWinner', (clickedBoxData) => {
        let result = false;
        //console.log(clickedBoxData.data)
        if(clickedBoxData.player == 'X'){
            let winConds = config.winningCombinations;
            let resultBoxes = [];
            for(i=0; i < winConds.length; i++){
                let winCond = winConds[i];
                //console.log(winCond);
                let a = clickedBoxData.data[winCond[0]];
                let b = clickedBoxData.data[winCond[1]];
                let c = clickedBoxData.data[winCond[2]];
               // console.log(a,b,c);
               
                if ( winCond[0] === clickedBoxData.data[winCond[0]] 
                    && winCond[1] === clickedBoxData.data[winCond[1]] 
                    && winCond[2] === clickedBoxData.data[winCond[2]] ) {
                    //console.log(a,b,c);
                    result = true;
                    resultBoxes = [a,b,c];
                    break
                } else {
                    continue;
                }
            }

            if(result){

                io.emit('resultDeclare', {
                    resultBoxes: resultBoxes,
                    player: 'X',
                    gameStatus: 'winner'
                });
            }     

        } else if( clickedBoxData.player == 'O') {
            let winConds = config.winningCombinations;
            let resultBoxes = [];
            for(i=0; i < winConds.length; i++){
                let winCond = winConds[i];
                //console.log(winCond);
                let a = clickedBoxData.data[winCond[0]];
                let b = clickedBoxData.data[winCond[1]];
                let c = clickedBoxData.data[winCond[2]];
               // console.log(a,b,c);
               
                if ( winCond[0] === clickedBoxData.data[winCond[0]] 
                    && winCond[1] === clickedBoxData.data[winCond[1]] 
                    && winCond[2] === clickedBoxData.data[winCond[2]] ) {
                    //console.log(a,b,c);
                    result = true;
                    resultBoxes = [a,b,c];
                    break
                } else {
                    continue;
                }
            }

            if(result){

                io.emit('resultDeclare', {
                    resultBoxes: resultBoxes,
                    player: 'O',
                    gameStatus: 'winner'
                });
            }  
        }
       
    });

});

//set port and listen request
const PORT = process.env.PORT || 8080;

http.listen(PORT, () => {
    console.log('current server PORT: '+ PORT);
});