import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { USDZLoader } from 'three/addons/loaders/USDZLoader.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

import exhaustVert from './shaders/exhaustFlame.vert'
import exhaustHeatFrag from './shaders/exhaustFlame.frag'

const MODEL_USDZ = ''
/** Корень сайта (GitHub Pages). При деплое в подпапку — поменять префикс. */
const MODEL_GLB = '/static/models/fiat_500_x_outlaw_1k.glb'

const IS_MOBILE =
  window.matchMedia('(pointer: coarse)').matches ||
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

const FIXED_CAMERA_POSITION = new THREE.Vector3(-0.65, 1.55, -6.15)
const FIXED_ORBIT_TARGET = new THREE.Vector3(0, 0.42, 0.12)

const MOBILE_CAMERA_POSITION = new THREE.Vector3(-4.2, 2.4, -5.4)

const DRIVE_RAMPS = { stop: 3.75, start: 2.85 }

const ARCADE = {
  maxSpeed: 6.5,
  maxReverse: 3.2,
  accel: 16,
  brake: 26,
  drag: 0.42,
  rollingFriction: 1.75,
  throttleResponse: 5.8,
  steerResponse: 8.5,
  steerYawScale: 1.85,
  steerYawAtStop: 0.62,
  coastBrakeWhenPaused: 14,
  screenWrapNdcEps: 0.002,
  screenWrapSpanFactor: 1,
}

const SUSPENSION = {
  pitchAccelScale: 0.0045,
  pitchThrottleScale: 0.012,
  pitchMax: 0.045,
  pitchStiffness: 34,
  pitchDamping: 9.5,

  rollSteerScale: 0.032,
  rollDriftScale: 0.038,
  rollShakeScale: 0.18,
}

const WHEEL_STEER = {
  maxAngle: 0.42,
  response: 9.5,
  steerAxis: 'z',
  invert: true,

  leftMultiplier: 1,
  rightMultiplier: -1,
}

const WORLD_WRAP = {
  depthBack: 17,
  depthFront: 9.5,

  sideOffset: 38.5,
  bottomOffset: 10.5,
  topOffset: 5.5,

  sideRespawnDepthMin: -1.5,
  sideRespawnDepthMax: 3.5,

  bottomRespawnSideMin: -4.2,
  bottomRespawnSideMax: 4.2,

  topRespawnSideMin: -4.2,
  topRespawnSideMax: 4.2,

  speedDamping: 0.58,
  minRespawnSpeed: 3.2,
}

const CAR_TARGET_MAX_SIZE = 2.35

function sizeAndGroundModel(object3d, maxSize = CAR_TARGET_MAX_SIZE) {
  object3d.updateMatrixWorld(true)

  const box = new THREE.Box3().setFromObject(object3d)

  if (box.isEmpty()) return

  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z)

  if (maxDim < 1e-9) return

  const s = maxSize / maxDim
  object3d.scale.setScalar(s)

  object3d.updateMatrixWorld(true)

  const b2 = new THREE.Box3().setFromObject(object3d)
  const cx = (b2.min.x + b2.max.x) / 2
  const cz = (b2.min.z + b2.max.z) / 2

  object3d.position.x -= cx
  object3d.position.z -= cz
  object3d.position.y -= b2.min.y
}

function createExhaustFlames() {
  const group = new THREE.Group()
  group.name = 'exhaust_flames'

  const uniforms = {
    uTime: { value: 0 },
    uThrottle: { value: 0 },
  }

  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: exhaustVert,
    fragmentShader: exhaustHeatFrag,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  })

  const coneH = 0.38
  const coneGeo = new THREE.ConeGeometry(0.052, coneH, 10, 1, true)

  for (const sx of [-0.24, 0.24]) {
    const m = new THREE.Mesh(coneGeo, mat)
    m.rotation.x = -Math.PI / 2
    m.position.set(sx, 0.26, 0.9)
    m.renderOrder = 3
    group.add(m)
  }

  return { group, uniforms }
}

