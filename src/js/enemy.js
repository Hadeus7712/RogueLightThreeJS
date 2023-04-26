import { throws } from 'assert';
import { forEach } from 'neo-async';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';


const meshes = [];

function load(){
    const gltfLoader = new GLTFLoader();

    let modelURLs = [new URL('../models/towerEnemy/Tower_rock_block_low_poly.glb', import.meta.url),
                    new URL('../models/hybridEnemy/cult_ghost.glb', import.meta.url)
                    ]

    let names = ['tower', 'hybrid'];

    let scales = [0.03,  0.015];

    modelURLs.forEach(modelURL =>{
        gltfLoader.load(modelURL.href, (gltf) =>{
            let enemy = gltf.scene;
            enemy.scale.set(scales[modelURLs.indexOf(modelURL)], scales[modelURLs.indexOf(modelURL)], scales[modelURLs.indexOf(modelURL)]);

            //enemy.id = modelURLs.indexOf(modelURL);

            enemy.name = names[modelURLs.indexOf(modelURL)];

            meshes.push(enemy);

        }, function(xhr){
            console.log(( xhr.loaded / xhr.total * 100 ) + '% loaded');
        })
    })
    
}


load();

class Enemy{
    constructor(params) {
        this.params = params;
        this.scene = params.scene;
        this.position = params.position;

        this.name;

        this.hp;
        this.bullets = [];

        this.enemy = new THREE.Mesh();
        this.scale;
        this.enemyBB;

        this.modelURL;

        this.direction = new THREE.Vector3();

        this.clock = new THREE.Clock();

        this.flag = true;

        this.loaded = true;

        this.shootInterval;


    }

    init(){
        meshes.forEach(mesh =>{
            if(mesh.name == this.name) {
                this.enemy = mesh.clone();
                
                this.enemy.position.copy(this.position);
                this.scene.add(this.enemy);
                //console.log(this.enemy);
            }
        })
        //console.log(this.enemy);

    }

    createBB(){
        this.enemyBB =  new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        this.enemyBB.setFromObject(this.enemy);
        //this.scene.add(new THREE.Box3Helper(this.enemyBB, 0x00FF00));
    }


    update(player){
        
    }

    shoot(direction){
        
    }
}

export class TowerEnemy extends Enemy{
    constructor(params) {
        super(params);

        this.hp = 3;
        //this.scale = 0.03;

        this.name = 'tower';

        //this.modelURL = new URL('../models/towerEnemy/Tower_rock_block_low_poly.glb', import.meta.url);
        this.sound = new THREE.Audio(new THREE.AudioListener());
        this.shootSound = new THREE.Audio(new THREE.AudioListener());

        this.init();
        this.loadSound();
        this.createBB();

        setTimeout(() =>{
            this.shootInterval = setInterval(()=>{ 
                this.shoot(this.direction.clone());
            }, Math.floor(Math.random() * (1900 - 1400 + 1) + 1400));
        }, 500);
        
    }

    loadSound(){
        let listener = new THREE.AudioListener();
        this.scene.add(listener);

        this.shootSound = new THREE.Audio(listener);
        let soundURL = new URL('../audio/enemyShoot.ogg', import.meta.url);

        let audioLoader = new THREE.AudioLoader();
        audioLoader.load(soundURL.href, (buffer)=>{
            this.shootSound.setBuffer(buffer);
            this.shootSound.setLoop(false);
        })
    }

    update(player){
        this.direction.subVectors(player.position, this.enemy.position).normalize().divideScalar(20);

        this.bullets.forEach(bullet =>{
            bullet.update();

            if(bullet.dead){
                this.scene.remove(bullet.bullet);
                this.bullets = this.bullets.slice(0, this.bullets.indexOf(bullet)).concat(this.bullets.slice(this.bullets.indexOf(bullet) + 1, this.bullets.length));
            }

            //player.bullets = player.bullets.slice(0, index).concat(player.bullets.slice(index + 1, player.bullets.length));
        })
    }

