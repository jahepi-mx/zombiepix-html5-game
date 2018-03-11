let CRATE_TYPE = 44;

class Crate extends Tile {
    
    constructor(x, y, width, height, type) {
        super(x, y, width, height, type);
        this.hits = 5;
        this.walkable = false;
        this.animation = new Animation(3, 6);
        this.animation.stopAtSequenceNumber(1, null);
    }
    
    render(context) {
        var image = "tile7";
        context.drawImage(this.assets.spritesAtlas, this.atlas.sprites[image].x, this.atlas.sprites[image].y, this.atlas.sprites[image].width, this.atlas.sprites[image].height, this.left() + this.camera.offsetX, this.top() + this.camera.offsetY, this.width, this.height);
        
        if (this.hits <= 0) {
            image = "crate_broken_" + (this.animation.getFrame() + 1); 
            context.drawImage(this.assets.spritesAtlas, this.atlas.sprites[image].x, this.atlas.sprites[image].y, this.atlas.sprites[image].width, this.atlas.sprites[image].height, this.left() + this.camera.offsetX, this.top() + this.camera.offsetY, this.width, this.height);
        } else {
            image = "new_crate_" + (this.hits < 0 ? 0 : this.hits);
            context.drawImage(this.assets.spritesAtlas, this.atlas.sprites[image].x, this.atlas.sprites[image].y, this.atlas.sprites[image].width, this.atlas.sprites[image].height, this.left() + this.camera.offsetX, this.top() + this.camera.offsetY, this.width, this.height);
        }
    }
    
    isWalkable() {
        return this.walkable;
    }
    
    update(deltatime) {
        if (this.hits <= 0) {
            this.walkable = true;
            this.animation.update(deltatime);
        }
    }  
}
