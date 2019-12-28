var SpaceHipster = SpaceHipster || {};

SpaceHipster.GameState = {

  init: function () {
    this.scale.scaleModule = Phaser.ScaleManager.SHOW_ALL;
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    this.PLAYER_SPEED = 200;
    this.BULLET_SPEED = -1000;
  },


  preload: function () {
    this.load.image('space', 'assets/images/space.png');
    this.load.image('player', 'assets/images/player.png');
    this.load.image('bullet', 'assets/images/bullet.png');
    this.load.image('enemyParticle', 'assets/images/enemyParticle.png');
    this.load.spritesheet('yellowEnemy', 'assets/images/yellow_enemy.png', 50, 46, 3, 1, 1)
    this.load.spritesheet('redEnemy', 'assets/images/red_enemy.png', 50, 46, 3, 1, 1)
    this.load.spritesheet('greenEnemy', 'assets/images/green_enemy.png', 50, 46, 3, 1, 1)
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

  },

  update: function () {

    this.game.physics.arcade.overlap(this.bulletsGame, this.enemies, this.damangeEnemy, null, this);


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
    var enemy = new SpaceHipster.Enemy(this.game, 100, 100, 'greenEnemy', 10, []);
    this.enemies.add(enemy);
    enemy.body.velocity.x = 100;
    enemy.body.velocity.y = 50;
  },

  damangeEnemy: function (bullet, enemy) {
    enemy.damage(1);
    bullet.kill();
  }
}