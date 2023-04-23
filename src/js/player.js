import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';

let meshes = [];

function load(){
    let modelURLs = [
        new URL('../models/player/player.glb', import.meta.url),
        new URL('../models/player/anime_girl_rigged.glb', import.meta.url)
    ]

    let names = [
        'standart',
        'anime'
    ]

    const gltfLoader = new GLTFLoader();

    modelURLs.forEach(modelURL =>{
        gltfLoader.load(modelURL.href, (gltf)=>{
            let model = gltf.scene;
            model.name = names[modelURLs.indexOf(modelURL)];

            meshes.push(model);
        },
        function(xhr){
            console.log(( xhr.loaded / xhr.total * 100 ) + '% loaded');
        })
    })
}

//load();

export class Player {
    constructor(params){
        this.params_ = params;
        this.scene_ = params.scene;
        
        this.loaded = false;
        this.animLoaded = false;

        this.player = new THREE.Mesh();

        this.modelFirst = new THREE.Mesh();
        this.modelSecond = new THREE.Mesh();

        this.playerBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        //this.scene_.add(new THREE.Box3Helper(this.playerBB, 0xFFFFFF));

        this.bullets = [];

        this.mixer = null;
        this.idleAnimation = null;
        this.moveAnimation = null;

        this.HP = 5;
        this.maxHP = 5;

        this.speed = 0.1;
        this.bulletLifeTime = 0.7;
        this.bulletSpeed = 0.1;


        //this.init();
        this.load();
        //this.loadAnim();

        //this.loadFirstModel();
        //this.loadSecondModel();

        
    }



    // loadFirstModel(){
    //     const modelURL = new URL('../models/player/redPlayer.glb', import.meta.url);
    //     let model;

    //     const gltfLoader = new GLTFLoader();
    //     gltfLoader.load(modelURL.href, (gltf) =>{

    //         model = gltf.scene;

    //         //this.modelFirst = gltf.scene;

    //         this.mixer = new THREE.AnimationMixer(model);
    //         const clips = gltf.animations;
    //         const clip1 = THREE.AnimationClip.findByName(clips, 'idle');
    //         const clip2 = THREE.AnimationClip.findByName(clips, 'running');
    //         this.idleAnimation = this.mixer.clipAction(clip1);
    //         this.moveAnimation = this.mixer.clipAction(clip2);

    //         //this.loaded = true;
    //         this.scene_.remove(this.player);
    //         model.position.copy(this.player.position);
    //         this.player = model;
    //         this.scene_.add(this.player);


    //     }, function (xhr){

    //         console.log(( xhr.loaded / xhr.total * 100 ) + '% loaded');

    //     }, function(error){
    //         console.error(error);
    //     });
    // }

    // loadSecondModel(){
    //     const modelURL = new URL('../models/player/bluePlayer.glb', import.meta.url);
    //     let model;

    //     const gltfLoader = new GLTFLoader();
    //     gltfLoader.load(modelURL.href, (gltf) =>{
    //         model = gltf.scene;

    //         this.modelSecond = gltf.scene;

    //         //this.scene_.add(this.player);

    //         //this.player.position.set(3, 1, 3);


    //         this.mixer = new THREE.AnimationMixer(model);
    //         const clips = gltf.animations;
    //         const clip1 = THREE.AnimationClip.findByName(clips, 'idle');
    //         const clip2 = THREE.AnimationClip.findByName(clips, 'running');
    //         this.idleAnimation = this.mixer.clipAction(clip1);
    //         this.moveAnimation = this.mixer.clipAction(clip2);

    //         //this.loaded = true;

    //         //console.log(clips);

    //     }, function (xhr){

    //         console.log(( xhr.loaded / xhr.total * 100 ) + '% loaded');

    //     }, function(error){
    //         console.error(error);
    //     });
    // }

    load(){
        const modelURL = new URL('../models/player/player.glb', import.meta.url);
        let model;

        const gltfLoader = new GLTFLoader();
        gltfLoader.load(modelURL.href, (gltf) =>{
            model = gltf.scene;

            this.player = gltf.scene;

            //this.scene_.add(this.player);

            this.player.position.set(3, 1, 3);


            this.mixer = new THREE.AnimationMixer(model);
            const clips = gltf.animations;
            const clip1 = THREE.AnimationClip.findByName(clips, 'idle');
            const clip2 = THREE.AnimationClip.findByName(clips, 'running');
            this.idleAnimation = this.mixer.clipAction(clip1);
            this.moveAnimation = this.mixer.clipAction(clip2);

            this.loaded = true;
            //this.loadAnim(gltfLoader, modelURL);

        }, function (xhr){

            console.log(( xhr.loaded / xhr.total * 100 ) + '% loaded');

        }, function(error){
            console.error(error);
        });

        

        // this.player = meshes[1];
        //this.scene_.add(this.player);
        // this.player.position.set(3, 1, 3);
        // this.loaded = true;

    }

