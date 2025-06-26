<template>
  <div class="gesture-preview">
    <!-- 摄像头预览小窗口 -->
    <video ref="videoRef" autoplay muted playsinline class="video-feed" />

    <!-- 手势可视化 Three.js 画布（底部固定区域） -->
    <div ref="threeContainer" class="gesture-visualizer" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useWebcam } from '@/components/handtrack/useWebcam'
import { useHandTracker } from '@/components/handtrack/useHandTracker'
import HandVisualizer from '@/components/handtrack/HandVisualizer'

const videoRef = ref<HTMLVideoElement | null>(null)
const threeContainer = ref<HTMLDivElement | null>(null)
let visualizer: HandVisualizer

onMounted(async () => {
  await useWebcam(videoRef.value!)
  const tracker = await useHandTracker()
  visualizer = new HandVisualizer(threeContainer.value!)

  const loop = async () => {
    const results = await tracker.detectForVideo(videoRef.value!, performance.now())
    const landmarksList = results.landmarks
    const handednessList = results.handedness.map(h => h[0]?.categoryName === 'Left' ? 'Left' : 'Right')

    visualizer.updateHands(landmarksList, handednessList)
    requestAnimationFrame(loop)
  }
  loop()
})
</script>

<style scoped>
.gesture-preview {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: #000;
  overflow: hidden;
}

.video-feed {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 240px;
  height: 160px;
  border: 2px solid #fff;
  border-radius: 8px;
  z-index: 10;
  object-fit: cover;
}

.gesture-visualizer {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  z-index: 5;
}
</style>
