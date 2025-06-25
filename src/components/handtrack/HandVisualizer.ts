// src/views/Frist/HandVisualizer.ts
import * as THREE from 'three'
import { Base } from '@/three'

export default class HandVisualizer extends Base {
  /** 每只手的 21 个关键点小球 */
  private spheresMap: Record<'Left' | 'Right', THREE.Mesh[]> = {
    Left: [],
    Right: []
  }

  /** 每只手的 20 根关节骨架圆柱体（替代 Line） */
  private cylinderLinesMap: Record<'Left' | 'Right', THREE.Mesh[]> = {
    Left: [],
    Right: []
  }

  /** 每只手的掌心区域面片 */
  private palmMeshMap: Record<'Left' | 'Right', THREE.Mesh> = {
    Left: null!,
    Right: null!
  }

  /** 手势确认进度环对象 */
  private progressRing: THREE.Mesh | null = null
  private progressText: THREE.Sprite | null = null


  constructor(dom: HTMLDivElement) {
    super(dom)
    this.initSpheres()
    this.initCylinders()
    this.initPalms()
    this.addLight()
    this.initProgressRing()
    this.initHintText()

    this.camera.position.set(0, 1.5, 4.5) // 平视距离
    this.controls.target.set(0, 1, 0) // 看向中心
    this.controls.update() // 应用设置
  }

  /** 初始化关键点小球 */
  private initSpheres() {
    const geometry = new THREE.SphereGeometry(0.08, 12, 12)
    const colors = { Right: 0xadd8e6, Left: 0xffc0cb };// 浅蓝 / 浅粉

    (['Left', 'Right'] as const).forEach((hand) => {
      const mat = new THREE.MeshStandardMaterial({ color: colors[hand] })
      this.spheresMap[hand] = []
      for (let i = 0; i < 21; i++) {
        const sphere = new THREE.Mesh(geometry, mat.clone())
        this.scene.add(sphere)
        this.spheresMap[hand].push(sphere)
      }
    })
  }

