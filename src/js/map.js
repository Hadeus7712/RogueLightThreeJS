import * as THREE from 'three';
import { HybridEnemy, SuicideEnemy, TowerEnemy } from './enemy';
import { Item } from './item';


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

    drawPath(container, map) {
        let flooredX = Math.floor(this.center.x);
        let flooredY = Math.floor(this.center.y);

        if(this.center.x == container.center.x){
            for(let i = Math.floor(this.center.y); i < Math.floor(container.center.y); i++){
                
                if(map[i][flooredX-1] == 0 || map[i][flooredX+1] == 0){
                    if(map[i][flooredX-1] ==0){
                        map[i][flooredX-1] = 3;
                    }
                    if(map[i][flooredX+1]== 0){
                        map[i][flooredX+1] = 3;
                    }
                    map[i][flooredX] = 1;
                }
                else{
                    map[i][flooredX] = 1;
                }
            }
            //console.log("created y path: " + this.center.y + "-" + container.center.y)
        }else{
            for(let i = Math.floor(this.center.x); i < Math.floor(container.center.x); i++){
                if(map[flooredY-1][i] == 0 || map[flooredY+1][i] == 0){
                    if(map[flooredY-1][i] == 0){
                        map[flooredY-1][i] = 3;
                    }
                    if(map[flooredY+1][i] == 0){
                        map[flooredY+1][i] = 3;
                    }
                    map[flooredY][i] = 1;
                }
                else{
                    map[flooredY][i] = 1;
                }
                
            }
            //console.log("created x path: " + this.center.x + "-" + container.center.x)
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
    constructor(container, map, scene) {
        this.x = container.x + random(0, Math.floor(container.w / 3));
        this.y = container.y + random(0, Math.floor(container.h / 3));
        this.w = container.w - (this.x - container.x);
        this.h = container.h - (this.y - container.y);
        this.w -= random(0, this.w / 3);
        this.h -= random(0, this.w / 3);

        this.center = new Point(
            this.x + (this.w / 2),
            this.y + (this.h / 2)
        )
        this.map = map;

        this.scene = scene;
        this.roomBB;

        this.item;
        this.itemFlag = true;
        this.isItem = false;

        this.enemies = [];


        this.paint();
        //this.generateEnemies();
        this.generateItem();

        this.isCleared = false;
        this.isEnemies = false;

        this.flag = true;
        
        return this;
    }
    paint(){
        for (let i = this.x; i < this.x + this.w; i++) {
            for (let j = this.y; j < this.y + this.h; j++) {
                if(i == this.x || i == this.x+this.w - 1 || j == this.y || j == this.y+this.h - 1){
                    this.map[j][i] = 3;
                }
                else{
                    this.map[j][i] = 1;
                }
                
            }
        }
    }

    generateEnemies(){
        for(let i = this.x + 1; i < this.x + this.w - 1; i++){
            for(let j = this.y + 1; j < this.y + this.h - 1; j++){
                let chance = random(0, 100);
                if(chance > 98){
                    this.map[j][i] = 5;
                    //this.enemies.push(new Point(j, i));
                    let as = random(0, 2);
                    let enemy;
                    if(as == 1){
                        enemy = new TowerEnemy({scene: this.scene, position: new THREE.Vector3(i-1, 1, j)});
                    }
                    else if(as == 2){
                        enemy = new HybridEnemy({scene: this.scene, position: new THREE.Vector3(i, 1, j)});
                    }
                    else{
                        enemy = new SuicideEnemy({scene: this.scene, position: new THREE.Vector3(i, 1, j)});
                    }

                    //let enemy = new TowerEnemy({scene: this.scene, position: new THREE.Vector3(i - 1, 1, j)});
                    
                    
                    this.enemies.push(enemy);
                }
            }
        }
    }

    generateItem(){
        let chance = random(0, 1);
        if(chance == 1){
            this.map[Math.floor(this.center.y)][Math.floor(this.center.x)] = 7;
            //this.item = new Point(Math.floor(this.center.x), Math.floor(this.center.y));
            this.isItem = true;
            console.log("isItem");
        }
    }

    unlockItem(){
        //let item = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({color: 0xFFFF00}));


        this.item = new Item({scene: this.scene, position: new THREE.Vector3(Math.floor(this.center.x), 1.5, Math.floor(this.center.y))});
        //item.position.set(this.item.x, 1.5, this.item.y);
        //this.scene.add(item);

        //this.item = null;
    }
}


var draw_paths = function(tree, map) {
    if (tree.lchild == undefined || tree.rchild == undefined) return;
    tree.lchild.leaf.drawPath(tree.rchild.leaf, map)
    draw_paths(tree.lchild, map)
    draw_paths(tree.rchild, map)
}

var DISCARD_BY_RATIO = true
var H_RATIO          = 0.45
var W_RATIO          = 0.45

export class Map{
    constructor(params) {
        this.params = params;
        this.scene = params.scene;

        this.map = [];

        this.wallsBB = [];

        this.mapSize = params.mapSize;
        this.rooms = [];
        this.roomsBB = [];

        this.enemiesBB = [];

        this.iterations = 3;

        this.init();
        this.createRoomBB();
    }

    init(){
        this.createMap(this.mapSize);
        this.createRooms();
        //this.createWalls();
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
            this.rooms.push(new Room(leafs[i], this.map, this.scene));
            //new Room(leafs[i]).paint(this.map);
        }

        draw_paths(container_tree, this.map);
    }

    createWalls(){
        for(let i = 0; i < this.mapSize; i++){
            for(let j = 0; j < this.mapSize; j++){
                if(i == 0 || j == 0 || i == this.mapSize - 1 || j == this.mapSize - 1){
                    this.map[i][j] = 0;
                }
            }
        }
    }

    createRoomBB(){
        this.rooms.forEach((room) =>{
            let roomBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
            roomBB.setFromCenterAndSize(new THREE.Vector3(room.center.x, 1, room.center.y), new THREE.Vector3(room.w - 1, 3, room.h - 1));
            //this.scene.add(new THREE.Box3Helper(roomBB, 0xFFFF));

            this.roomsBB.push(roomBB);
        })
    }

    createMesh(){

        const textureLoader = new THREE.TextureLoader();

        const wallURL = new URL('../texture/brick.jpg', import.meta.url);
        const wallTexture = textureLoader.load(wallURL.href);

        const floorURL = new URL('../texture/floor.jpg', import.meta.url);
        const floorTexture = textureLoader.load(floorURL.href);
        
        let wallGeometry = new THREE.BoxGeometry(1, 2, 1);
        let wallMaterial = new THREE.MeshStandardMaterial({map: wallTexture});

        let floorMaterial = new THREE.MeshStandardMaterial({map: floorTexture});
        let mapToRender = new THREE.Group();

        for(let i = 0; i < this.mapSize; i++){
            for(let j = 0; j < this.mapSize; j++){
                if(this.map[i][j] == 1){
                    let floor = new THREE.Mesh(wallGeometry, floorMaterial);
                    floor.position.set(j, 0, i);
                    mapToRender.add(floor);
                }
                if(this.map[i][j] == 3){
                    let wall = new THREE.Mesh(wallGeometry, wallMaterial);
                    wall.position.set(j, 2, i);
                    mapToRender.add(wall);

                    const wallBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
                    wallBB.setFromObject(wall);
                    this.wallsBB.push(wallBB);
                    //this.scene.add(new THREE.Box3Helper(wallBB, 0x00FFFF));
                }
                if(this.map[i][j] == 5){
                    let enemy = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({color: 0x00FF00}));
                    enemy.position.set(j, 1, i);
                    mapToRender.add(enemy);

                    let floor = new THREE.Mesh(wallGeometry, floorMaterial);
                    floor.position.set(j, 0, i);
                    mapToRender.add(floor);
                }
                if(this.map[i][j] == 7){
                    let item = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({color: 0xFFFF00}));
                    item.position.set(j, 1, i);
                    //mapToRender.add(item);

                    let floor = new THREE.Mesh(wallGeometry, floorMaterial);
                    floor.position.set(j, 0, i);
                    mapToRender.add(floor);
                }
            }
        }

        this.scene.add(mapToRender);
    }
}
