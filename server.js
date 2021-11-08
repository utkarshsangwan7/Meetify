const express =  require('express');
const http = require('http');
const cors = require('cors');
const socketio = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const port = process.env.PORT || 2000;

const messages = [];
const All_participants = [];


const insert_participants = (user,groupId,socketID,VideoID,ScreenID)=>{
	All_participants.push({name:user,groupId,socketID,VideoID,ScreenID,StreamID:null,ScreenStreamID:null});
}

const updateStreamId = (socketID,StreamID)=>{
	const index = All_participants.findIndex((user)=>{
		return user.socketID===socketID;
	});
	All_participants[index].StreamID = StreamID;
}

const updateScreenStreamId = (socketID,ScreenStreamID)=>{
	const index = All_participants.findIndex((user)=>{
		return user.socketID===socketID;
	});
	All_participants[index].ScreenStreamID = ScreenStreamID;
}

const remove_participant = (socketID)=>{
	const index = All_participants.findIndex((user)=>{
		return user.socketID===socketID;
	});
	const user = All_participants.splice(index,1);
	return user[0];
}
const insert_Messages = (sender,message,groupId)=>{
	messages.push({name:sender,message,groupId});
}

const filter_Messages = (groupId)=>{
	const group_messages = messages.filter((message)=>{
		return groupId===message.groupId;
	});
	return group_messages;
}
const filter_Users = (groupId)=>{
	const group_Users = All_participants.filter((user)=>{
		return groupId===user.groupId;
	});
	return group_Users;
}
app.use(cors());

io.on('connection',(socket)=>{
	let GID = '';
	socket.emit('Welcome','Welcome to the meet');
	socket.on('Join',(groupId,UserId,VideoID,ScreenID)=>{
		socket.join(groupId);
		insert_participants(UserId,groupId,socket.id,VideoID,ScreenID);
		GID = groupId;
		insert_Messages('BOT',`@${UserId} jumped in!!`,groupId);
		const groupChat = filter_Messages(groupId);
		const group_list = filter_Users(groupId);
		console.log(group_list);
		io.sockets.in(groupId).emit('GroupChat',groupChat);
		io.sockets.in(groupId).emit('UpdateParticipants',group_list);
		socket.emit('SetYourMediaStream');
		socket.to(groupId).emit('CallNewUser',UserId,VideoID);
	});
	socket.on('MediaStreamSet',(groupId,UserId,VideoID)=>{
		socket.to(groupId).emit('CallNewUser',UserId,VideoID);
	});
	socket.on('conversation',(message,groupId,UserId)=>{
		insert_Messages(UserId,message,groupId);
		const groupChat = filter_Messages(groupId);
		io.sockets.in(groupId).emit('GroupChat',groupChat);
	});
	socket.on('UpdateStreamId',(StreamID)=>{
		updateStreamId(socket.id,StreamID);
	});
	socket.on('UpdateScreenStreamId',(ScreenStreamID)=>{
		updateScreenStreamId(socket.id,ScreenStreamID);
		console.log('updating the screen stream',All_participants);
	});
	socket.on('ShareScreenInRoom',(ScreenID,groupId)=>{
		socket.to(groupId).emit('RecieveShareScreen',ScreenID);
	});
	socket.on('RemoveShareScreenDiv',(groupId)=>{
		const index = All_participants.findIndex((potential_user)=>{
			return potential_user.socketID===socket.id;
		});
		console.log('in server remove share div');
		socket.to(groupId).emit('RemovingScreenDivFromWatching',All_participants[index]);
	});
	socket.on('disconnect',()=>{
		console.log('user disconnected');
		const user = remove_participant(socket.id);
		if(user){
			insert_Messages('BOT',`@${user.name} Left the meet`,user.groupId);
			const groupChat = filter_Messages(user.groupId);
			const group_list = filter_Users(user.groupId);
			io.sockets.in(user.groupId).emit('GroupChat',groupChat);
			io.sockets.in(user.groupId).emit('RemoveParticipantLeft',user);
			io.sockets.in(user.groupId).emit('UpdateParticipants',group_list);
		}
	});
});

server.listen(port,()=>{
	console.log(`The server is up and running on port ${port}`);
});

