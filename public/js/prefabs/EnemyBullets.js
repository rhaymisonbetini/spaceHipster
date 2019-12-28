var SpaceHipster = SpaceHipster || {};

SpaceHipster.EnemyBull = function (game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'bullet');
    this.anchor.setTo(0.5);
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
};

SpaceHipster.EnemyBull.prototype = Object.create(Phaser.Sprite.prototype);
SpaceHipster.EnemyBull.prototype.constructor = SpaceHipster.EnemyBull;