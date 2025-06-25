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

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
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

   pointer-events: auto; /* ✅ 明确可交互 */
}
</style>
