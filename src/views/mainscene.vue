<template>
  <div class="main-container">
    <!-- 地球：全屏展示 -->
    <EarthScene ref="earthRef" class="earth-scene" />

    <!-- 手势追踪可视化：右上角小窗格 -->
    <div class="handtracker-overlay" @mousedown.stop @mousemove.stop @mouseup.stop>
      <HandTracker @gesture-confirmed="onGestureConfirmed" @scale-change="onScaleChange" />
    </div>

    <!-- 控制面板 -->
    <SettingsPanel
      :currentGesture="currentGesture"
      @toggle-spin="onToggleSpin"
      @switch-background="onSwitchBackground"
      @reset-view="onResetView"
      @next-shader="onNextShader"
    />

    <!-- ✅ 手势指引卡片（可拖动） -->
    <el-card class="gesture-guide-card" shadow="hover" @mousedown.stop>
      <div class="card-header">🧭 手势交互指南</div>
      <ul>
        <li>🖐️ 张开五指：进入缩放模式</li>
        <li>🤏 捏合拇指与食指：控制缩放</li>
        <li>✊ 保持拇指与食指收起后三指：退出缩放模式</li>
        <li>✌️ V 手势：切换地球材质</li>
      </ul>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import HandTracker from '@/components/handtrack/HandTracker.vue'
import EarthScene from '@/components/uearth.vue'
import SettingsPanel from '@/components/SettingsPanel.vue'

const earthRef = ref<InstanceType<typeof EarthScene> | null>(null)
const currentGesture = ref('')  // ✅ 初始手势

function onGestureConfirmed({ gesture }: { gesture: string }) {
  currentGesture.value = gesture // ✅ 更新绑定
  console.log('[父组件] 收到手势确认事件:', gesture)
  if (gesture === 'v_sign') {
    console.log('[父组件] 调用 nextShaderStage()')
    earthRef.value?.nextShaderStage()
  }
}

//缩放监听
function onScaleChange({ factor }: { factor: number }) {
  earthRef.value?.scaleModel(factor)
}

const onToggleSpin = (enable: boolean) => {
  earthRef.value?.setAutoSpin?.(enable)
}

const onSwitchBackground = (mode: 'black' | 'stars' | 'navy') => {
  earthRef.value?.setBackgroundMode?.(mode)
}

const onResetView = () => {
  earthRef.value?.resetCamera?.()
}

const onNextShader = () => {
  earthRef.value?.nextShaderStage()
}

// ✅ 拖动卡片逻辑
onMounted(() => {
  const card = document.querySelector('.gesture-guide-card') as HTMLElement
  if (!card) return
  let isDragging = false
  let offsetX = 0, offsetY = 0

  card.addEventListener('mousedown', (e) => {
    isDragging = true
    offsetX = e.clientX - card.offsetLeft
    offsetY = e.clientY - card.offsetTop
    document.body.style.userSelect = 'none'
  })

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return
    card.style.left = `${e.clientX - offsetX}px`
    card.style.top = `${e.clientY - offsetY}px`
  })

  document.addEventListener('mouseup', () => {
    isDragging = false
    document.body.style.userSelect = ''
  })
})
</script>

<style scoped>
.main-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.earth-scene {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.handtracker-overlay {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 450px;
  height: 300px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 8px;
  overflow: hidden;
  z-index: 10;
  background: rgba(0, 0, 0, 0.2);
  pointer-events: auto;
}

/* ✅ 手势指南卡片样式 */
.gesture-guide-card {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 260px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(6px);
  border-radius: 10px;
  padding: 10px;
  cursor: grab;
  z-index: 15;
  font-size: 14px;
  color: #333;
  transition: box-shadow 0.2s ease;
}

.gesture-guide-card .card-header {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 10px;
  color: #409EFF;
}

.gesture-guide-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.gesture-guide-card li {
  margin-bottom: 6px;
}
</style>
