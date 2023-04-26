import * as THREE from 'three';
import { Player } from './js/player';
import { Map } from './js/map';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();

scene.add(new THREE.AxesHelper(5))

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
    antialias: true
});
renderer.setSize( window.innerWidth, window.innerHeight );

renderer.shadowMap.enabled = true;

document.body.appendChild( renderer.domElement );


let musicStart = true;

function playMusic(){
    const listener = new THREE.AudioListener();
    camera.add(listener);

    const bgMusic = new THREE.Audio(listener);
    const audioLoader = new THREE.AudioLoader();
    const bgMusicURL = new URL('../src/audio/bgMusic.ogg', import.meta.url);

    audioLoader.load(bgMusicURL.href, (buffer) =>{
        bgMusic.setBuffer(buffer);
        bgMusic.setLoop(true);
        bgMusic.setVolume(0.2);
        bgMusic.play();    
    })

}

let hitSound = new THREE.Audio(new THREE.AudioListener());

function loadHitSound(){
    const listener = new THREE.AudioListener();
    camera.add(listener);

    hitSound = new THREE.Audio(listener);
    const audioLoader = new THREE.AudioLoader();
    const hitSoundURL = new URL("../src/audio/hitSound.ogg", import.meta.url);

    audioLoader.load(hitSoundURL.href, (buffer)=>{
        hitSound.setBuffer(buffer);
        hitSound.setLoop(false)
        hitSound.setVolume(0.8);
    })
}

loadHitSound();
    
//const controls = new OrbitControls(camera, renderer.domElement);
//controls.update();

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.9);
scene.add(directionalLight);
directionalLight.position.set(0, 10, 5);
directionalLight.castShadow = true;
const dlightHelper = new THREE.DirectionalLightHelper(directionalLight, 3);
scene.add(dlightHelper);


const player = new Player({scene: scene});


let map = new Map({mapSize: 40, scene: scene});
map.createMesh();

camera.position.z = 5;
camera.position.y = 10;
camera.position.x = 3;
camera.lookAt(new THREE.Vector3(camera.position.x, 0, camera.position.z));

window.focus();

let moveForward = false;
let moveLeft = false;
let moveBack = false; 
let moveRight = false;

let shootDirection = 'up';
let isShooting = false;

window.addEventListener('keydown', (event) => {
    if(musicStart){
        playMusic();
        musicStart = false;
    }
    
    switch(event.code) {
        case 'KeyW':
            moveForward = true;
            shootDirection = 'up';
            break;
        case 'KeyA':
            moveLeft = true;
            shootDirection = 'left';
            break;
        case 'KeyS':
            moveBack = true;
            shootDirection = 'back';
            break;
        case 'KeyD':
            moveRight = true;
            shootDirection = 'right';
            break;
        // case 'KeyE':
        //     isShooting = true;
        //     player.shoot(shootDirection, scene, player.player);
        //     console.log(player.bullets);
        //     break;
        default:
            break;
    }
})


window.addEventListener('keydown', (event) => {
    switch(event.code){
        case 'Space':
            isShooting = true;
            //console.log(clock.getElapsedTime());
            //player.shoot(shootDirection, scene, player.player);
            break;
        default:
            break;
    }
})

window.addEventListener('keyup', (event) => {
    switch(event.code) {
        case 'KeyW':
            moveForward = false;
            break;
        case 'KeyA':
            moveLeft = false;
            break;
        case 'KeyS':
            moveBack = false;
            break;
        case 'KeyD':
            moveRight = false;
            break;
        case 'Space':
            //player.bullets[0].test();
            isShooting = false;
        default:
            break;
    }
})

window.addEventListener('resize', () =>{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
})

function changeCameraPosition(){
    camera.position.x = player.player.position.x;
    camera.position.z = player.player.position.z;
}


function bulletDestroyer(index){
    player.bullets = player.bullets.slice(0, index).concat(player.bullets.slice(index + 1, player.bullets.length));
}


function spawnPlayer(map){
    let room = map.rooms[0];
    room.isEnemies = true;
    player.player.position.set(room.center.x, 1, room.center.y);
}


const hpBar = document.createElement('div');
const statsDiv = document.createElement('div');

const hp = document.createElement('img');

