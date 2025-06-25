export async function useWebcam(videoEl: HTMLVideoElement): Promise<void> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user' }
  })
  videoEl.srcObject = stream
  await new Promise(resolve => (videoEl.onloadedmetadata = resolve))
  videoEl.play()
}
