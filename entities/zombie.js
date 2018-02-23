class Zombie extends Entity {  
    
    constructor(x, y, width, height, map, zombieKiller, speed) {
        super(x, y, width, height);
        this.map = map;
        this.zombieKiller = zombieKiller;
        this.camera = Camera.getInstance();
        
        this.pathfindingTime = 0;
        this.pathfindingTimeLimit = 10;
        this.visited = [];
        this.parents = [];
        this.vectors = [[1, 0], [0, 1], [-1, 0], [0, -1]];
        this.vectorsPath = [];
        this.toX = this.x;
        this.toY = this.y;
        this.speed = speed;
        this.isNewPosition = true;
        this.atlas = Atlas.getInstance();
        this.assets = Assets.getInstance();
        this.walkAnimation = new Animation(4, 2);
        this.attackAnimation = new Animation(6, 2);
        this.rotation = 0;
        this.health = 10;
        this.isDead = false;
        this.bodyparts = [];
                
        this.queue = new PriorityQueue(function (a, b) {
            return a.priority > b.priority;
        });
    }
    
    update(deltatime) {
        
        if (this.isDead) {
            for (let bodypart of this.bodyparts) {
                bodypart.update(deltatime);
            }
            return;
        }
        
        this.pathfindingTime += deltatime;
        this.walkAnimation.update(deltatime);
        this.attackAnimation.update(deltatime);
        
        if (this.pathfindingTime >= this.pathfindingTimeLimit) {
            this.pathfindingTime = 0;
            this.vectorsPath = this.pathfinding();
        }

        if (this.vectorsPath.length > 0 && this.isNewPosition) {
            var vector = this.vectorsPath.pop();
            this.toX = (vector % this.map.cols) * this.map.tileWidth;
            this.toY = Math.floor(vector / this.map.cols) * this.map.tileHeight;
            console.log((vector % this.map.cols) + ", " + Math.floor(vector / this.map.cols));
            this.isNewPosition = false;
        }
        
        var diffX = (this.toX + this.map.tileWidth / 2 - this.width / 2) - this.x;
        var diffY = (this.toY + this.map.tileHeight / 2 - this.height / 2) - this.y;
        
        if (diffX >= 0) {
            this.x += this.speed * deltatime;
        } else {
            this.x -= this.speed * deltatime;
        }
        
        if (diffY >= 0) {
            this.y += this.speed * deltatime;
        } else {
            this.y -= this.speed * deltatime;
        }
        
        if (Math.abs(diffX) <= 1 && Math.abs(diffY) <= 1) {
            this.isNewPosition = true;
        }
        
        for (let bullet of this.zombieKiller.bullets) {
            if (this.collide(bullet)) {
                bullet.collided = true;
                if (--this.health <= 0) {
                    this.isDead = true;
                    this.bodyparts.push(new ZombieBodyPart(this.left(), this.top(), 50, 50));
                    this.bodyparts.push(new ZombieBodyPart(this.left(), this.top(), 50, 50));
                    this.bodyparts.push(new ZombieBodyPart(this.left(), this.top(), 50, 50));
                }
            }
        }
    }
    
    pathfinding() {
        this.queue.clear();
        this.visited = [];
        this.parents = [];
        var targetX = this.zombieKiller.currentX();
        var targetY = this.zombieKiller.currentY();
        //console.log("target: " + targetX + "," + targetY);
        
        var currentX = Math.floor(this.x / this.map.tileWidth);
        var currentY = Math.floor(this.y / this.map.tileHeight);
        //console.log("curr: " + currentX + "," + currentY);
        var startVector = currentY * this.map.cols + currentX;
        this.visited[startVector] = 1;
        var heuristic = Math.abs(this.zombieKiller.left() - this.x) + Math.abs(this.zombieKiller.top() - this.y);
        this.queue.add(startVector, heuristic);
        
        out: while (!this.queue.isEmpty()) {
            var vector = this.queue.remove().object;
            var x = vector % this.map.cols;
            var y = Math.floor(vector / this.map.cols);
            for (let vector of this.vectors) {
                var newX = vector[0] + x;
                var newY = vector[1] + y;
                var tile = this.map.getTile(newX, newY);
                if (tile !== null && this.visited[newY * this.map.cols + newX] === undefined) {
                    this.visited[newY * this.map.cols + newX] = 1;
                    if (tile.isWalkable()) { 
                        this.parents[newY * this.map.cols + newX] = y * this.map.cols + x;
                        if (targetX === newX && targetY === newY) {
                            return this.path(newY * this.map.cols + newX);
                            break out;
                        }
                        heuristic = Math.abs(this.zombieKiller.left() - newX * this.map.tileWidth) + Math.abs(this.zombieKiller.top() - newY * this.map.tileHeight);
                        this.queue.add(newY * this.map.cols + newX, heuristic);
                    }
                }
            }
        }
        
        return [];
    }
    
    path(vector) {
        var stack = [];
        stack.push(vector);
        var x = vector % this.map.cols;
        var y = Math.floor(vector / this.map.cols);
        //console.log(x + "," + y);
        while (this.parents[vector] !== undefined) {
            vector = this.parents[vector];
            x = vector % this.map.cols;
            y = Math.floor(vector / this.map.cols);
            stack.push(vector);
            //console.log(x + "," + y);
        }
        return stack;
    }
    
    render(context) {
        if (this.isDead) {
            for (let bodypart of this.bodyparts) {
                bodypart.render(context);
            }
            return;
        }
        
        var diffX = (this.toX + this.map.tileWidth / 2 - this.width / 2) - this.x;
        var diffY = (this.toY + this.map.tileHeight / 2 - this.height / 2) - this.y;
        var range = 30;
        var minRange = 10;
        if (Math.abs(diffY) <= range && Math.abs(diffX) >= range) {
            this.rotation = diffX >= 0 ? Math.PI / 2 : -Math.PI / 2;
        }
        if (Math.abs(diffX) <= range && Math.abs(diffY) >= range) {
            this.rotation = diffY >= 0 ? Math.PI : 0;
        }
        context.save();
        context.translate(this.x + this.width / 2 + this.camera.offsetX, this.y + this.height / 2 + this.camera.offsetY);
        context.rotate(this.rotation);

        if (Math.abs(diffX) <= minRange && Math.abs(diffY) <= minRange) {

            var distance = Math.abs(this.left() - this.zombieKiller.left()) + Math.abs(this.top() - this.zombieKiller.top());
            var attackDistance = 90;
            console.log(distance);
            if (distance <= attackDistance) {
                var frame = "zombie_attack_" + (this.attackAnimation.getFrame() + 1);
                context.drawImage(this.assets.spritesAtlas, this.atlas.sprites[frame].x, this.atlas.sprites[frame].y, this.atlas.sprites[frame].width, this.atlas.sprites[frame].height, -this.width / 2, -this.height / 2, this.width, this.height);
            } else {
                var image = "zombie";
                context.drawImage(this.assets.spritesAtlas, this.atlas.sprites[image].x, this.atlas.sprites[image].y, this.atlas.sprites[image].width, this.atlas.sprites[image].height, -this.width / 2, -this.height / 2, this.width, this.height);
            }
        } else {         
            var frame = "zombie_walk_" + (this.walkAnimation.getFrame() + 1);
            context.drawImage(this.assets.spritesAtlas, this.atlas.sprites[frame].x, this.atlas.sprites[frame].y, this.atlas.sprites[frame].width, this.atlas.sprites[frame].height, -this.width / 2, -this.height / 2, this.width, this.height);
        }      
        context.restore();
    }
}