  /** 初始化粗线段骨架：使用圆柱体模拟连线 */
  private initCylinders() {
    (['Left', 'Right'] as const).forEach((hand) => {
      this.cylinderLinesMap[hand] = []
      const mat = new THREE.MeshStandardMaterial({
        color: hand === 'Left' ? 0xffc0cb : 0xadd8e6,
        transparent: true,
        opacity: 0.5
      })

      // 创建20根“骨架”圆柱，默认放场外
      for (let i = 0; i < 20; i++) {
        const cyl = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.05, 1, 6),
          mat.clone()
        )
        this.scene.add(cyl)
        this.cylinderLinesMap[hand].push(cyl)
      }
    })
  }

  /** 初始化掌心面片（Shape + ShapeGeometry） */
  private initPalms() {
    const colors = { Right: 0xadd8e6, Left: 0xffc0cb };

    (['Left', 'Right'] as const).forEach((hand) => {
      const shape = new THREE.Shape([new THREE.Vector2(0, 0)]) // 初始占位
      const geometry = new THREE.ShapeGeometry(shape)
      const material = new THREE.MeshBasicMaterial({
        color: colors[hand],
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide
      })
      const mesh = new THREE.Mesh(geometry, material)
      this.scene.add(mesh)
      this.palmMeshMap[hand] = mesh
    })
  }

  /** 添加光源用于照亮场景 */
  private addLight() {
    const light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.set(2, 2, 4)
    this.scene.add(light)
  }

  /** 初始化环形确认提示环 */
  private initProgressRing() {
    const innerRadius = 0.08
    const outerRadius = 0.13
    const geometry = new THREE.RingGeometry(innerRadius, outerRadius, 64, 1, 0, Math.PI * 2)

    const material = new THREE.MeshBasicMaterial({
      color: 0xffd700,              // 金黄色
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.rotation.x = Math.PI / 2  // 初始旋转（XY平面向上）

    mesh.visible = false
    this.scene.add(mesh)
    this.progressRing = mesh
  }


  /** 控制是否显示进度环与其位置 */
  public showProgressRing(show: boolean, position?: { x: number; y: number; z: number }) {
    if (!this.progressRing) return

    this.progressRing.visible = show

    if (this.progressText) {
      this.progressText.visible = show
    }

    if (show && position) {
      const pos = new THREE.Vector3(
        -(position.x - 0.5) * 4,
        -(position.y - 0.5) * 4 + 2,
        -position.z * 4
      )
      this.progressRing.position.copy(pos)

      // ✅ 环始终朝向摄像头（Z方向观察）
      this.progressRing.lookAt(this.camera.position)

      if (this.progressText) {
        this.progressText.position.copy(pos.clone().add(new THREE.Vector3(0, 0.4, 0)))
      }
    }

  }


  /** 设置环形进度显示（通过环角度更新） */
  public setProgress(percent: number) {
    if (!this.progressRing) return

    const angle = (percent / 100) * Math.PI * 2
    const innerRadius = 0.08
    const outerRadius = 0.13

    const geometry = new THREE.RingGeometry(innerRadius, outerRadius, 64, 1, 0, angle)

    this.progressRing.geometry.dispose()
    this.progressRing.geometry = geometry
  }


  /** 初始化提示文字 Sprite */
  private initHintText() {
    const spriteMaterial = new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(document.createElement('canvas')),
      transparent: true,
      opacity: 1
    })
    const sprite = new THREE.Sprite(spriteMaterial)
    sprite.visible = false
    this.scene.add(sprite)
    this.progressText = sprite
  }


  /** 显示文字 */
  public showHintText(message: string, position: { x: number; y: number; z: number }) {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 64
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = 'white'
    ctx.font = '32px sans-serif'
    ctx.fillText(message, 10, 40)

    const texture = new THREE.CanvasTexture(canvas)
    this.progressText!.material.map = texture
    this.progressText!.material.needsUpdate = true
    this.progressText!.scale.set(1.5, 0.375, 1)
    this.progressText!.position.set(
      -(position.x - 0.5) * 4,
      -(position.y - 0.5) * 4 + 2.4,
      -position.z * 4
    )
    this.progressText!.visible = true

    // 2秒后自动隐藏
    setTimeout(() => {
      this.progressText!.visible = false
    }, 2000)
  }




  /** 每帧更新识别到的手部位置（支持双手） */
  public updateHands(
    landmarksList: { x: number; y: number; z: number }[][],
    handednessList: string[]
  ) {
    // 重置所有对象为“隐藏状态”（放场外 / 不可见）
    (['Left', 'Right'] as const).forEach((hand) => {
      this.spheresMap[hand].forEach(s => s.position.set(999, 999, 999))
      this.cylinderLinesMap[hand].forEach(c => c.visible = false)
      this.palmMeshMap[hand].visible = false
    })

    // 用于防止重复赋值
    const updatedHands = new Set<'Left' | 'Right'>()

    // 每对骨架连接点的索引（20条）
    const pairs = [
      [0, 1], [1, 2], [2, 3], [3, 4],     // 拇指
      [0, 5], [5, 6], [6, 7], [7, 8],     // 食指
      [0, 9], [9, 10], [10, 11], [11, 12], // 中指
      [0, 13], [13, 14], [14, 15], [15, 16], // 无名指
      [0, 17], [17, 18], [18, 19], [19, 20]  // 小指
    ]

    for (let i = 0; i < landmarksList.length; i++) {
      const rawHand = handednessList[i]
      const hand: 'Left' | 'Right' = rawHand === 'Left' ? 'Left' : 'Right'
      if (updatedHands.has(hand)) continue
      updatedHands.add(hand)

      const landmarks = landmarksList[i]
      const spheres = this.spheresMap[hand]
      const cylinders = this.cylinderLinesMap[hand]

      const points3D: THREE.Vector3[] = []

      // 👉 计算每个关键点的 3D 坐标并更新球体位置
      for (let j = 0; j < 21; j++) {
        const lm = landmarks[j]
        const x = -(lm.x - 0.5) * 4
        const y = -(lm.y - 0.5) * 4 + 2
        const z = -lm.z * 4
        spheres[j].position.set(x, y, z)
        points3D.push(new THREE.Vector3(x, y, z))
      }

      // 👉 更新 20 条 cylinder 连线位置与朝向
      for (let k = 0; k < pairs.length; k++) {
        const [a, b] = pairs[k]
        const start = points3D[a]
        const end = points3D[b]
        const cyl = cylinders[k]

        const delta = new THREE.Vector3().subVectors(end, start)
        const length = delta.length()
        const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)

        cyl.scale.set(1, length, 1)
        cyl.position.copy(mid)

        cyl.lookAt(end)
        cyl.rotateX(Math.PI / 2) // 旋转，使其沿 Y 轴对准指向线

        cyl.visible = true
      }

      // 👉 更新掌心多边形区域
      const palmIndices = [0, 1, 2, 5, 9, 13, 17]
      const palmShape = new THREE.Shape()
      palmIndices.forEach((idx, i) => {
        const p = points3D[idx]
        if (i === 0) {
          palmShape.moveTo(p.x, p.y)
        } else {
          palmShape.lineTo(p.x, p.y)
        }
      })
      palmShape.lineTo(points3D[palmIndices[0]].x, points3D[palmIndices[0]].y)

      const palmGeometry = new THREE.ShapeGeometry(palmShape)
      this.palmMeshMap[hand].geometry.dispose()
      this.palmMeshMap[hand].geometry = palmGeometry
      this.palmMeshMap[hand].position.set(0, 0, 0)
      this.palmMeshMap[hand].visible = true

      // 临时演示：显示进度环在食指位置，并设置 75% 进度
      // if (points3D[8]) {
      //   this.showProgressRing(true, {
      //     x: landmarks[8].x,
      //     y: landmarks[8].y,
      //     z: landmarks[8].z
      //   })
      //   this.setProgress(75)
      // }
    }
  }
}
