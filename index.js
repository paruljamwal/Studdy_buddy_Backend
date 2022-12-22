const http=require('http');
const express=require('express');
const cors=require("cors");
// const socketIO=require("socket.io");
const app=express();



const server=http.createServer(app);


//  const io=socketIO(server);  //connection with IO
const io = require("socket.io")(server, {
	cors: {
		origin: "http://localhost:3000",
		methods: [ "GET", "POST" ]
	}
})

const port=8080 || process.env.PORT;

const users=[{}]

app.use(cors())

app.get("/",(req,res)=>{
    res.send("Working")
})





// IO connection on
io.on('connection',(socket)=>{
    console.log("New Connection");

    socket.on("joined",({user})=>{
        console.log(user,"user");
        // console.log(` usersid ${users[socket.id]}`);
     
        users[socket.id]=user;
        
        console.log(`${user} has joined`);
        socket.broadcast.emit("userjoined",{user:"Admin",message:`${users[socket.id]} has joined`});
        socket.emit('welcome',{user:"Admin",message:`Welcome to the chat,${users[socket.id]}`})
    })


    //Message use directly io

    socket.on('message',({message,id})=>{
      io.emit(`sendMessage`,{user:users[id],message,id});
    })



    //disconnect
    socket.on("disconnect",()=>{
        socket.broadcast.emit("leave",{user:"Admin",message:`${users[socket.id]} has left`})
        console.log('user has left');
    })
})

  //video callll..................

  io.on("connection", (socket) => {
	socket.emit("me", socket.id)

	socket.on("disconnect", () => {
		socket.broadcast.emit("callEnded")
	})

	socket.on("callUser", (data) => {
		io.to(data.userToCall).emit("callUser", { signal: data.signalData, from: data.from, name: data.name })
	})

	socket.on("answerCall", (data) => {
		io.to(data.to).emit("callAccepted", data.signal)
	})
})


server.listen(port,()=>{
    console.log(`server is working on http://localhost:${port}`)
})