function createPlaceholderCar() {
  const group = new THREE.Group()

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x8b0000,
    metalness: 0.35,
    roughness: 0.45,
  })

  const wheelMat = new THREE.MeshStandardMaterial({
    color: 0x111111,
    metalness: 0.2,
    roughness: 0.85,
  })

  const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.55, 2.2), bodyMat)
  body.position.y = 0.35
  body.castShadow = true
  group.add(body)

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.4, 1.0), bodyMat)
  cabin.position.set(0, 0.75, -0.15)
  cabin.castShadow = true
  group.add(cabin)

  const wheelGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.16, 24)

  const positions = [
    [0.55, 0.22, 0.65],
    [-0.55, 0.22, 0.65],
    [0.55, 0.22, -0.65],
    [-0.55, 0.22, -0.65],
  ]

  for (const [x, y, z] of positions) {
    const w = new THREE.Mesh(wheelGeo, wheelMat)
    w.rotation.z = Math.PI / 2
    w.position.set(x, y, z)
    w.castShadow = true
    w.name =
      z > 0
        ? `wheel_front_${x > 0 ? 'r' : 'l'}`
        : `wheel_rear_${x > 0 ? 'r' : 'l'}`
    group.add(w)
  }

  return group
}

function isRoofSpareWheelMeshName(nameLower) {
  return (
    nameLower.includes('wheeltop') ||
    nameLower.includes('wheel_top') ||
    nameLower.includes('roofwheel') ||
    (nameLower.includes('roof') &&
      (nameLower.includes('wheel') || nameLower.includes('tyre')))
  )
}

function findAllWheels(root) {
  const wheels = []

  root.traverse((o) => {
    if (!o.isMesh) return

    const n = o.name.toLowerCase()

    if (isRoofSpareWheelMeshName(n)) return

    if (
      n.includes('wheel') ||
      n.includes('tire') ||
      n.includes('reifen') ||
      n.includes('tyre')
    ) {
      wheels.push(o)
    }
  })

  return wheels
}

function isFrontWheelName(nameLower) {
  return (
    nameLower.includes('front') ||
    nameLower.includes('_f') ||
    nameLower.includes('.f') ||
    nameLower.includes('fl') ||
    nameLower.includes('fr') ||
    nameLower.includes('vorne')
  )
}

function getWheelSide(wheel, carRoot) {
  const n = wheel.name.toLowerCase()

  if (
    n.includes('left') ||
    n.includes('_l') ||
    n.includes('.l') ||
    n.endsWith('l')
  ) {
    return 'left'
  }

  if (
    n.includes('right') ||
    n.includes('_r') ||
    n.includes('.r') ||
    n.endsWith('r')
  ) {
    return 'right'
  }

  const wheelPos = new THREE.Vector3()
  const carPos = new THREE.Vector3()

  wheel.getWorldPosition(wheelPos)
  carRoot.getWorldPosition(carPos)

  return wheelPos.x < carPos.x ? 'left' : 'right'
}

function splitWheelsByAxle(wheels) {
  const front = []
  const rear = []

  for (const w of wheels) {
    const n = w.name.toLowerCase()

    if (isFrontWheelName(n)) {
      front.push(w)
    } else {
      rear.push(w)
    }
  }

  if (front.length === 0 && wheels.length > 0) {
    const worldPos = new THREE.Vector3()

    const items = wheels.map((w) => {
      w.getWorldPosition(worldPos)

      return {
        wheel: w,
        z: worldPos.z,
      }
    })

    items.sort((a, b) => b.z - a.z)

    const count = Math.min(2, items.length)

    front.push(...items.slice(0, count).map((item) => item.wheel))
    rear.length = 0
    rear.push(...items.slice(count).map((item) => item.wheel))
  }

  return { front, rear }
}

function collectCarPickMeshes(carRoot) {
  const list = []

  carRoot.traverse((o) => {
    if (!o.isMesh) return

    let p = o.parent

    while (p) {
      if (p.name === 'exhaust_flames') return
      p = p.parent
    }

    list.push(o)
  })

  return list
}

function forceDoubleSideMaterials(root) {
  root.traverse((o) => {
    if (!o.isMesh) return

    const mats = Array.isArray(o.material) ? o.material : [o.material]

    for (const mat of mats) {
      if (mat && typeof mat.side === 'number') {
        mat.side = THREE.DoubleSide
        mat.needsUpdate = true
      }
    }
  })
}

