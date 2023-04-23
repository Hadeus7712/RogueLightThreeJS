import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';

let meshes = [];

function load(){

    const gltfLoader = new GLTFLoader();

    let modelURLs = [
        new URL('../models/potions/redBottle.glb', import.meta.url),
        new URL('../models/potions/blueBottle.glb', import.meta.url),
        new URL('../models/potions/greenBottle.glb', import.meta.url),
        new URL('../models/potions/yellowBottle.glb', import.meta.url),
        new URL('../models/potions/purpleBottle.glb', import.meta.url)
    ]

    let names = ['red', 'green', 'blue', 'yellow', 'purple'];

    modelURLs.forEach((modelURL) =>{
        gltfLoader.load(modelURL.href, (gltf) =>{
            let mesh = gltf.scene;
            //mesh.scale.set(0.5, 0.5, 0.5);
            mesh.name = names[modelURLs.indexOf(modelURL)];
            meshes.push(mesh);
        })
    })

}

load();

export class Item{
    constructor(params) {
        this.params = params;
        this.scene = params.scene;
        this.position = params.position;

        this.mesh = new THREE.Mesh();
        this.meshBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());


        this.boost;

        this.init();
    }

    init(){
        let chance = Math.floor(Math.random() * 5)

        this.mesh = meshes[chance].clone();
        this.mesh.position.copy(this.position);

        this.meshBB.setFromObject(this.mesh);
        this.scene.add(new THREE.Box3Helper(this.meshBB, 0xff0000));

        this.scene.add(this.mesh);

        switch(chance){
            case 0:
                this.boost = "hpBoost";
                break;
            case 1:
                this.boost = "speedBoost";
                break;
            case 2:
                this.boost = "maxHPBoost";
                break;
            case 3:
                this.boost = "shootRangeBoost";
                break;
            case 4:
                this.boost = "bulletSpeedBoost";
                break;
            default:
                break;
        }
    }

    update(){
        this.mesh.rotation.y += 0.1;
        console.log("item update");
    }
}