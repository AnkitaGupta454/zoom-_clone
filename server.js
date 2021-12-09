const express = require('express');
const app=express();
const server = require('http').Server(app);
const {v4:uuidv4} = require('uuid'); // for getting unique id
const io = require('socket.io')(server);
const { ExpressPeerServer } = require('peer');
const path = require('path');
const peerServer = ExpressPeerServer(server, {
  debug: true,
   allow_discovery: true,
});
app.use('/peerjs',peerServer);
app.use(express.static('public'));

app.set('view engine', 'ejs')

app.get('/',(req,res)=>{
    res.redirect(`/${uuidv4()}`);
})

app.get('/:room',(req,res)=>{
    res.render('room',{roomId:req.params.room})
})


io.on('connection',socket=>{
    socket.on('join-room',(roomId,userId)=>{
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('user-connected',userId);
        socket.on('message', (message) => {
            //send message to the same room
            io.to(roomId).emit('createMessage', message)
        }); 
        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId)
          })
    })
    
})

 

server.listen(process.env.PORT||3030)