function initUI(){
    hpBar.style = "position: absolute; top: 0px; z-index: 1; width: auto;";

    let hpURL = new URL('../src/texture/heart.png', import.meta.url);
    hp.src = hpURL.href;
    hp.width = 100;
    hp.height = 100;
    hp.position = 'relative';

    for(let i = 0; i < player.HP; i++){
        hpBar.appendChild(hp.cloneNode());
    }
    document.body.appendChild(hpBar);


    statsDiv.style = 'position: absolute; top: 100px; z-index: 1; width: auto; height: auto;';
    let statsStyle = 'color: White; font-size: 25px; font-family: sans-serif';
    let speed = document.createElement('div');
    speed.innerHTML = 'speed: ' + player.speed * 10;
    speed.style = statsStyle;
    let shootRange = document.createElement('div');
    shootRange.innerHTML = 'shootRange: ' + player.bulletLifeTime * 10;
    shootRange.style = statsStyle;
    let bulletSpeed = document.createElement('div');
    bulletSpeed.innerHTML = 'bulletSpeed: ' + player.bulletSpeed * 10;
    bulletSpeed.style = statsStyle;

    statsDiv.appendChild(speed);
    statsDiv.appendChild(shootRange);
    statsDiv.appendChild(bulletSpeed);

    document.body.appendChild(statsDiv);
}

initUI();

function updateUI(){
    let statsStyle = 'color: White; font-size: 25px; font-family: sans-serif';
    let speed = statsDiv.firstChild;
    speed.innerHTML = 'speed: ' + player.speed * 10;
    speed.style = statsStyle;
    let shootRange = statsDiv.children[1];
    shootRange.innerHTML = 'shootRange: ' + player.bulletLifeTime * 10;
    shootRange.style = statsStyle;
    let bulletSpeed = statsDiv.lastChild;
    bulletSpeed.innerHTML = 'bulletSpeed: ' + player.bulletSpeed * 10;
    bulletSpeed.style = statsStyle;
}

const gameOverCanvas = document.createElement('canvas');
const gameOverContext = gameOverCanvas.getContext('2d');

function gameOver(){
    let ratio = window.devicePixelRatio;

    gameOverCanvas.width = window.innerWidth * ratio;
    gameOverCanvas.height = window.innerHeight * ratio;

    gameOverCanvas.id = 'GameOver';
    gameOverCanvas.style = 'width: ' + gameOverCanvas.width + 'px; height: '+gameOverCanvas.height +'px; position: absolute; z-index: 1; top: 0px;';
    gameOverContext.globalAlpha = 0.4;
    gameOverContext.fillRect(0, 0, gameOverCanvas.width, gameOverCanvas.height);
    gameOverContext.font = '150px Impact';
    gameOverContext.globalAlpha = 1;
    gameOverContext.fillStyle = 'White';
    gameOverContext.textAlign = 'center';
    gameOverContext.fillText("GAME OVER", gameOverCanvas.width / 2, gameOverCanvas.height / 2);
    gameOverContext.scale(ratio, ratio);

    document.body.appendChild(gameOverCanvas);
}



let clock = new THREE.Clock();
let roomIndex = 0;
let room;
let clearedRooms = 0;

let lastShotTime = 0;
let shotDelay = 0.5;

let lastHitTime = 0;
let hitDelay = 1;




let id;