    shoot(direction){
        this.shootSound.play();
        this.bullets.push(new Bullet({scene: this.scene, enemy: this.enemy, direction}));
    }
}

export class SuicideEnemy extends Enemy{
    constructor(params) {
        super(params);

        this.hp = 3;
        //this.scale = 0.5;

        this.name = 'suicide';
        
        //this.modelURL = new URL('../models/suicideEnemy/test.glb', import.meta.url);

        this.sound = new THREE.Audio(new THREE.AudioListener());

        this.init();
        this.loadSound();
        this.createBB();

        this.sound.play();
    }

    init(){
        const gltfLoader = new GLTFLoader();
        let modelURL = new URL('../models/suicideEnemy/test.glb', import.meta.url);

        gltfLoader.load(modelURL.href, (gltf) =>{
            this.enemy = gltf.scene;
            this.enemy.scale.set(0.5, 0.5, 0.5);
            this.enemy.position.copy(this.position);

            this.scene.add(this.enemy);
        })


    }

    loadSound(){
        let listener = new THREE.AudioListener();
        this.scene.add(listener);

        this.sound = new THREE.Audio(listener);
        let soundURL = new URL('../audio/ghost1.mp3', import.meta.url);

        let audioLoader = new THREE.AudioLoader();
        audioLoader.load(soundURL.href, (buffer)=>{
            this.sound.setBuffer(buffer);
            this.sound.setLoop(true);
            this.sound.setVolume(2);
        })
    }

    createBB(){
        this.enemyBB = new THREE.Box3(new THREE.Vector3(this.enemy.position.x - 0.5, 0, this.enemy.position.z - 0.5), new THREE.Vector3(this.enemy.position.x + 0.5, 2, this.enemy.position.z + 0.5));
        //this.scene.add(new THREE.Box3Helper(this.enemyBB, 0x00FF00));
    }
    
    

    update(player){
        if(this.loaded){
            let target = this.direction.subVectors(player.position, this.enemy.position).normalize().divideScalar(40);

            this.enemy.position.x += target.x;
            this.enemy.position.z += target.z;
    
            this.enemyBB.set(new THREE.Vector3(this.enemy.position.x - 0.5, 0, this.enemy.position.z - 0.5), new THREE.Vector3(this.enemy.position.x + 0.5, 2, this.enemy.position.z + 0.5));

            //console.log(this.enemy.position.angleTo(player.position));
            this.enemy.lookAt(player.position);


            

    }
}

    shoot(){

    }
}

export class HybridEnemy extends Enemy{
    constructor(params) {
        super(params);

        this.hp = 3;
        //this.scale = 0.015;

        //this.modelURL = new URL('../models/hybridEnemy/cult_ghost.glb', import.meta.url);

        this.name = 'hybrid';

        this.sound = new THREE.Audio(new THREE.AudioListener());
        this.shootSound = new THREE.Audio(new THREE.AudioListener());

        this.init();
        this.loadSound();
        this.createBB();

        setTimeout(() =>{
            this.shootInterval = setInterval(()=>{ 
                this.shoot(this.direction.clone());
            }, Math.floor(Math.random() * (1900 - 1400 + 1) + 1400));
        }, 500);

        this.sound.play();
    }

    loadSound(){
        let listener = new THREE.AudioListener();
        this.scene.add(listener);

        this.sound = new THREE.Audio(listener);
        let soundURL = new URL('../audio/ghost2.mp3', import.meta.url);

        let audioLoader = new THREE.AudioLoader();
        audioLoader.load(soundURL.href, (buffer)=>{
            this.sound.setBuffer(buffer);
            this.sound.setLoop(true);
        })

        let shootURL = new URL('../audio/enemyShoot.ogg', import.meta.url);
        this.shootSound = new THREE.Audio(listener);
        audioLoader.load(shootURL.href, (buffer)=>{
            this.shootSound.setBuffer(buffer);
            this.shootSound.setLoop(false);
        })
    }

