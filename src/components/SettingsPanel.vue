<template>
    <el-card class="settings-panel" shadow="always">
        <template #header>
            <div class="card-title">🛠 控制面板</div>
        </template>

        <div class="row">
            <span class="label">当前手势：</span>
            <el-tag size="small" type="success">{{ currentGesture || '无' }}</el-tag>
        </div>

        <div class="row">
            <span class="label">旋转：</span>
            <el-switch v-model="spin" active-text="自动旋转" inactive-text="停止旋转" @change="emit('toggle-spin', spin)" />
        </div>

        <div class="row">
            <span class="label">背景模式：</span>
            <el-select v-model="mode" size="small" style="width: 140px" @change="emit('switch-background', mode)">
                <el-option label="纯黑" value="black" />
                <el-option label="星空图1" value="stars" />
                <el-option label="深蓝" value="navy" />
            </el-select>
        </div>

        <div class="button-group">
            <el-button size="small" plain @click="emit('reset-view')">重置视角</el-button>
            <el-button size="small" type="primary" @click="emit('next-shader')">下一阶段</el-button>
        </div>
    </el-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ currentGesture: string }>()
const emit = defineEmits<{
  (e: 'toggle-spin', value: boolean): void
  (e: 'reset-view'): void
  (e: 'next-shader'): void
  (e: 'switch-background', value: 'black' | 'stars' | 'navy'): void
}>()


const mode = ref<'black' | 'stars' | 'navy'>('black')
const spin = ref(false)

</script>

<style scoped>
.settings-panel {
    position: absolute;
    left: 24px;
    bottom: 80px;
    width: 260px;
    z-index: 20;
    background: white;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-title {
    font-size: 16px;
    font-weight: bold;
    color: #333;
}

.row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
}

.label {
    font-size: 14px;
    color: #444;
}

.button-group {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
}
</style>