    move(moveForward, moveLeft, moveBack, moveRight){
    if(moveForward){
        this.player.position.z -= this.speed;
        this.player.rotation.y = Math.PI;
        //this.moveAnimation.play();
    } 
    if(moveLeft){
        this.player.position.x -= this.speed;
        this.player.rotation.y = -Math.PI / 2;
    } 
    if(moveBack){
        this.player.position.z += this.speed;
        this.player.rotation.y = 0;
    } 
    if(moveRight){
        this.player.position.x += this.speed;
        this.player.rotation.y = Math.PI / 2;
    }
    
    if(moveBack && moveRight){
        this.player.rotation.y = Math.PI * 1/4;
    }

    if(moveBack && moveLeft){
        this.player.rotation.y = -Math.PI * 1/4;
    }

    if(moveForward && moveRight){
        this.player.rotation.y = Math.PI * 3/4;
    }

    if(moveForward && moveLeft){
        this.player.rotation.y = -Math.PI * 3/4;
    }
    }

    shoot(shootDirection, scene, player){
        this.bullets.push(new Bullet({shootDirection, scene: this.scene_, player, lifeTime: this.bulletLifeTime, bulletSpeed: this.bulletSpeed}));
    }

    addBoost(type){
        console.log(type);
        this.changeMode(type);
        switch(type){
            case 'hpBoost':
                this.HP = this.maxHP;
                break;
            case 'maxHPBoost':
                this.maxHP += 1;
                break;
            case 'speedBoost':
                this.speed += 0.005;
                break;
            case 'shootRangeBoost':
                this.bulletLifeTime += 0.5;
                break;
            case 'bulletSpeedBoost':
                this.bulletSpeed += 0.001;
                break;
            default:
                break;
        }
    }

    changeMode(type){
        const modelURLs = [
            new URL('../models/player/redPlayer.glb', import.meta.url),
            new URL('../models/player/bluePlayer.glb', import.meta.url),
            new URL('../models/player/pinkPlayer.glb', import.meta.url)
        ]

        let modelURL;
        let model;

        switch(type){
            case 'hpBoost':
                modelURL = modelURLs[0];
                break;
            case 'speedBoost':
                modelURL = modelURLs[1];
                break;
            case 'bulletSpeedBoost':
                modelURL = modelURLs[2];
                break;
            default:
                modelURL = new URL('../models/player/player.glb', import.meta.url);
                break;
        }

        const gltfLoader = new GLTFLoader();
        gltfLoader.load(modelURL.href, (gltf)=>{
            model = gltf.scene;

            this.mixer = new THREE.AnimationMixer(model);
            const clips = gltf.animations;
            const clip1 = THREE.AnimationClip.findByName(clips, 'idle');
            const clip2 = THREE.AnimationClip.findByName(clips, 'running');
            this.idleAnimation = this.mixer.clipAction(clip1);
            this.moveAnimation = this.mixer.clipAction(clip2);

            this.scene_.remove(this.player);
            model.position.copy(this.player.position);
            this.player = model;
            this.scene_.add(this.player);

        })

    }
}

class Bullet{
    constructor(params) {
        this.params_ = params;
        this.bullet = new THREE.Mesh();
        this.bulletBB = null;
        this.init();

        this.lifeTime = params.lifeTime;

        this.speed = params.bulletSpeed;

        this.clock = new THREE.Clock();
        this.clock.start();

        this.dead = false;
        console.log(this.lifeTime);
    }

    init(){
        const geometry = new THREE.SphereGeometry(0.2);
        const material = new THREE.MeshBasicMaterial({color: 0x0000FF});
        this.bullet = new THREE.Mesh(geometry, material);
        this.bullet.position.set(this.params_.player.position.x, this.params_.player.position.y + 1, this.params_.player.position.z);

        this.bulletBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        this.bulletBB.setFromObject(this.bullet);
        
        //this.params_.scene.add(new THREE.Box3Helper(this.bulletBB, 0xFFFFFF));


        this.params_.scene.add(this.bullet);
    }

    update(){
        this.bulletBB.copy(this.bullet.geometry.boundingBox).applyMatrix4(this.bullet.matrixWorld);
        //this.bulletBB.copy(this.bullet.geometry.boundingBox);

        if(this.clock.getElapsedTime() > this.lifeTime){
            this.dead = true;
        }


        switch(this.params_.shootDirection){
            case 'up':
                this.bullet.position.z -= this.speed;
                break;
            case 'right':
                this.bullet.position.x += this.speed;
                break;
            case 'back':
                this.bullet.position.z += this.speed;
                break;
            case 'left':
                this.bullet.position.x -= this.speed;
                break;
            default:
                break;
        }
    }

    test(){
        console.log('bullet test function');
    }

}


