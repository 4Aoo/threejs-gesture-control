import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'

export async function useHandTracker(): Promise<HandLandmarker> {
  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
  )

  const handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: '/models/hand_landmarker.task'
    },
    runningMode: 'VIDEO',
    numHands: 2
  })

  return handLandmarker
}
