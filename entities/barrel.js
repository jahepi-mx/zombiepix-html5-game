let BARREL_TYPE = 35;

class Barrel extends Tile {
    
    constructor(x, y, width, height, type, map) {
        super(x, y, width, height, type);
        this.hits = 5;
        this.map = map;
        this.walkable = false;
        this.animation = new Animation(12, 2);
        this.animation.stopAtSequenceNumber(1, null);
        this.typeImage = Math.floor(Math.random() * 2) + 1;
        this.hitRatio = 10000;
    }
    
    render(context) {
        if (this.isWalkable()) {
            var image = "floor";
            context.drawImage(this.assets.spritesAtlas, this.atlas.sprites[image].x, this.atlas.sprites[image].y, this.atlas.sprites[image].width, this.atlas.sprites[image].height, this.left() + this.camera.offsetX, this.top() + this.camera.offsetY, this.width, this.height);
            if (!this.animation.isStopped()) {
                image = "explosion_" + (this.animation.getFrame() + 1); 
                context.drawImage(this.assets.spritesAtlas, this.atlas.sprites[image].x, this.atlas.sprites[image].y, this.atlas.sprites[image].width, this.atlas.sprites[image].height, this.left() + this.camera.offsetX, this.top() + this.camera.offsetY, this.width, this.height);
            }
        } else {
            var image = "floor";
            context.drawImage(this.assets.spritesAtlas, this.atlas.sprites[image].x, this.atlas.sprites[image].y, this.atlas.sprites[image].width, this.atlas.sprites[image].height, this.left() + this.camera.offsetX, this.top() + this.camera.offsetY, this.width, this.height);
            image = "barrel_" + this.typeImage;
            context.drawImage(this.assets.spritesAtlas, this.atlas.sprites[image].x, this.atlas.sprites[image].y, this.atlas.sprites[image].width, this.atlas.sprites[image].height, this.left() + this.camera.offsetX, this.top() + this.camera.offsetY, this.width, this.height);
        }
    }
    
    isWalkable() {
        return this.walkable;
    }
    
    update(deltatime) {
        if (this.hits <= 0) {
            if (!this.walkable) {
                for (let zombie of this.map.zombies) {
                    var diffX = zombie.left() - this.left();
                    var diffY = zombie.top() - this.top();
                    //console.log(diffX * diffX + diffY * diffY);
                    if (diffX * diffX + diffY * diffY <= this.hitRatio) {
                        zombie.kill(true);
                    }
                }
            }
            this.walkable = true;
        }
        if (this.walkable && !this.animation.isStopped()) {
            this.animation.update(deltatime);
        }
    }  
}