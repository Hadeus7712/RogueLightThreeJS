

let map = [];
let size = 50;

function create(){
    for(let i = 0; i < size; i++){
        map[i] = new Array(size);
        for(let j = 0; j < size; j++){
            map[i][j] = 0;
        }
    }
}

create();





function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

class Tree {
    constructor(leaf) {
        this.leaf = leaf;
        this.lchild = undefined;
        this.rchild = undefined;
    }
    getLeafs() {
        if (this.lchild === undefined && this.rchild === undefined)
            return [this.leaf];

        else
            return [].concat(this.lchild.getLeafs(), this.rchild.getLeafs());
    }
    getLevel(level, queue) {
        if (queue === undefined)
            queue = [];
        if (level == 1) {
            queue.push(this);
        } else {
            if (this.lchild !== undefined)
                this.lchild.getLevel(level - 1, queue);
            if (this.rchild !== undefined)
                this.rchild.getLevel(level - 1, queue);
        }
        return queue;
    }
    paint(c) {
        this.leaf.paint(c);
        if (this.lchild !== undefined)
            this.lchild.paint(c);
        if (this.rchild !== undefined)
            this.rchild.paint(c);
    }
}




var Point = function(x, y) {
    this.x = x
    this.y = y
}

class Container {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.center = new Point(
            this.x + (this.w / 2),
            this.y + (this.h / 2)
        );
    }
    paint(c) {
        c.strokeStyle = "#F00";
        c.lineWidth = 1;
        c.strokeRect(this.x * SQUARE, this.y * SQUARE,
            this.w * SQUARE, this.h * SQUARE);
    }
    drawPath(ctx, container) {
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#FFF";
        ctx.moveTo(this.center.x * SQUARE, this.center.y * SQUARE);
        ctx.lineTo(container.center.x * SQUARE, container.center.y * SQUARE);
        ctx.stroke();

        let flooredX = Math.floor(this.center.x);
        let flooredY = Math.floor(this.center.y);

        if(this.center.x == container.center.x){
            for(let i = Math.floor(this.center.y); i < Math.floor(container.center.y); i++){
                map[i][flooredX] = 2;
            }
        }else{
            for(let i = Math.floor(this.center.x); i < Math.floor(container.center.x); i++){
                map[flooredY][i] = 2;
            }
        }
    }
}



function split_container(container, iter) {
    var root = new Tree(container)
    if (iter != 0) {
        var sr = random_split(container)
        root.lchild = split_container(sr[0], iter-1)
        root.rchild = split_container(sr[1], iter-1)
    }
    return root
}


function random_split(container) {
    var r1, r2
    if (random(0, 1) == 0) {
        // Vertical
        r1 = new Container(
            container.x, container.y,             // r1.x, r1.y
            random(1, container.w), container.h   // r1.w, r1.h
        )
        r2 = new Container(
            container.x + r1.w, container.y,      // r2.x, r2.y
            container.w - r1.w, container.h       // r2.w, r2.h
        )

        if (DISCARD_BY_RATIO) {
            var r1_w_ratio = r1.w / r1.h
            var r2_w_ratio = r2.w / r2.h
            if (r1_w_ratio < W_RATIO || r2_w_ratio < W_RATIO) {
                return random_split(container)
            }
        }
    } else {
        // Horizontal
        r1 = new Container(
            container.x, container.y,             // r1.x, r1.y
            container.w, random(1, container.h)   // r1.w, r1.h
        )
        r2 = new Container(
            container.x, container.y + r1.h,      // r2.x, r2.y
            container.w, container.h - r1.h       // r2.w, r2.h
        )

        if (DISCARD_BY_RATIO) {
            var r1_h_ratio = r1.h / r1.w
            var r2_h_ratio = r2.h / r2.w
            if (r1_h_ratio < H_RATIO || r2_h_ratio < H_RATIO) {
                return random_split(container)
            }
        }
    }
    return [r1, r2]
}


class Room {
    constructor(container) {
        this.x = container.x + random(0, Math.floor(container.w / 3));
        this.y = container.y + random(0, Math.floor(container.h / 3));
        this.w = container.w - (this.x - container.x);
        this.h = container.h - (this.y - container.y);
        this.w -= random(0, this.w / 3);
        this.h -= random(0, this.w / 3);
        return this;
    }
    paint(c) {
        c.fillStyle = "#FFF";
        c.fillRect(this.x * SQUARE, this.y * SQUARE,
            this.w * SQUARE, this.h * SQUARE);


        for (let i = this.x; i < this.x + this.w; i++) {
            for (let j = this.y; j < this.y + this.h; j++) {
                map[j][i] = 1;
                // console.log("x " + this.x);
                // console.log("y " + this.y);
                // console.log("w " + this.w);
                // console.log("h " + this.h);
            }
        }


        console.log("x " + this.x);
        console.log("y " + this.y);
        console.log("w " + this.w);
        console.log("h " + this.h);

        console.log(this);
    }
}


var draw_paths = function(ctx, tree) {
    if (tree.lchild == undefined || tree.rchild == undefined)
        return
    tree.lchild.leaf.drawPath(ctx, tree.rchild.leaf)
    draw_paths(ctx, tree.lchild)
    draw_paths(ctx, tree.rchild)
}


var canvas           = document.getElementById('viewport')
var MAP_SIZE         = 50
var SQUARE           = canvas.width / MAP_SIZE
var N_ITERATIONS     = 3;
var DISCARD_BY_RATIO = true
var H_RATIO          = 0.45
var W_RATIO          = 0.45

var c_context = canvas.getContext('2d')

var main_container = new Container(0, 0, map.length, map.length)
var container_tree = split_container(main_container, N_ITERATIONS)

c_context.fillStyle = "#000"
c_context.fillRect(0, 0, canvas.width, canvas.height)
container_tree.paint(c_context)
var leafs = container_tree.getLeafs()
for (var i = 0; i < leafs.length; i++) {
    new Room(leafs[i]).paint(c_context)
}

draw_paths(c_context, container_tree);


class Map{
    constructor(params) {
        this.params = params;

        this.map = [];
        this.mapSize = params.mapSize;

        this.iterations = 3;
        this.DISCARD_BY_RATIO = true;
        this.H_RATIO = 0.45;
        this.W_RATIO = 0.45;

    }

    init(){
        this.createMap(this.mapSize);
    }

    createMap(size){
        for(let i = 0; i < size; i++){
            this.map[i] = new Array(size);
            for(let j = 0; j < size; j++){
                this.map[i][j] = 0;
            }
        }
    }

    createRooms(){
        let main_container = new Container(0, 0, this.mapSize, this.mapSize);
        let container_tree = split_container(main_container, this.iterations);

        let leafs = container_tree.getLeafs();
        for(let i = 0; i < leafs.length; i++){
            new Room(leafs[i]).paint();
        }
    }
}