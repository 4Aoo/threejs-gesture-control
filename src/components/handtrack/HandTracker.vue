<template>
  <div style="width: 100vw; height: 100vh;">
    <video ref="videoRef" autoplay muted playsinline
      style="position: absolute; width: 100%; height: 100%; object-fit: cover; z-index: 0;" />
    <canvas ref="canvasRef"
      style="position: absolute; width: 100%; height: 100%; z-index: 1; pointer-events: none;" />
    <div ref="threeContainer" style="position: absolute; width: 100%; height: 100%; z-index: 2;" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useWebcam } from './useWebcam'
import { useHandTracker } from './useHandTracker'
import HandVisualizer from './HandVisualizer'
const emit = defineEmits(['gesture-confirmed'])

const videoRef = ref<HTMLVideoElement>()
const canvasRef = ref<HTMLCanvasElement>()
const threeContainer = ref<HTMLDivElement>()

let visualizer: HandVisualizer

const lastGesture = ref('')
const gestureStartTime = ref(0)
const confirmedGesture = ref<string | null>(null)

// ✅ 新增：缩放控制状态管理
let isScaling = false
let lastScaleDistance = 0

function distance(a: { x: number, y: number, z: number }, b: { x: number, y: number, z: number }) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const dz = a.z - b.z
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}


function recognizeGesture(landmarks: Array<{ x: number; y: number; z: number }>): string {
  const thumbTip = landmarks[4]
  const indexTip = landmarks[8]
  const middleTip = landmarks[12]
  const ringTip = landmarks[16]
  const pinkyTip = landmarks[20]
  const palm = landmarks[0]

  const allOpen = [8, 12, 16, 20].every(i => distance(landmarks[i], palm) > 0.5)
  const allClosed = [12, 16, 20].every(i => distance(landmarks[i], palm) < 0.3)
  const vSign =
    distance(indexTip, palm) > 0.6 &&
    distance(middleTip, palm) > 0.6 &&
    distance(indexTip, middleTip) > 0.03 &&
    distance(ringTip, palm) < 0.3 &&
    distance(pinkyTip, palm) < 0.3

  if (isScaling && allClosed) return 'exit_scale' // 👊 退出缩放模式
  if (!isScaling && allOpen) return 'enter_scale' // 🖐️ 进入缩放模式
  if (vSign) return 'v_sign'

  return 'unknown'
}

onMounted(async () => {
  await useWebcam(videoRef.value!)
  const tracker = await useHandTracker()
  const ctx = canvasRef.value!.getContext('2d')!
  visualizer = new HandVisualizer(threeContainer.value!)

  const loop = async () => {
    const results = await tracker.detectForVideo(videoRef.value!, performance.now())
    ctx.clearRect(0, 0, canvasRef.value!.width, canvasRef.value!.height)

    if (results.landmarks.length > 0) {
      const landmarksList = results.landmarks
      const handednessList = results.handedness.map(h => h[0]?.categoryName === 'Left' ? 'Left' : 'Right')
      visualizer.updateHands(landmarksList, handednessList)

      const landmarks = landmarksList[0]
      const gesture = recognizeGesture(landmarks)
      const fingertip = landmarks[8]
      const now = performance.now()

      // ✅ 缩放模式控制逻辑
      if (isScaling) {
        const scaleDist = distance(landmarks[4], landmarks[8])
        if (lastScaleDistance !== 0) {
          const scaleFactor = scaleDist / lastScaleDistance
          emit('scale-change', { factor: scaleFactor })
        }
        lastScaleDistance = scaleDist

        if (gesture === 'exit_scale') {
          isScaling = false
          lastScaleDistance = 0
          console.log('[缩放] 退出缩放模式 ❎')
        }

      } else {
        // ✅ 普通手势识别逻辑
        if (gesture === lastGesture.value) {
          const elapsed = now - gestureStartTime.value
          const percent = Math.min(100, (elapsed / 1000) * 100)

          visualizer.showProgressRing(true, fingertip)
          visualizer.setProgress(percent)

          if (elapsed >= 1000 && confirmedGesture.value !== gesture) {
            confirmedGesture.value = gesture
            visualizer.showProgressRing(false)

            const hintMap: Record<string, string> = {
              v_sign: '切换材质',
              enter_scale: '缩放模式中...'
            }
            visualizer.showHintText(hintMap[gesture] || '识别中...', fingertip)

            console.log(`[确认] ${gesture} 手势已保持 1 秒 ✅`)
            emit('gesture-confirmed', { gesture, position: fingertip })

            if (gesture === 'enter_scale') {
              isScaling = true
              lastScaleDistance = distance(landmarks[4], landmarks[8])
              console.log('[缩放] 进入缩放模式 ✅')
            }
          }
        } else {
          lastGesture.value = gesture
          gestureStartTime.value = now
          confirmedGesture.value = null
          visualizer.showProgressRing(false)
        }
      }

    } else {
      lastGesture.value = ''
      gestureStartTime.value = 0
      confirmedGesture.value = null
      visualizer.showProgressRing(false)
    }

    requestAnimationFrame(loop)
  }

  loop()
})
</script>