    createBB(){
        this.enemyBB = new THREE.Box3(new THREE.Vector3(this.enemy.position.x - 0.5, 0, this.enemy.position.z - 0.5), new THREE.Vector3(this.enemy.position.x + 0.5, 2, this.enemy.position.z + 0.5));
        //this.scene.add(new THREE.Box3Helper(this.enemyBB, 0x00FF00));
    }

    update(player){
        if(this.loaded){
            let target = this.direction.subVectors(player.position, this.enemy.position).normalize().divideScalar(40).clone();
            this.direction.subVectors(player.position, this.enemy.position).normalize().divideScalar(20);
            this.enemy.position.x += target.x;
            this.enemy.position.z += target.z;

            this.enemyBB = new THREE.Box3(new THREE.Vector3(this.enemy.position.x - 0.5, 0, this.enemy.position.z - 0.5), new THREE.Vector3(this.enemy.position.x + 0.5, 2, this.enemy.position.z + 0.5));
            
            this.enemy.lookAt(player.position);
        }

        this.bullets.forEach(bullet =>{
            bullet.update();

            if(bullet.dead){
                this.scene.remove(bullet.bullet);
                this.bullets = this.bullets.slice(0, this.bullets.indexOf(bullet)).concat(this.bullets.slice(this.bullets.indexOf(bullet) + 1, this.bullets.length));
            }
        })
    }

    shoot(direction){
        this.shootSound.play();
        this.bullets.push(new Bullet({scene: this.scene, enemy: this.enemy, direction}));
    }
}


// export class TowerEnemy{
//     constructor(params) {
//         this.params = params;
//         this.bullets = [];
//         this.scene = params.scene;
//         this.position = params.position;

//         this.hp = 3;

//         this.enemy = new THREE.Mesh();
//         this.enemyBB;

//         this.init();
//     }

//     init(){        
//         const modelURL = new URL('../models/towerEnemy/Tower_rock_block_low_poly.glb', import.meta.url);
//         const gltfLoader = new GLTFLoader();
//         gltfLoader.load(modelURL.href, (gltf) =>{
//             this.enemy = gltf.scene;
//             this.enemy.scale.set(0.03, 0.03, 0.03);
//             this.enemy.position.copy(this.position);

//             this.enemyBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
//             this.enemyBB.setFromObject(this.enemy);
//             this.scene.add(new THREE.Box3Helper(this.enemyBB, 0xFFFFFF));

//             this.scene.add(this.enemy);

//         })


//     }

//     update(){
//         //1)seek for player
//         //2)shoot if player in target zone
//     }

//     shoot(player){

//         this.bullets.push(new Bullet({scene: this.params.scene}))

//         //1)move to player position
//         //2)delete bullet

//     }
// }

class Bullet{
    constructor(params) {
        this.params = params;

        this.target = params.direction;

        this.bullet = new THREE.Mesh();
        this.bulletBB;

        this.lifeTime = 5;
        this.clock = new THREE.Clock();
        
        this.dead = false;

        this.init();
    }

    init(){
        const geometry = new THREE.SphereGeometry(0.2);
        const material = new THREE.MeshBasicMaterial({color: 0x0000FF});
        this.bullet = new THREE.Mesh(geometry, material);

        this.bullet.position.set(this.params.enemy.position.x, this.params.enemy.position.y + 0.5, this.params.enemy.position.z);

        this.bulletBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        this.bulletBB.setFromObject(this.bullet);

        this.params.scene.add(this.bullet);

        this.clock.start();
        
    }

    update(){
        if(this.clock.getElapsedTime() > this.lifeTime){
            this.dead = true;
        }

        //this.bullet.position.add(this.target);
        this.bullet.position.x += this.target.x;
        this.bullet.position.z += this.target.z;

        this.bulletBB.setFromObject(this.bullet);
        //console.log("enemy bullet update: ");
        
    }
}