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
let game;

function preload() {
    game = new Game();
    game.spaceImg = loadImage("./assets/spaceship.png");
    game.enemyImg = loadImage("./assets/alien1.png");
}

function setup() {
    createCanvas(800, 600);
    translate(width / 2, height / 2);
    game.setup();

}


function draw() {
    background(0);
    strokeWeight(1);

    if (game.gameOver) {
        textAlign(CENTER);
        fill(255);
        textSize(32);
        if (game.gameWin)
            text("Winner", width / 2, height / 2);
        else
            text("Game Over", width / 2, height / 2);
        text("Score: " + game.score, width / 2, height / 2 + 40);
        if (!game.retryButtonVisible) {
            game.retryButton.show();
            game.retryButtonVisible = true;
        }
        return;
    }

    game.player.show();
    game.player.move();

    for (let i = 0; i < game.enemies.length; i++) {
        game.enemies[i].show();
        game.enemies[i].move();
    }

    for (let i = 0; i < game.playerProjectiles.length; i++) {
        game.playerProjectiles[i].show();
        game.playerProjectiles[i].move();
        for (let j = 0; j < game.enemies.length; j++) {
            if (game.playerProjectiles[i].hit(game.enemies[j])) {
                game.killedEnemies++;
                game.score++;
                game.enemies.splice(j, 1);
                game.playerProjectiles.splice(i, 1);
                i--;
                break;
            }
        }
    }

    for (let i = 0; i < game.enemyProjectiles.length; i++) {
        game.enemyProjectiles[i].show();
        game.enemyProjectiles[i].move();
        if (game.enemyProjectiles[i].hit(game.player)) {
            game.gameOver = true;
        }
    }

    if (game.enemies.length === 0) {
        game.gameOver = true;
        game.gameWin = true;
    }
    game.updateKilledText();
    game.drawStars();
}

function keyPressed() {
    if (key === " ") {
        game.playerProjectiles.push(new Projectile(game.player.x, game.player.y, -1));
    }
}

class Game {
    constructor() {
        this.player;
        this.enemies = [];
        this.playerProjectiles = [];
        this.enemyProjectiles = [];
        this.gameOver = false;
        this.gameWin = false;
        this.score = 0;
        this.retryButton = createButton("Retry");
        this.retryButtonVisible = false;
        // images
        this.spaceImg;
        this.enemyImg;
        // counter
        this.killedEnemies = 0;
        // star variables
        this.starX = [];
        this.starY = [];
        this.starSpeed = [];
    }

    setup() {
      this.retryButton.position(width / 2 - 20, height / 2 + 80);
      this.retryButton.mousePressed(() => { this.resetGame() });
      this.resetGame();
    }

    resetGame() {
        this.killedEnemies = 0
        this.gameOver = false;
        this.gameWin = false;
        this.score = 0;
        this.retryButtonVisible = false;
        this.retryButton.hide();
        this.player = new Player();
        this.enemies = [];
        this.initEnemies();
        this.playerProjectiles = [];
        this.enemyProjectiles = [];
        // stars reset
        this.starX = [];
        this.starY = [];
        this.starSpeed = [];
    }

    initEnemies() {
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 10; j++) {
                this.enemies.push(new Enemy(j * 60 + 60, i * 40 + 80));
            }
        }
    }


    drawStars() {
        for (var i = 0; i < 50; i++) {
            stroke(255);
            strokeWeight(random(1, 4));
            if (!this.starX[i]) {
                this.starX[i] = random(width);
                this.starY[i] = random(height);
                this.starSpeed[i] = random(1, 2);
            } else {
                this.starY[i] -= this.starSpeed[i];
                if (this.starY[i] < 0) {
                    this.starX[i] = random(width);
                    this.starY[i] = height;
                }
            }
            point(this.starX[i], this.starY[i]);
        }
    }

    updateKilledText() {
        textAlign(CENTER);
        strokeWeight(0.5);
        fill(255);
        textSize(12);
        text("Killed Enemies: " + this.killedEnemies, 80, 30);
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
    image(game.spaceImg, this.x, this.y, this.w, this.h);
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
    image(game.enemyImg, this.x, this.y, this.w, this.h);
    //rect(this.x, this.y, this.w, this.h);
  }

  move() {
    this.x += this.speed * this.direction;
    if (this.x > width - this.w || this.x < 0) {
      this.direction *= -1;
      this.y += 10;
    }
    if (random(1) < 0.001) {
      game.enemyProjectiles.push(new Projectile(this.x + this.w / 2, this.y + this.h, 1));
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
