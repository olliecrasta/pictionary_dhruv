class Form {

  constructor() {
    //this.input = createInput("Name");
    this.input = createInput("").attribute("placeholder", "Name");
    this.playButton = createButton('Play');
    this.greeting = createElement('h2');
    this.result = createElement('h2');
    this.message = createElement('p');
    this.title = createElement('h2');
    this.tooMany = createElement('h2')
    this.rounds = createInput("").attribute("placeholder", "enter number of rounds");
    this.number = createInput("").attribute("placeholder", "Enter number of players");
    this.reset = createButton('Reset Game');
    this.clearCanvasButton = createButton('Clear Canvas');
    this.drawingWordText = createElement('h2');
    this.guessOutput = createElement('table');
    this.guessInput = createInput("").attribute("placeholder", "Guess");
  }
  hide() {
    this.greeting.hide();
    this.playButton.hide();
    this.input.hide();
    this.title.hide();
    this.rounds.hide();
    this.number.hide();

  }
  hideGameState1Fields() {
    this.rounds.hide();
    this.number.hide();
  }

  display() {
    this.title.html("Pictionary");
    this.title.position(displayWidth / 3, 0);
    if (gameState === 0) {
      this.rounds.position(50, displayHeight / 2 - 60)
      this.number.position(50, displayHeight / 2 - 40)
    } else {
      this.hideGameState1Fields()
    }

    this.input.position(50, displayHeight / 2 - 80);
    this.playButton.position(50, displayHeight / 2);


    this.playButton.mousePressed(() => {
      this.input.hide();
      this.playButton.hide();
      this.rounds.hide();
      this.number.hide();
      player.name = this.input.value();

      if (gameState === 0) {
        maxCount = +this.number.value();
        maxRounds = +this.rounds.value();
        game.updateMax();
        game.updateWords();

      }
      playerCount += 1;
      player.index = playerCount;
      player.rank = 0;
      player.score = 0;
      player.type = Player.playerRoles.artist
      if (playerCount === 1) {
        Game.update(1)
      }
      if (playerCount > 1) {

        player.type = Player.playerRoles.guesser

      }
      player.update();
      Player.updateCount(playerCount);

      if (playerCount == maxCount) {
        game.pickWord();
      }
      this.greeting.html("Hello " + player.name)
      this.greeting.position(displayWidth / 2 - 70, displayHeight / 4);
    });

    var refDrawings = database.ref('drawings');
    refDrawings.on('value', Form.canvasUpdated, Form.errData);
    Form.showNewCanvas("canvas");

    this.message.position(20, displayHeight * 2 / 3 + 50);
    this.reset.position(20, displayHeight * 2 / 3 + 30);
    this.reset.mousePressed(() => {
      Game.resetGame();
      Player.updateCount(0);
      Player.deletePlayers();
      Form.cleanCanvas();
    })
    this.clearCanvasButton.position(120, displayHeight * 2 / 3 + 30);
    this.clearCanvasButton.mousePressed(() => {
      Form.cleanCanvas();
    })
    this.guessInput.position(420, displayHeight * 2 / 3 + 30);
    this.guessInput.size("500");
    this.drawingWordText.position(120, displayHeight * 2 / 3 + 60);
    this.guessOutput.position(20, displayHeight * 2 / 3 + 100);

    // this.guessOutput.addColumn('Name');
    // this.guessOutput.addColumn('Word guessed');
    // this.guessOutput.html("Guesses:<br/>")
    this.guessOutput.attribute("id", "GuessOutput")
    // this.addTableRow("Player", "Guess", true)
    if (gameState === 2)
      this.createFreshTable();
  }
  getNewGuess() {
    return this.guessInput.value();
  }
  addGuessToOutputTable(byWho, word) {
    this.addTableRow(byWho, word)
  }
  createFreshTable() {
    var table = document.getElementById("GuessOutput");
    table.innerHTML = "";
    var header = table.createTHead();
    var row = header.insertRow(0);
    var col1 = "<b style='min-width=100px'>Player</b>"
    var col2 = "<b>Guess</b>"
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    cell1.innerHTML = col1;
    cell2.innerHTML = col2;
    table.createTBody();
  }
  addTableRow(col1, col2) {
    var table = document.getElementById("GuessOutput");
    var row = table.getElementsByTagName("TBODY")[0].insertRow(0);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    cell1.innerHTML = col1;
    cell2.innerHTML = col2;
  }

  showResult() {
    this.result.position(displayWidth / 3 - 100, 80);
    this.result.html("Game Over! Your score : " + player.score)
  }
  tooManyError() {
    this.tooMany.position(displayWidth / 2 - 40, displayHeight / 2 - 80);
    this.tooMany.html('game room full please try again later ');
    this.reset.position(displayWidth - 80, 30);
    this.reset.mousePressed(() => {
      Player.updateCount(0);
      Game.update(0)
    })
  }

  hideArtistControls() {
    this.clearCanvasButton.attribute('disabled', '');
    this.guessInput.show();
  }
  hideGuesserControls() {
    this.clearCanvasButton.removeAttribute('disabled');
    this.guessInput.hide();
  }

  static startDrawing() {
    isDrawing = (player.type === Player.playerRoles.artist);
    currentPath = [];
    if (!drawing) { drawing = []; }
    drawing.push(currentPath);
  }
  static endDrawing() {
    isDrawing = false;
    Form.saveDrawing()
  }

  static saveDrawing() {
    var ref = database.ref('drawings');
    var data = {
      canvas: {
        name: player.name,
        drawing: drawing.map(p => (p.length > 0) ? p : null),
        word: drawingWord
      }
    };
    var result = ref.update(data, (err, status) => {
      // console.log("DB Update Status:", status);
    });
    // console.log("DB Update:", result.key);

  }

  static canvasUpdated(data) {
    var drawings = data.val();
    if (drawings) {
      var keys = Object.keys(drawings);
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (player.type === Player.playerRoles.guesser) {
          Form.showNewCanvas(key);
        }
      }
    }
  }
  static errData(err) {
    console.log(err);
  }
  static showNewCanvas(key) {
    if (key instanceof MouseEvent) {
      key = this.html();
    }
    // console.log('fetching :drawings/' + key);
    var ref = database.ref('drawings/' + key);
    ref.once('value', oneDrawing, Form.errData);

    function oneDrawing(data) {
      var dbdrawing = data.val();
      drawing = (dbdrawing) ? dbdrawing.drawing : [];
    }
  }
  static cleanCanvas() {
    drawing = [];
    Form.saveDrawing();
  }

}
