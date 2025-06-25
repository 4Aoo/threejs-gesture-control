<template>
  <div ref="containerRef" class="earth-scene-container" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import * as THREE from 'three'
import { Base } from '@/three'

const containerRef = ref<HTMLDivElement | null>(null)
let three: Three

class Three extends Base {
  uniforms: any = {}
  private currentStep = 0
  private stepTextures = ['uMap', 'uNormalMap', 'uDispMap', 'uMetalnessMap', 'uRoughnessMap']
  private isSpinning = false
  private spinCallback: (dt: number) => void = () => this.spinEarth()
  private originalTextures: Record<string, THREE.Texture> = {}
  private earthMesh: THREE.Mesh | null = null

  constructor(dom: HTMLDivElement) {
    super(dom)
    this.earth()
  }

  public nextShaderStage() {
    const maxStage = this.stepTextures.length
    const current = this.uniforms.uEnableStage.value
    this.uniforms.uEnableStage.value = (current + 1) % (maxStage + 1)
    console.log('[切换] 当前启用阶段数:', this.uniforms.uEnableStage.value)
  }

  // 手势缩放
  public scaleModel(factor: number) {
    if (this.earthMesh) {
      this.earthMesh.scale.multiplyScalar(factor)
      this.earthMesh.scale.clampScalar(0.5, 1.5) // 限制缩放范围
    }
  }


  public setBackgroundMode(mode: 'black' | 'stars' | 'navy') {
    const loader = new THREE.TextureLoader()
    switch (mode) {
      case 'black':
        this.scene.background = new THREE.Color(0x000000)
        break
      case 'navy':
        this.scene.background = new THREE.Color('#001f3f')
        break
      case 'stars':
        loader.load('/backgrounds/stars.jpg', texture => {
          this.scene.background = texture
        })
        break
    }
  }

  public resetCamera() {
    this.camera.position.set(2.6, 5.2, 6.2)
    this.controls.target.set(0, 0, 0)
  }

  public enableSpin() {
    if (this.isSpinning) return
    this.isSpinning = true
    this.tick.add('earth-spin', this.spinCallback) // ✅ 用函数引用注册
  }

  public disableSpin() {
    this.isSpinning = false
    this.tick.remove('earth-spin', this.spinCallback) // ✅ 用同样引用移除
  }

  private spinEarth() {
    if (this.earthMesh) {
      this.earthMesh.rotation.y += 0.005
    }
  }

  private earth() {
    const textureLoader = new THREE.TextureLoader()
    this.originalTextures = {
      uMap: textureLoader.load('/Earth/color.png'),
      uNormalMap: textureLoader.load('/Earth/normal.png'),
      uDispMap: textureLoader.load('/Earth/displacement.jpg'),
      uMetalnessMap: textureLoader.load('/Earth/MR.png'),
      uRoughnessMap: textureLoader.load('/Earth/ROUGHNESS.png'),
    }

    this.uniforms = {
      uTime: { value: 0 },
      uMap: { value: this.originalTextures.uMap },
      uNormalMap: { value: this.originalTextures.uNormalMap },
      uDispMap: { value: this.originalTextures.uDispMap },
      uDispScale: { value: 0.2 },
      uMetalnessMap: { value: this.originalTextures.uMetalnessMap },
      uRoughnessMap: { value: this.originalTextures.uRoughnessMap },
      uEnableStage: { value: 0 },
      uLightPos: { value: new THREE.Vector3(-3, -3, 3).normalize() },
      uViewPos: { value: this.camera.position.clone() },
    }



    const vertexShader = `
 varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;

uniform sampler2D uDispMap;
uniform float uDispScale;
uniform int uEnableStage;

void main() {
  vUv = uv;

  // ✅ 仅当阶段 > 3 时才应用位移贴图
  vec3 displacedPosition = position;
  if (uEnableStage > 3) {
    displacedPosition += normal * texture2D(uDispMap, uv).r * uDispScale;
  }

  vNormal = normalize(normalMatrix * normal);
  vec4 worldPos = modelMatrix * vec4(displacedPosition, 1.0);
  vWorldPosition = worldPos.xyz;

  gl_Position = projectionMatrix * viewMatrix * worldPos;
}

`;


    const fragmentShader = `
  precision mediump float;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;

uniform sampler2D uMap;
uniform sampler2D uNormalMap;
uniform sampler2D uDispMap;
uniform sampler2D uMetalnessMap;
uniform sampler2D uRoughnessMap;

uniform int uEnableStage;
uniform vec3 uLightPos;
uniform vec3 uViewPos;

void main() {
  vec3 baseColor = vec3(1.0);

  if (uEnableStage > 0) {
    baseColor *= texture2D(uMap, vUv).rgb;
  }

  vec3 normal = normalize(vNormal);
  if (uEnableStage > 1) {
    vec3 normalTex = texture2D(uNormalMap, vUv).rgb;
    normal = normalize(vNormal + normalTex * 2.0 - 1.0);
  }

  vec3 finalColor = baseColor;

  // ✅ 阶段 3 开始启用光照计算
  if (uEnableStage > 2) {
    vec3 lightDir = normalize(uLightPos);
    vec3 viewDir = normalize(uViewPos - vWorldPosition);
    vec3 reflectDir = reflect(-lightDir, normal);

    float diff = max(dot(normal, lightDir), 0.0);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);

    finalColor *= diff;
    finalColor += vec3(1.0) * spec * 0.3; // 控制高光强度
  }

  if (uEnableStage > 4) {
    float metal = texture2D(uMetalnessMap, vUv).r;
    float rough = texture2D(uRoughnessMap, vUv).r;
    finalColor = mix(finalColor, vec3(0.5), metal);
    finalColor *= (1.0 - rough);
  }

  gl_FragColor = vec4(finalColor, 1.0);
}

`;



    const geo = new THREE.SphereGeometry(3, 64, 64)
    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader,
      fragmentShader,
      lights: false,
    })

    this.earthMesh = new THREE.Mesh(geo, mat)
    this.earthMesh.rotateY(-Math.PI)
    this.scene.add(this.earthMesh)
  }

  update() {
    this.uniforms.uTime.value = this.clock.getElapsedTime()
    this.uniforms.uViewPos.value.copy(this.camera.position)
  }
}

onMounted(() => {
  three = new Three(containerRef.value!)
})

defineExpose({
  nextShaderStage: () => three.nextShaderStage(),
  resetCamera: () => three.resetCamera(),
  setBackgroundMode: (mode: 'black' | 'stars' | 'navy') => three.setBackgroundMode(mode),
  setAutoSpin: (enabled: boolean) => {
    if (enabled) {
      three.enableSpin()
    } else {
      three.disableSpin()
    }
  },
  scaleModel: (factor: number) => three.scaleModel(factor)
})
</script>

<style scoped>
.earth-scene-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
}
</style>
