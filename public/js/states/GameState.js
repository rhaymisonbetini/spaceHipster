var SpaceHipster = SpaceHipster || {};

SpaceHipster.GameState = {

  init: function (currentLevel) {
    this.scale.scaleModule = Phaser.ScaleManager.SHOW_ALL;
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    this.PLAYER_SPEED = 200;
    this.BULLET_SPEED = -1000;

    this.numLevels = 3;
    this.currentLevel = currentLevel ? currentLevel : 1;
  },


  preload: function () {
    this.load.image('space', 'assets/images/space.png');
    this.load.image('player', 'assets/images/player.png');
    this.load.image('bullet', 'assets/images/bullet.png');
    this.load.image('enemyParticle', 'assets/images/enemyParticle.png');
    this.load.spritesheet('yellowEnemy', 'assets/images/yellow_enemy.png', 50, 46, 3, 1, 1)
    this.load.spritesheet('redEnemy', 'assets/images/red_enemy.png', 50, 46, 3, 1, 1)
    this.load.spritesheet('greenEnemy', 'assets/images/green_enemy.png', 50, 46, 3, 1, 1)

    this.load.text('level1', 'js/jsons/level1.json');
    this.load.text('level2', 'js/jsons/level2.json');
    this.load.text('level3', 'js/jsons/level3.json');

    this.load.audio('orchestra', ['assets/audio/8bit-orchestra.mp3', 'assets/audio/8bit-orchestra.ogg']);
  },


  create: function () {
    this.background = this.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'space');
    this.background.autoScroll(0, 30);


    //criando o player
    this.player = this.add.sprite(this.game.world.centerX, this.game.world.height - 50, 'player');
    this.player.anchor.setTo(0.5);
    this.game.physics.arcade.enable(this.player);
    this.player.body.collideWorldBounds = true;

    //criando a pscina de bullets
    this.bulletsGame = this.add.group();
    this.bulletsGame.enableBody = true;
    this.breateBullet();
    this.shootingTime = this.game.time.events.loop(Phaser.Timer.SECOND / 5, this.breateBullet, this);

    //criando pscina de alienigenas
    this.initiEnemys();

    //Load Level
    this.loadLevel();
    this.orchestra = this.add.audio('orchestra');
    this.orchestra.play();
  },

  update: function () {

    this.game.physics.arcade.overlap(this.bulletsGame, this.enemies, this.damangeEnemy, null, this);
    this.game.physics.arcade.overlap(this.enemyBullets, this.player, this.killPlayer, null, this);


    //ouvindo as entradas do usuario para calculo de direcao
    this.player.body.velocity.x = 0;
    if (this.game.input.activePointer.isDown) {
      let targetx = this.game.input.activePointer.position.x;
      let direction = targetx >= this.game.world.centerX ? 1 : -1;
      this.player.body.velocity.x = direction * this.PLAYER_SPEED;
    }

  },

  breateBullet: function () {
    //pega o primeiro sprite morto da sequencia de barris
    let newBullets = this.bulletsGame.getFirstExists(false);

    if (!newBullets) {
      newBullets = this.bulletsGame.create(0, 0, 'bullet');
    }
    newBullets.anchor.setTo(0.5);
    newBullets.checkWorldBounds = true;
    newBullets.outOfBoundsKill = true;
    newBullets.reset(this.player.x, this.player.top);
    newBullets.body.velocity.y = this.BULLET_SPEED;
  },

  initiEnemys: function () {
    this.enemies = this.add.group();
    this.enemies.enableBody = true;

    this.enemyBullets = this.add.group();
    this.enemyBullets.enableBody = true;
  },

  damangeEnemy: function (bullet, enemy) {
    enemy.damage(1);
    bullet.kill();
  },

  killPlayer: function () {
    this.player.kill();
    this.game.state.start('GameState');
    this.orchestra.stop();
  },

  createEnemy: function (x, y, health, key, scale, speedX, speedY) {
    let enemyer = this.enemies.getFirstExists(false);
    if (!enemyer) {
      enemyer = new SpaceHipster.Enemy(this.game, x, y, key, health, this.enemyBullets);
      this.enemies.add(enemyer);
    }
    enemyer.reset(x, y, health, key, scale, speedX, speedY);

  },

  loadLevel: function () {
    this.currentEnemyIndex = 0;
    this.levelData = JSON.parse(this.game.cache.getText('level' + this.currentLevel));
    this.endOfLevelTime = this.game.time.events.add(this.levelData.duration * 1000, () => {
      this.orchestra.stop();
      if (this.currentLevel < this.numLevels) {
        this.currentLevel++;
      } else {
        this.currentLevel = -1;
      }
      this.game.state.start('GameState', true, false, this.currentLevel);
    }, this);

    this.scheduleNextEnemy();

  },

  scheduleNextEnemy: function () {
    var nextEnemy = this.levelData.enemies[this.currentEnemyIndex];

    if (nextEnemy) {
      var nextTime = 1000 * (nextEnemy.time - (this.currentEnemyIndex == 0 ? 0 : this.levelData.enemies[this.currentEnemyIndex - 1].time));

      this.nextEnemyTimer = this.game.time.events.add(nextTime, function () {
        this.createEnemy(nextEnemy.x * this.game.world.width, -100, nextEnemy.health, nextEnemy.key, nextEnemy.scale, nextEnemy.speedX, nextEnemy.speedY);

        this.currentEnemyIndex++;
        this.scheduleNextEnemy();
      }, this);
    }
  }
}