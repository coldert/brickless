var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

// CONTROLS
var pressLeft = false;
var pressRight = false;

var audioPaddle = new Audio("paddle.mp3");
var audioWall = new Audio("wall.mp3");
var audioBottom = new Audio("bottom.mp3");
var audioHiScore = new Audio("highscore.mp3");

// SCORE
var score = 0;
var tempScore = 0;
var highScore = 0;
// DEBUG MESSAGE
var debug_msg = "";

// UPDATE TEMP SCORE
function updateTempScore() {
    tempScore++;
}

// DRAW SCORE BOARD
function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#333333";
    ctx.textAlign = "left";
    ctx.fillText("Score: " + score, 10, 23);
    ctx.textAlign = "center";
    ctx.fillText("Count: " + tempScore, canvas.width / 2, 23);
    ctx.textAlign = "right";
    ctx.fillText("High score: " + highScore, canvas.width - 10, 23);
    // DEBUG OUTPUT
    ctx.textAlign = "left";
    ctx.fillText(debug_msg, 10, 43);
}

// BALL
var Ball = function (defaults) {
    defaults = defaults || {};
    
    this.radius = defaults.radius || 20;
    this.dxInit = defaults.dxInit || 0.8;
    this.dyInit = defaults.dyInit || -1.7;
    this.dxMultiplier = defaults.dxMultiplier || 1.05;
    this.dyMultiplier = defaults.dyMultiplier || 1.01;
    this.dx = this.dxInit;
    this.dy = this.dyInit;
    this.xInit = defaults.xInit || canvas.width / 2;
    this.yInit = defaults.yInit || canvas.height - this.radius * 2;
    this.x = this.xInit;
    this.y = this.yInit;
    
    this.draw = function () {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = "#33aa33";
        ctx.fill();
        ctx.closePath();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius - 3, 0, Math.PI * 2, false);
        ctx.fillStyle = "#55cc55";
        ctx.fill();
        ctx.closePath();
    };
    
    this.collision = function (paddle) {
        // Hit left/right walls
        if (this.x <= this.radius || this.x >= canvas.width - this.radius) {
            this.dx = -this.dx;
            audioWall.play();
        }
        // Hit roof
        if (this.y <= this.radius) {
            this.dy = -this.dy;
            audioWall.play();
        }
        // Hit paddle
        if (this.dy > 0 && this.x >= paddle.x - paddle.hitAreaModifier && this.x <= paddle.x + paddle.width + paddle.hitAreaModifier && this.y > canvas.height - paddle.height - this.radius && this.y < canvas.height - this.radius) {
            audioPaddle.play();
            this.dx *= this.dxMultiplier;
            this.dy *= this.dyMultiplier;
            this.dy = -this.dy;
            score += tempScore;
        }
        // Hit bottom
        if (this.y > canvas.height) {
            this.y = this.radius;
            if (score > highScore) {
                audioHiScore.play();
                highScore = score;
            } else {
                audioBottom.play();
            }
            score = 0;
            tempScore = 0;
            this.dx = this.dxInit;
            this.dy = -this.dyInit;
        }

        this.x += this.dx;
        this.y += this.dy;
    };
};

// PADDLE
var Paddle = function () {
    this.height = 14;
    this.width = 80;
    this.speed = 5;
    this.padding = 5;
    this.hitAreaModifier = 5;
    this.x = (canvas.width - this.width) / 2;
    this.y = canvas.height - this.height - this.padding;
    
    this.draw = function () {
        if (pressLeft && this.x > 0 + this.padding) {
            this.x -= this.speed;
            tempScore = 0;
        }
        if (pressRight && this.x < canvas.width - this.width - this.padding) {
            this.x += this.speed;
            tempScore = 0;
        }
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = "#aa5533";
        ctx.fill();
        ctx.closePath();
        ctx.beginPath();
        ctx.rect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
        ctx.fillStyle = "#dd7755";
        ctx.fill();
        ctx.closePath();
    };
};

// INITIALIZE OBJECTS
var ball = new Ball();
var paddle = new Paddle();

// MAIN DRAW FUNCTION
function draw() {
    ctx.clearRect(1, 1, canvas.width - 2, canvas.height - 2);
    ball.collision(paddle);
    ball.draw();
    paddle.draw();
    updateTempScore();
    drawScore();
    requestAnimationFrame(draw);
}

// DRAW BORDER
function drawBorder() {
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#333333";
    ctx.stroke();
    ctx.closePath();
}

// KEYBOARD CONTROL HANDLING
document.addEventListener("keydown", function (e) {
    if (e.keyCode === 37) {
        pressLeft = true;
    } else if (e.keyCode === 39) {
        pressRight = true;
    }
}, false);
document.addEventListener("keyup", function (e) {
    if (e.keyCode === 37) {
        pressLeft = false;
    } else if (e.keyCode === 39) {
        pressRight = false;
    }
}, false);

// TOUCH CONTROL HANDLING
window.addEventListener("touchstart", function (e) {
    e.preventDefault();
    if (e.changedTouches[0].pageX < document.width / 2) {
        pressLeft = true;
        debug_msg = "TOUCH LEFT";
    } else if (e.changedTouches[0].pageX > document.width / 2) {
        pressRight = true;
        debug_msg = "TOUCH RIGHT";
    }
}, false);
window.addEventListener("touchend", function (e) {
    e.preventDefault();
    pressLeft = false;
    pressRight = false;
    debug_msg = "";
}, false);

// INITIALIZE GAME
drawBorder();
requestAnimationFrame(draw);
