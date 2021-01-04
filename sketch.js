var canvas, backgroundImage;

var gameState;
var playerCount = 0;
var currentRound = 1;
var allPlayers;
var notYetArtist;
var maxCount;
var maxRounds;
var database;


var form, player, game, colorWheel, lineColor = 255, colorPicked = 255;
var pickedWordDefault = "Loading..."
var drawingWord = pickedWordDefault, wordsGuessed = [];

var drawing = [];
var currentPath = [];
var isDrawing = false;

function preload() {
  colorWheel = loadImage("images/colorwheel.png");
}

function setup() {
  canvas = createCanvas(displayWidth * 2 / 3, displayHeight * 2 / 3);
  canvas.mousePressed(Form.startDrawing);
  canvas.mouseReleased(Form.endDrawing);
  database = firebase.database();
  gameState = 0;
  maxCount = 2;
  maxRounds = 2;
  game = new Game();


  Game.getState(game.start, game.end);
  Game.intRoundInfo();
  game.pickWord();

}


function draw() {
  if (playerCount === maxCount && gameState === 1) {
    game.nextRound();
    Game.update(2);
  }
  if (gameState === 2) {
    clear();
    game.play();
    cursor(CROSS);
    if (player && player.type === Player.playerRoles.artist) {
      push();
      image(colorWheel, 0, 0);
      colorPicked = colorWheel.get(mouseX, mouseY);
      if (mouseX < colorWheel.width && mouseY < colorWheel.height) {
        push();
        stroke(colorPicked[0], colorPicked[1], colorPicked[2]);
        fill(colorPicked);
        ellipse(mouseX, mouseY, 15, 15);
        pop();
        cursor(HAND);

      }
      fill(lineColor[0], lineColor[1], lineColor[2], 150);
      ellipse(75, 190, 50, 50);
      pop();
    }
  }

  if (gameState === 3) {
    canvas.hide();
    //game.wait();
    game.end();

  }
  if (playerCount > maxCount) {
    form.tooManyError();
  }
  var msg = "Enter the data to begin."
  if (form) {
    if (!player || player.type === Player.playerRoles.guesser) {
      cursor("not-allowed");
      form.hideArtistControls();
      if (gameState === 2)
        msg = "Hi " + player.name + ". Guess the word...";
    } else {
      form.hideGuesserControls();
      if (gameState === 2)
        msg = "Hi " + player.name + ". Your word is : <b>" + drawingWord + "</b>"
    }

    form.message.html(msg)
  }
}
function keyReleased() {
  if (form) {
    if (!player || player.type === Player.playerRoles.guesser) {
      if (keyCode == ENTER) {
        game.newGuess();
      }
    }
  }
}

function mouseReleased() {
  if (mouseX < colorWheel.width && mouseY < colorWheel.height) {
    console.log('colorPicked=', colorPicked);
    lineColor = colorPicked;
  }
}

// function windowResized() {
//   resizeCanvas(windowWidth-50 , windowHeight-50);
// }