function animate() {
	id = requestAnimationFrame( animate );
    changeCameraPosition();

    map.roomsBB.forEach(roomBB =>{
        if(player.playerBB.intersectsBox(roomBB)){
            roomIndex = map.rooms.indexOf(map.rooms[map.roomsBB.indexOf(roomBB)]);
            room = map.rooms[roomIndex];
        }
        if(player.playerBB.intersectsBox(roomBB) && !room.isEnemies){
            room.generateEnemies();
            room.isEnemies = true;
        }
    })


    if(player.loaded){
        spawnPlayer(map);
        scene.add(player.player);
        //layer.loadAnim();
        player.loaded = false;
    }

    //controls.update();

    if(player.mixer){
        player.mixer.update(clock.getDelta());
        if(moveForward || moveBack || moveLeft || moveRight){
            //player.idleAnimation.stop();
            player.moveAnimation.play();
        } else {
            player.idleAnimation.play();
            player.moveAnimation.stop();
        }
    }
    
    player.bullets.forEach(bullet =>{
        bullet.update();
        if(bullet.dead){
            let index = player.bullets.indexOf(bullet);
            scene.remove(bullet.bullet);
            bulletDestroyer(index);
        }

        if(roomIndex){
            for(let i = 0; i < map.rooms[roomIndex].enemies.length; i++){
                if(bullet.bulletBB.intersectsBox(map.rooms[roomIndex].enemies[i].enemyBB)){
                    let index = player.bullets.indexOf(bullet);
                    scene.remove(bullet.bullet);
                    bulletDestroyer(index);
                    
                    map.rooms[roomIndex].enemies[i].hp--;
                }
            }
        }
        //console.log("Inside forEach: " + player.bullets.length);

        // for(let i = 0; i < map.wallBB.length; i++){
        //     if(bullet.bulletBB.intersectsBox(map.wallBB[i])){
        //         console.log("in walls");
        //         let index = player.bullets.indexOf(bullet);
        //         scene.remove(bullet.bullet);
        //         bulletDestroyer(index);
        //         break;
        //     }
        // }
    });
    
    if(room){
        for(let i = 0; i < map.rooms[roomIndex].enemies.length; i++){
            if(map.rooms[roomIndex].enemies[i].hp <= 0){
                scene.remove(map.rooms[roomIndex].enemies[i].enemy);
                map.rooms[roomIndex].enemies[i].sound.stop();

                map.rooms[roomIndex].enemies[i].bullets.forEach(bullet =>{
                    scene.remove(bullet.bullet);
                })

                clearInterval(map.rooms[roomIndex].enemies[i].shootInterval);

                map.rooms[roomIndex].enemies = map.rooms[roomIndex].enemies.slice(0, i).concat(map.rooms[roomIndex].enemies.slice(i + 1, map.rooms[roomIndex].enemies.length));

                //console.log(typeof(map.rooms[roomIndex].enemies[i]));
            }
        }

        

        if(map.rooms[roomIndex].enemies.length <= 0){
            map.rooms[roomIndex].isCleared = true;
        }

        if(room.isCleared && room.itemFlag && room.isItem){
            room.unlockItem();
            room.itemFlag = false;
            console.log("item spawned");
            
        }

        if(room.isCleared && room.flag){
            clearedRooms += 1;
            room.flag = false;
        }

        if(room.item){
            //console.log(typeof(room.item));
            room.item.update();
            if(player.playerBB.intersectsBox(room.item.meshBB)){
                scene.remove(room.item.mesh);
                
                player.addBoost(room.item.boost);

                room.item = null;
                
                let count = hpBar.childElementCount;

                for(let i = 0; i < count; i++){
                    hpBar.removeChild(hpBar.lastChild);
                }

                for(let i = 0; i < player.HP; i++){
                    hpBar.appendChild(hp.cloneNode());
                }

                updateUI();

            }
        }
    }
    
    map.wallsBB.forEach(wall =>{
        if(player.playerBB.intersectsBox(wall)){
            if(moveBack){
                moveBack = false;
                player.player.position.z -= 0.3;
            }
            if(moveForward){
                moveForward = false;
                player.player.position.z += 0.3;
            }
            if(moveLeft){
                moveLeft = false;
                player.player.position.x += 0.3;
            }
            if(moveRight){
                moveRight = false;
                player.player.position.x -= 0.3;
            }
        }
    })

    player.move(moveForward, moveLeft, moveBack, moveRight);
    player.playerBB.set(new THREE.Vector3(player.player.position.x - 0.3, 1 , player.player.position.z - 0.3), new THREE.Vector3(player.player.position.x + 0.3 , 2.7, player.player.position.z + 0.3));


    if(isShooting){
        let time = clock.getElapsedTime();
        if(time - lastShotTime > shotDelay){
            player.shoot(shootDirection, scene, player.player);
            lastShotTime = time;
        }
        
    }


    if(room){
        if(room.enemies.length > 0){    
            room.enemies.forEach(enemy =>{
                enemy.update(player.player);

                enemy.bullets.forEach(bullet =>{
                    if(bullet.bulletBB.intersectsBox(player.playerBB)){
                        bullet.dead = true;
                        scene.remove(bullet.bullet);
                        player.HP -= 1;
                        hpBar.removeChild(hpBar.lastChild);
                        console.log("hit player");

                        hitSound.play();

                    }
                })

                let time = clock.getElapsedTime();
                if(time - lastHitTime > hitDelay){
                    if(enemy.enemyBB.intersectsBox(player.playerBB)){
                        player.HP -= 1;
                        console.log('player hit')
                        hpBar.removeChild(hpBar.lastChild);
                        hitSound.play();
                    }
                    lastHitTime = time;
                }
            })


        }

    
        // if(clearedRooms >= map.rooms.length / 2){
        //     console.log(clearedRooms);
        //     console.log("FINISHED");
        // }
    }
    
    if(player.HP <= 0){
        cancelAnimationFrame(id);
        gameOver();
    }

	renderer.render( scene, camera )
}



setTimeout(animate(), 700);

//animate();




