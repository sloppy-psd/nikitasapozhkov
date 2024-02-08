// import './css/style.css'
// import * as THREE from 'three'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
// import * as dat from 'lil-gui'

// import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'

import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r119/build/three.module.js';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r119/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r119/examples/jsm/loaders/GLTFLoader.js';
function main() {


/**
 * TEXTURE
 */
 const cubeTextureLoader = new THREE.CubeTextureLoader();



 
/**
 * Base
 */
// Debug
// const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('#c');

// Scene
const scene = new THREE.Scene();


/**
 * UPDATES ALL MATERIALS
 */
const updateAllMaterials = () =>
{
    scene.traverse((child) =>
    {
        if ( child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
        {
          child.material.envMap = environmentMap;
          child.material.envMapIntensity = 7;

        }
console.log(child);
    });
}



/**
 * ENVIRONMENT MAP
 */
const environmentMap = cubeTextureLoader.load(

    [
        '../static/textures/environmentMaps/2/px.png',
        '../static/textures/environmentMaps/2/nx.png',
        '../static/textures/environmentMaps/2/py.png',
        '../static/textures/environmentMaps/2/ny.png',
        '../static/textures/environmentMaps/2/pz.png',
        '../static/textures/environmentMaps/2/nz.png',


    ]
);
// scene.background = environmentMap;

  // scene.background = new THREE.Color(0x000000);

  const near = 2;
  const far = 6;
  // const color = '#ededed';
    // const color = '#00ff00';
      const color = '#F5F5F5';

  scene.fog = new THREE.Fog(color, near, far);
  scene.background = new THREE.Color(color);

// scene.background = new THREE.Color('black');

/**
 * ENVIRONMENT MAP
 */


/**
 * Models
 */


const gltfLoader = new GLTFLoader();
gltfLoader.load(
    '../static/models/Tag/Traffic-tex2048.glb',
    (gltf) => {
 
    gltf.scene.scale.set(0.009,0.009,0.009);
    gltf.scene.rotation.y = Math.PI * 0.25;
    gltf.scene.position.y = -0.45;

    scene.add(gltf.scene);

    updateAllMaterials();

    }
);



/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
// scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);

directionalLight.position.set(0, 1, 0);

scene.add(directionalLight);


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(2, 1, 2);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0.75, 0);
controls.enableDamping = true;
controls.enableZoom = false;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.physicallyCorrectLights = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;



    // Update controls
    controls.update();
    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
}

tick();

}

main();