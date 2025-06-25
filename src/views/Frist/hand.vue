<template>
  <div ref="containerRef" style="width: 100vw; height: 100vh; overflow: hidden;">
    <video ref="videoRef" autoplay muted playsinline style="position: absolute; width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); z-index: 0;" />
    <canvas ref="canvasRef" style="position: absolute; width: 100%; height: 100%; z-index: 1; pointer-events: none; transform: scaleX(-1);" />
    <div ref="threeRef" style="position: absolute; width: 100%; height: 100%; z-index: 2; pointer-events: none;" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as THREE from 'three'
import { HandLandmarker, FilesetResolver, HandLandmarkerResult } from '@mediapipe/tasks-vision'

const containerRef = ref()
const videoRef = ref<HTMLVideoElement>()
const canvasRef = ref<HTMLCanvasElement>()
const threeRef = ref()

let handLandmarker: HandLandmarker
let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer
let spheresList: THREE.Mesh[][] = []

const createHandSpheres = (color: number): THREE.Mesh[] => {
  const sphereGeometry = new THREE.SphereGeometry(0.015, 8, 8)
  const material = new THREE.MeshBasicMaterial({ color })
  const spheres: THREE.Mesh[] = []
  for (let i = 0; i < 21; i++) {
    const sphere = new THREE.Mesh(sphereGeometry, material.clone())
    scene.add(sphere)
    spheres.push(sphere)
  }
  return spheres
}

const updateSpheres = (landmarks: any[], spheres: THREE.Mesh[], flipX = true) => {
  for (let i = 0; i < 21; i++) {
    const lm = landmarks[i]
    const x = flipX ? -1 * (lm.x * 2 - 1) : (lm.x * 2 - 1)
    spheres[i].position.set(x, -(lm.y * 2 - 1), -lm.z)
  }
}

const initThree = () => {
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 2

  renderer = new THREE.WebGLRenderer({ alpha: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  threeRef.value.appendChild(renderer.domElement)

  spheresList.push(createHandSpheres(0x00ff00)) // 第一只手：绿色
  spheresList.push(createHandSpheres(0xff00ff)) // 第二只手：品红

  animate()
}

const animate = () => {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}

const initMediaPipe = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
  )
  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: '/models/hand_landmarker.task' },
    runningMode: 'VIDEO',
    numHands: 2
  })
}

const initWebcam = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
  videoRef.value!.srcObject = stream
  await new Promise(resolve => videoRef.value!.onloadedmetadata = resolve)
  videoRef.value!.play()
}

const startTracking = () => {
  const canvasCtx = canvasRef.value!.getContext('2d')!

  const loop = async () => {
    if (videoRef.value!.readyState === 4) {
      const results = await handLandmarker.detectForVideo(videoRef.value!, performance.now())
      canvasCtx.clearRect(0, 0, canvasRef.value!.width, canvasRef.value!.height)

      results.landmarks.forEach((landmarks, index) => {
        updateSpheres(landmarks, spheresList[index], true) // 强制反转坐标以抵消前置摄像头镜像
      })
    }
    requestAnimationFrame(loop)
  }
  loop()
}

onMounted(async () => {
  await initMediaPipe()
  await initWebcam()
  initThree()
  startTracking()
})
</script>

<style scoped>
canvas, video {
  transform: scaleX(-1); /* 镜像视觉效果 */
}
</style>
