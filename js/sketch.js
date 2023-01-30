/*
   Copyright 2023 barqawiz

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

let player;
let enemies = [];
let playerProjectiles = [];
let enemyProjectiles = [];
let gameOver = false;
let gameWin = false;
let score = 0;
let retryButton;
let retryButtonVisible = false;
// images
let spaceImg;
let enemyImg;
// counter
let killedEnemies = 0;
// star variables
let starX = [];
let starY = [];
let starSpeed = [];

function preload() {
  spaceImg = loadImage("./assets/spaceship.png");
  enemyImg = loadImage("./assets/alien1.png");

}

function setup() {
  createCanvas(800, 600);
  translate(width / 2, height / 2);
  retryButton = createButton("Retry");
  retryButton.position(width/2-20, height/2+80);
  retryButton.mousePressed(resetGame);
  resetGame();
}

function resetGame() {
  killedEnemies = 0
  gameOver = false;
  gameWin = false;
  score = 0;
  retryButtonVisible = false;
  retryButton.hide();
  player = new Player();
  enemies = [];
  initEnemies();
  playerProjectiles = [];
  enemyProjectiles = [];
  // stars reset
  let starX = [];
  let starY = [];
  let starSpeed = [];
}

function initEnemies() {
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 10; j++) {
      enemies.push(new Enemy(j * 60 + 60, i * 40 + 80));
    }
  }
}

function draw() {
  background(0);
  strokeWeight(1);

  if (gameOver) {
    textAlign(CENTER);
    fill(255);
    textSize(32);
    if (gameWin)
      text("Winner", width / 2, height / 2);
    else
      text("Game Over", width / 2, height / 2);
    text("Score: " + score, width / 2, height / 2 + 40);
    if (!retryButtonVisible) {
      retryButton.show();
      retryButtonVisible = true;
    }
    return;
  }

  player.show();
  player.move();

  for (let i = 0; i < enemies.length; i++) {
    enemies[i].show();
    enemies[i].move();
  }

  for (let i = 0; i < playerProjectiles.length; i++) {
    playerProjectiles[i].show();
    playerProjectiles[i].move();
    for (let j = 0; j < enemies.length; j++) {
      if (playerProjectiles[i].hit(enemies[j])) {
        killedEnemies++;
        score++;
        enemies.splice(j, 1);
        playerProjectiles.splice(i, 1);
        i--;
        break;
      }
    }
  }

  for (let i = 0; i < enemyProjectiles.length; i++) {
    enemyProjectiles[i].show();
    enemyProjectiles[i].move();
    if (enemyProjectiles[i].hit(player)) {
      gameOver = true;
    }
  }

  if (enemies.length === 0) {
    gameOver = true;
    gameWin = true;
  }
  updateKilledText();
  drawStars();
}

function drawStars() {
    for (var i = 0; i < 50; i++) {
        stroke(255);
        strokeWeight(random(1, 4));
        if (!starX[i]) {
            starX[i] = random(width);
            starY[i] = random(height);
            starSpeed[i] = random(1, 2);
        } else {
            starY[i] -= starSpeed[i];
            if (starY[i] < 0) {
                starX[i] = random(width);
                starY[i] = height;
            }
        }
        point(starX[i], starY[i]);
    }
}

function updateKilledText() {
  textAlign(CENTER);
  strokeWeight(0.5);
  fill(255);
  textSize(12);
  text("Killed Enemies: " + killedEnemies, 80, 30);
}

function keyPressed() {
  if (key === " ") {
    playerProjectiles.push(new Projectile(player.x, player.y,-1));
  }
}

class Player {
  constructor() {
    this.x = width / 2;
    this.y = height - 70;
    this.w = 50;
    this.h = 50;
  }

  show() {
    image(spaceImg, this.x, this.y, this.w, this.h);
  }

  move() {
      if (keyIsDown(LEFT_ARROW) && this.x > 0) {
    this.x -= 5;
  }
  if (keyIsDown(RIGHT_ARROW) && this.x < width - this.w) {
    this.x += 5;
  }
}
}

class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 50;
    this.h = 50;
    this.speed = 1;
    this.direction = 1;
  }

  show() {
    image(enemyImg, this.x, this.y, this.w, this.h);
    //rect(this.x, this.y, this.w, this.h);
  }

  move() {
    this.x += this.speed * this.direction;
    if (this.x > width - this.w || this.x < 0) {
      this.direction *= -1;
      this.y += 10;
    }
    if (random(1) < 0.001) {
      enemyProjectiles.push(new Projectile(this.x + this.w / 2, this.y + this.h, 1));
    }
  }
}

class Projectile {
  constructor(x, y, direction) {
    this.x = x;
    this.y = y;
    this.r = 10;
    this.speed = 5;
    this.direction = direction;
  }

  show() {
    ellipse(this.x, this.y, this.r * 2);
  }

  move() {
    this.y += this.speed * this.direction;
  }

  hit(obj) {
    let d = dist(this.x, this.y, obj.x + obj.w / 2, obj.y + obj.h / 2);
    return d < this.r + obj.w / 2;
  }
}
