const game = {
  // [roomKey]: {
  // users: [],
  // randomTasks: [],
  // scores: [],
  // gameScore: 0,
   players: {},
   numPlayers: 0
  // }
};

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`A socket connection to the server has been made: ${socket.id}`);

    game.players[socket.id] = {
      rotation: 0,
      x: 400,
      y: 300,
      playerId: socket.id,
    };

    // update number of players
    game.numPlayers = Object.keys(game.players).length;

    console.log("game", game);

    // set initial state
    socket.emit("setState", game);

    // send the players object to the new player
    socket.emit("currentPlayers", {
      players: game.players,
      numPlayers: game.numPlayers,
    });


    // update all other players of the new player
    socket.broadcast.emit("newPlayer", {
      playerInfo: game.players[socket.id],
      numPlayers: game.numPlayers,
    });


    // when a player moves, update the player data
    socket.on("playerMovement", function (data) {
      const {x, y} = data;
      game.players[socket.id].x = x;
      game.players[socket.id].y = y;
      // emit a message to all players about the player that moved
      socket.broadcast.emit("playerMoved", game.players[socket.id]);
    });

    // when a player disconnects, remove them from our players object
    socket.on("disconnect", function () {

      console.log("user disconnected: ", socket.id);
      // remove this player from our players object
      delete game.players[socket.id];
      // update numPlayers
      game.numPlayers = Object.keys(game.players).length;
      // emit a message to all players to remove this player
      io.emit("disconnected", {
        playerId: socket.id,
        numPlayers: game.numPlayers,
      });

    });
  })
}