export function initFiatScene() {
  const canvas = document.querySelector('#c')

  if (!canvas) {
    console.error('[Fiat] canvas #c не найден')
    return
  }

  const container = canvas.parentElement || canvas

  const WHITE = 0xffffff

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(WHITE)

  if (IS_MOBILE) {
    scene.fog = new THREE.Fog(WHITE, 18, 70)
  } else {
    scene.fog = new THREE.Fog(WHITE, 8, 34)
  }

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200)

  if (IS_MOBILE) {
    camera.position.copy(MOBILE_CAMERA_POSITION)
  } else {
    camera.position.copy(FIXED_CAMERA_POSITION)
  }

  camera.lookAt(FIXED_ORBIT_TARGET)

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
  })

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, IS_MOBILE ? 1.5 : 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.6

  const env = new RoomEnvironment()
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(env).texture
  pmrem.dispose()
  env.dispose()

  const ambient = new THREE.AmbientLight(0xffffff, 0.62)
  scene.add(ambient)

  const sun = new THREE.DirectionalLight(0xffffff, 2.85)
  sun.position.set(-4.2, 10.5, -2.8)
  sun.castShadow = true
  sun.shadow.mapSize.set(IS_MOBILE ? 1024 : 2048, IS_MOBILE ? 1024 : 2048)
  sun.shadow.camera.near = 0.5
  sun.shadow.camera.far = 90
  sun.shadow.camera.left = -40
  sun.shadow.camera.right = 40
  sun.shadow.camera.top = 40
  sun.shadow.camera.bottom = -40
  sun.shadow.bias = -0.0002
  sun.shadow.normalBias = 0.03
  scene.add(sun)

  const fill = new THREE.DirectionalLight(0xffffff, 0.55)
  fill.position.set(6.5, 5.5, 2)
  scene.add(fill)

  const hemi = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.22)
  scene.add(hemi)

  const controls = new OrbitControls(camera, canvas)
  controls.target.copy(FIXED_ORBIT_TARGET)
  controls.enablePan = false

  if (IS_MOBILE) {
    controls.enabled = true
    controls.enableRotate = true
    controls.enableZoom = true
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.minDistance = 4.2
    controls.maxDistance = 10
    controls.minPolarAngle = Math.PI * 0.18
    controls.maxPolarAngle = Math.PI * 0.5
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.45
  } else {
    controls.enabled = false
    controls.enableRotate = false
    controls.enableZoom = false
  }

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshStandardMaterial({
      color: WHITE,
      roughness: 1,
      metalness: 0,
      envMapIntensity: 0,
    }),
  )

  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.9
  ground.receiveShadow = true
  scene.add(ground)

  const carRoot = new THREE.Group()
  carRoot.position.set(0, -0.9, 0)
  scene.add(carRoot)

  const wrapBbox = new THREE.Box3()
  const wrapCorner = new THREE.Vector3()
  const wrapBboxCenter = new THREE.Vector3()
  const wrapFwd = new THREE.Vector3()
  const wrapRight = new THREE.Vector3()
  const wrapGroundFwd = new THREE.Vector3()
  const wrapGroundRight = new THREE.Vector3()
  const wrapOrigin = new THREE.Vector3()
  const worldUp = new THREE.Vector3(0, 1, 0)

  let carYaw = Math.PI
  let speed = 0
  let prevSpeed = 0
  let arcadeThrottleSm = 0
  let arcadeSteerSm = 0

  let suspensionPitch = 0
  let suspensionPitchVel = 0
  let frontWheelSteer = 0

  const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
  }

  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  const carPickMeshes = []

  let allWheels = []
  let frontWheels = []
  let rearWheels = []
  let frontWheelItems = []

  let wheelAngle = 0
  let wheelSpinRate = 0

  const wheelBaseRotations = new Map()
  const wheelSteerPivotBaseRotations = new Map()

  let driveTarget = 1
  let driveBlend = 1
  let prevDriveBlend = 1
  let exhaustSmoothed = 1

  let pointerDown = null

  function cacheWheelBaseRotations(wheels) {
    wheelBaseRotations.clear()

    for (const w of wheels) {
      wheelBaseRotations.set(w.uuid, {
        x: w.rotation.x,
        y: w.rotation.y,
        z: w.rotation.z,
      })
    }
  }

  function cacheWheelSteerPivotBaseRotations(items) {
    wheelSteerPivotBaseRotations.clear()

    for (const item of items) {
      if (!item.pivot) continue

      wheelSteerPivotBaseRotations.set(item.pivot.uuid, {
        x: item.pivot.rotation.x,
        y: item.pivot.rotation.y,
        z: item.pivot.rotation.z,
      })
    }
  }

  function createFrontWheelSteerPivot(wheel) {
    const parent = wheel.parent

    if (!parent) {
      return null
    }

    carRoot.updateMatrixWorld(true)
    parent.updateMatrixWorld(true)
    wheel.updateMatrixWorld(true)

    const box = new THREE.Box3().setFromObject(wheel)
    const centerWorld = new THREE.Vector3()

    if (box.isEmpty()) {
      wheel.getWorldPosition(centerWorld)
    } else {
      box.getCenter(centerWorld)
    }

    const centerLocal = parent.worldToLocal(centerWorld.clone())

    const pivot = new THREE.Group()
    pivot.name = `steer_pivot_${wheel.name}`
    pivot.position.copy(centerLocal)

    parent.add(pivot)
    pivot.attach(wheel)

    return pivot
  }

  function rebuildWheelGroups() {
    const split = splitWheelsByAxle(allWheels)

    frontWheels = split.front
    rearWheels = split.rear

    frontWheelItems = frontWheels.map((wheel) => {
      const side = getWheelSide(wheel, carRoot)
      const pivot = createFrontWheelSteerPivot(wheel)

      return {
        wheel,
        pivot,
        side,
      }
    })

    cacheWheelBaseRotations(allWheels)
    cacheWheelSteerPivotBaseRotations(frontWheelItems)

    if (allWheels.length === 0) {
      console.info('[scene] Колёса по имени не найдены — вращение колёс отключено.')
    }

    if (allWheels.length > 0 && frontWheelItems.length === 0) {
      console.info('[scene] Передние колёса не определены — steer колёс отключён.')
    }

    if (frontWheelItems.length > 0) {
      console.info(
        '[scene] Передние колёса:',
        frontWheelItems
          .map((item) => `${item.wheel.name}:${item.side}`)
          .join(', '),
      )
    }
  }

  function attachCarModel(model) {
    model.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true
      }
    })

    forceDoubleSideMaterials(model)
    sizeAndGroundModel(model)

    carRoot.add(model)

    allWheels = findAllWheels(carRoot)
    rebuildWheelGroups()

    carPickMeshes.length = 0
    carPickMeshes.push(...collectCarPickMeshes(carRoot))
  }

  function loadPlaceholderAfterFailure(reasonUrl) {
    console.warn(`[scene] Не удалось загрузить ${reasonUrl} — плейсхолдер.`)

    const ph = createPlaceholderCar()

    forceDoubleSideMaterials(ph)
    sizeAndGroundModel(ph)

    carRoot.add(ph)

    allWheels = findAllWheels(carRoot)
    rebuildWheelGroups()

    carPickMeshes.length = 0
    carPickMeshes.push(...collectCarPickMeshes(carRoot))
  }

  function loadGlb() {
    const gltfLoader = new GLTFLoader()

    gltfLoader.load(
      MODEL_GLB,
      (gltf) => {
        attachCarModel(gltf.scene)
      },
      undefined,
      () => {
        loadPlaceholderAfterFailure(MODEL_GLB)
      },
    )
  }

  if (MODEL_USDZ) {
    const usdzLoader = new USDZLoader()

    usdzLoader.load(
      MODEL_USDZ,
      (group) => {
        attachCarModel(group)
      },
      undefined,
      (err) => {
        console.warn(
          '[scene] USDZ недоступен или USDC внутри архива:',
          err?.message || err,
          '→ пробую GLB',
        )

        loadGlb()
      },
    )
  } else {
    loadGlb()
  }

  const exhaust = createExhaustFlames()
  carRoot.add(exhaust.group)

  const clock = new THREE.Clock()

  function resize() {
    const w = container.clientWidth || window.innerWidth
    const h = container.clientHeight || window.innerHeight

    camera.aspect = w / h
    camera.updateProjectionMatrix()

    renderer.setSize(w, h, false)
  }

  resize()
  window.addEventListener('resize', resize)

  if (!IS_MOBILE) {
    window.addEventListener(
      'keydown',
      (e) => {
        if (e.code in keys) {
          keys[e.code] = true
          e.preventDefault()
        }
      },
      { passive: false },
    )

    window.addEventListener('keyup', (e) => {
      if (e.code in keys) {
        keys[e.code] = false
      }
    })

    renderer.domElement.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return
      pointerDown = { x: e.clientX, y: e.clientY }
    })

    renderer.domElement.addEventListener('pointerup', (e) => {
      if (e.button !== 0 || pointerDown === null) return

      const dist = Math.hypot(e.clientX - pointerDown.x, e.clientY - pointerDown.y)

      pointerDown = null

      if (dist > 14 || carPickMeshes.length === 0) return

      const rect = renderer.domElement.getBoundingClientRect()

      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(pointer, camera)

      const hits = raycaster.intersectObjects(carPickMeshes, false)

      if (hits.length === 0) return

      driveTarget = driveTarget > 0.5 ? 0 : 1
    })
  }

  function getCameraRelativeAxes() {
    camera.getWorldDirection(wrapGroundFwd)
    wrapGroundFwd.y = 0

    if (wrapGroundFwd.lengthSq() < 1e-8) {
      wrapGroundFwd.set(0, 0, 1)
    } else {
      wrapGroundFwd.normalize()
    }

    wrapGroundRight.crossVectors(wrapGroundFwd, worldUp)

    if (wrapGroundRight.lengthSq() < 1e-8) {
      wrapGroundRight.set(1, 0, 0)
    } else {
      wrapGroundRight.normalize()
    }

    wrapOrigin.copy(FIXED_ORBIT_TARGET)
    wrapOrigin.y = carRoot.position.y
  }

  function getCameraRelativePositionDepthAndSide() {
    const relX = carRoot.position.x - wrapOrigin.x
    const relZ = carRoot.position.z - wrapOrigin.z

    const side = relX * wrapGroundRight.x + relZ * wrapGroundRight.z
    const depth = relX * wrapGroundFwd.x + relZ * wrapGroundFwd.z

    return { side, depth }
  }

  function setCarYawFromDirection(dir) {
    carYaw = Math.atan2(dir.x, dir.z)
  }

  function setRespawnSpeed() {
    speed = Math.max(
      Math.abs(speed) * WORLD_WRAP.speedDamping,
      WORLD_WRAP.minRespawnSpeed,
    )
  }

  function respawnFromLeft() {
    const respawnDepth = THREE.MathUtils.lerp(
      WORLD_WRAP.sideRespawnDepthMin,
      WORLD_WRAP.sideRespawnDepthMax,
      Math.random(),
    )

    const newPos = wrapOrigin
      .clone()
      .addScaledVector(wrapGroundRight, -WORLD_WRAP.sideOffset)
      .addScaledVector(wrapGroundFwd, respawnDepth)

    carRoot.position.x = newPos.x
    carRoot.position.z = newPos.z

    setCarYawFromDirection(wrapGroundRight)
    setRespawnSpeed()
  }

  function respawnFromRight() {
    const respawnDepth = THREE.MathUtils.lerp(
      WORLD_WRAP.sideRespawnDepthMin,
      WORLD_WRAP.sideRespawnDepthMax,
      Math.random(),
    )

    const newPos = wrapOrigin
      .clone()
      .addScaledVector(wrapGroundRight, WORLD_WRAP.sideOffset)
      .addScaledVector(wrapGroundFwd, respawnDepth)

    carRoot.position.x = newPos.x
    carRoot.position.z = newPos.z

    setCarYawFromDirection(wrapGroundRight.clone().multiplyScalar(-1))
    setRespawnSpeed()
  }

  function respawnFromBottom() {
    const side = THREE.MathUtils.lerp(
      WORLD_WRAP.bottomRespawnSideMin,
      WORLD_WRAP.bottomRespawnSideMax,
      Math.random(),
    )

    const newPos = wrapOrigin
      .clone()
      .addScaledVector(wrapGroundRight, side)
      .addScaledVector(
        wrapGroundFwd,
        -WORLD_WRAP.depthFront - WORLD_WRAP.bottomOffset,
      )

    carRoot.position.x = newPos.x
    carRoot.position.z = newPos.z

    setCarYawFromDirection(wrapGroundFwd)
    setRespawnSpeed()
  }

  function respawnFromTopFog() {
    const side = THREE.MathUtils.lerp(
      WORLD_WRAP.topRespawnSideMin,
      WORLD_WRAP.topRespawnSideMax,
      Math.random(),
    )

    const newPos = wrapOrigin
      .clone()
      .addScaledVector(wrapGroundRight, side)
      .addScaledVector(wrapGroundFwd, WORLD_WRAP.depthBack + WORLD_WRAP.topOffset)

    carRoot.position.x = newPos.x
    carRoot.position.z = newPos.z

    setCarYawFromDirection(wrapGroundFwd.clone().multiplyScalar(-1))
    setRespawnSpeed()
  }

  function chooseRandomRespawn(modes) {
    const mode = modes[Math.floor(Math.random() * modes.length)]

    if (mode === 'left') {
      respawnFromLeft()
      return
    }

    if (mode === 'right') {
      respawnFromRight()
      return
    }

    if (mode === 'bottom') {
      respawnFromBottom()
      return
    }

    if (mode === 'topFog') {
      respawnFromTopFog()
    }
  }

  function wrapCarHorizontalIfOffScreen() {
    const eps = ARCADE.screenWrapNdcEps
    const spanF = ARCADE.screenWrapSpanFactor

    for (let step = 0; step < 8; step++) {
      carRoot.updateMatrixWorld(true)
      wrapBbox.setFromObject(carRoot)

      if (wrapBbox.isEmpty()) return

      let minNdcX = Infinity
      let maxNdcX = -Infinity

      const bmin = wrapBbox.min
      const bmax = wrapBbox.max

      for (let ix = 0; ix < 2; ix++) {
        const px = ix === 0 ? bmin.x : bmax.x

        for (let iy = 0; iy < 2; iy++) {
          const py = iy === 0 ? bmin.y : bmax.y

          for (let iz = 0; iz < 2; iz++) {
            const pz = iz === 0 ? bmin.z : bmax.z

            wrapCorner.set(px, py, pz).project(camera)

            minNdcX = Math.min(minNdcX, wrapCorner.x)
            maxNdcX = Math.max(maxNdcX, wrapCorner.x)
          }
        }
      }

      const fullyLeft = maxNdcX < -1 - eps
      const fullyRight = minNdcX > 1 + eps

      if (!fullyLeft && !fullyRight) return

      wrapBbox.getCenter(wrapBboxCenter)

      const dist = Math.max(camera.position.distanceTo(wrapBboxCenter), 0.25)
      const fovRad = THREE.MathUtils.degToRad(camera.fov)
      const halfH = Math.tan(fovRad / 2) * dist
      const halfW = halfH * camera.aspect
      const spanX = 2 * halfW * spanF

      camera.getWorldDirection(wrapFwd)

      wrapRight.crossVectors(wrapFwd, worldUp)

      if (wrapRight.lengthSq() < 1e-8) {
        wrapRight.set(1, 0, 0)
      } else {
        wrapRight.normalize()
      }

      wrapRight.y = 0

      if (wrapRight.lengthSq() < 1e-8) {
        wrapRight.set(1, 0, 0)
      } else {
        wrapRight.normalize()
      }

      if (fullyLeft) {
        carRoot.position.addScaledVector(wrapRight, spanX)
      } else if (fullyRight) {
        carRoot.position.addScaledVector(wrapRight, -spanX)
      }
    }
  }

  function wrapCarDepthWithRandomRespawnIfOutOfBounds() {
    getCameraRelativeAxes()

    const { depth } = getCameraRelativePositionDepthAndSide()

    const wentIntoSmoke = depth > WORLD_WRAP.depthBack
    const wentDownScreen = depth < -WORLD_WRAP.depthFront

    if (!wentIntoSmoke && !wentDownScreen) return

    if (wentIntoSmoke) {
      chooseRandomRespawn(['left', 'right', 'bottom'])
      return
    }

    if (wentDownScreen) {
      chooseRandomRespawn(['left', 'right', 'topFog'])
    }
  }

  function updateSuspension(delta, dSpeed, speedRatio, driftSlip, shake) {
    const accelPitchTarget = THREE.MathUtils.clamp(
      -dSpeed * SUSPENSION.pitchAccelScale,
      -SUSPENSION.pitchMax,
      SUSPENSION.pitchMax,
    )

    const throttlePitchTarget = THREE.MathUtils.clamp(
      -arcadeThrottleSm * SUSPENSION.pitchThrottleScale,
      -SUSPENSION.pitchMax * 0.55,
      SUSPENSION.pitchMax * 0.55,
    )

    const pitchTarget = accelPitchTarget + throttlePitchTarget

    const pitchForce =
      (pitchTarget - suspensionPitch) * SUSPENSION.pitchStiffness -
      suspensionPitchVel * SUSPENSION.pitchDamping

    suspensionPitchVel += pitchForce * delta
    suspensionPitch += suspensionPitchVel * delta

    suspensionPitch = THREE.MathUtils.clamp(
      suspensionPitch,
      -SUSPENSION.pitchMax,
      SUSPENSION.pitchMax,
    )

    const bodyRoll =
      -arcadeSteerSm * speedRatio * SUSPENSION.rollSteerScale +
      driftSlip * SUSPENSION.rollDriftScale +
      Math.sin(clock.getElapsedTime() * 16) * shake * SUSPENSION.rollShakeScale

    carRoot.rotation.x = suspensionPitch
    carRoot.rotation.z = bodyRoll
  }

  function getFrontWheelSideMultiplier(side) {
    if (side === 'left') {
      return WHEEL_STEER.leftMultiplier
    }

    if (side === 'right') {
      return WHEEL_STEER.rightMultiplier
    }

    return 1
  }

  function updateWheelAnimation(delta) {
    const invertSign = WHEEL_STEER.invert ? -1 : 1

    const targetFrontWheelSteer =
      arcadeSteerSm * WHEEL_STEER.maxAngle * invertSign

    frontWheelSteer = THREE.MathUtils.lerp(
      frontWheelSteer,
      targetFrontWheelSteer,
      1 - Math.exp(-delta * WHEEL_STEER.response),
    )

    for (const item of frontWheelItems) {
      const w = item.wheel
      const pivot = item.pivot

      const wheelBase = wheelBaseRotations.get(w.uuid)
      const pivotBase = pivot
        ? wheelSteerPivotBaseRotations.get(pivot.uuid)
        : null

      if (!wheelBase) continue

      const sideMultiplier = getFrontWheelSideMultiplier(item.side)
      const steer = frontWheelSteer * sideMultiplier

      w.rotation.x = wheelBase.x + wheelAngle
      w.rotation.y = wheelBase.y
      w.rotation.z = wheelBase.z

      if (pivot && pivotBase) {
        pivot.rotation.x = pivotBase.x
        pivot.rotation.y = pivotBase.y
        pivot.rotation.z = pivotBase.z

        if (WHEEL_STEER.steerAxis === 'y') {
          pivot.rotation.y = pivotBase.y + steer
        } else if (WHEEL_STEER.steerAxis === 'z') {
          pivot.rotation.z = pivotBase.z + steer
        } else if (WHEEL_STEER.steerAxis === 'x') {
          pivot.rotation.x = pivotBase.x + steer
        }
      }
    }

    for (const w of rearWheels) {
      const base = wheelBaseRotations.get(w.uuid)

      if (!base) continue

      w.rotation.x = base.x + wheelAngle
      w.rotation.y = base.y
      w.rotation.z = base.z
    }
  }

  renderer.setAnimationLoop(() => {
    const delta = Math.min(clock.getDelta(), 0.05)
    const t = clock.getElapsedTime()

    if (IS_MOBILE) {
      /**
       * Mobile viewer mode:
       * машина стоит, камера вращается вокруг неё.
       * Механика движения/respawn/wrap отключена.
       */
      carRoot.position.y = -0.9
      carRoot.rotation.order = 'YXZ'
      carRoot.rotation.x = 0
      carRoot.rotation.z = 0

      exhaust.uniforms.uTime.value = t
      exhaust.uniforms.uThrottle.value = 0.08

      controls.update()
      renderer.render(scene, camera)
      return
    }

    const towardStop = driveTarget < driveBlend - 0.008
    const ramp = towardStop ? DRIVE_RAMPS.stop : DRIVE_RAMPS.start

    driveBlend = THREE.MathUtils.lerp(
      driveBlend,
      driveTarget,
      1 - Math.exp(-delta * ramp),
    )

    const motion = driveBlend * driveBlend * (3 - 2 * driveBlend)

    let thrTarget = 0

    if (keys.ArrowUp) {
      thrTarget = 1
    } else if (keys.ArrowDown) {
      thrTarget = -1
    }

    thrTarget *= motion

    let steerTarget = 0

    if (keys.ArrowLeft) {
      steerTarget += 1
    }

    if (keys.ArrowRight) {
      steerTarget -= 1
    }

    steerTarget = THREE.MathUtils.clamp(steerTarget, -1, 1) * motion

    arcadeThrottleSm = THREE.MathUtils.lerp(
      arcadeThrottleSm,
      thrTarget,
      1 - Math.exp(-delta * ARCADE.throttleResponse),
    )

    arcadeSteerSm = THREE.MathUtils.lerp(
      arcadeSteerSm,
      steerTarget,
      1 - Math.exp(-delta * ARCADE.steerResponse),
    )

    const speedRatio =
      Math.abs(speed) /
      Math.max(speed >= 0 ? ARCADE.maxSpeed : ARCADE.maxReverse, 1e-4)

    const steerYawRate =
      arcadeSteerSm *
      ARCADE.steerYawScale *
      (ARCADE.steerYawAtStop + (1 - ARCADE.steerYawAtStop) * speedRatio)

    const forwardSign =
      Math.abs(speed) > 0.08
        ? Math.sign(speed)
        : arcadeThrottleSm > 0.05
          ? 1
          : arcadeThrottleSm < -0.05
            ? -1
            : 1

    carYaw += steerYawRate * delta * forwardSign

    let accel = 0

    const tsm = arcadeThrottleSm

    if (tsm > 0.02) {
      if (speed < -0.12) {
        accel += ARCADE.brake * Math.min(1, tsm + 0.35)
      }

      accel += ARCADE.accel * tsm
    } else if (tsm < -0.02) {
      if (speed > 0.15) {
        accel -= ARCADE.brake * Math.abs(tsm)
      } else {
        accel += ARCADE.accel * tsm * 0.68
      }
    }

    accel -= speed * ARCADE.drag

    if (Math.abs(speed) > 0.04) {
      accel -= Math.sign(speed) * ARCADE.rollingFriction
    }

    speed = THREE.MathUtils.clamp(
      speed + accel * delta,
      -ARCADE.maxReverse,
      ARCADE.maxSpeed,
    )

    if (motion < 0.04) {
      speed *= Math.exp(-delta * ARCADE.coastBrakeWhenPaused)

      speed = THREE.MathUtils.clamp(
        speed,
        -ARCADE.maxReverse,
        ARCADE.maxSpeed,
      )
    }

    const fx = Math.sin(carYaw)
    const fz = Math.cos(carYaw)

    carRoot.position.x += speed * fx * delta
    carRoot.position.z += speed * fz * delta

    wrapCarHorizontalIfOffScreen()
    wrapCarDepthWithRandomRespawnIfOutOfBounds()

    const driftSlip =
      THREE.MathUtils.clamp(
        Math.abs(arcadeSteerSm) * speedRatio * 1.15,
        0,
        1,
      ) * motion

    const burnout =
      motion *
      THREE.MathUtils.clamp(arcadeThrottleSm, 0, 1) *
      (1 - speedRatio * 0.9)

    const shake = burnout * 0.022

    carRoot.position.y = -0.9 + Math.abs(Math.sin(t * 18)) * shake * 0.85

    carRoot.rotation.order = 'YXZ'

    const dSpeed = (speed - prevSpeed) / Math.max(delta, 1e-4)
    prevSpeed = speed

    updateSuspension(delta, dSpeed, speedRatio, driftSlip, shake)

    carRoot.rotation.y =
      carYaw +
      (Math.sin(t * 2.15) * 0.015 + Math.sin(t * 0.71) * 0.01) * motion

    const targetWheelSpin =
      motion *
      (Math.abs(speed) * 4.6 +
        Math.abs(arcadeThrottleSm) * 9.5 +
        driftSlip * 12 +
        burnout * 28)

    const slowingWheel = targetWheelSpin < wheelSpinRate

    wheelSpinRate = THREE.MathUtils.lerp(
      wheelSpinRate,
      targetWheelSpin,
      1 - Math.exp(-delta * (slowingWheel ? 5.9 : 3.6)),
    )

    wheelAngle += delta * wheelSpinRate

    updateWheelAnimation(delta)

    const rawThrottle = THREE.MathUtils.clamp(
      Math.abs(arcadeThrottleSm) * motion * 0.92 +
        driftSlip * 0.55 +
        burnout * 0.35 +
        0.06 * motion,
      0,
      1,
    )

    exhaustSmoothed = THREE.MathUtils.lerp(
      exhaustSmoothed,
      rawThrottle,
      1 -
        Math.exp(
          -delta * (rawThrottle < exhaustSmoothed - 0.02 ? 10 : 5.5),
        ),
    )

    exhaust.uniforms.uTime.value = t
    exhaust.uniforms.uThrottle.value = exhaustSmoothed

    controls.update()
    renderer.render(scene, camera)
  })
}