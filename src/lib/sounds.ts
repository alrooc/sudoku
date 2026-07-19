let ctx: AudioContext | null = null

function ensureContext(): AudioContext | null {
  try {
    if (!ctx) ctx = new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

function tone(
  audio: AudioContext,
  freq: number,
  startAt: number,
  duration: number,
  options: { type?: OscillatorType; peak?: number; freqEnd?: number } = {},
): void {
  const { type = 'sine', peak = 0.3, freqEnd } = options
  const osc = audio.createOscillator()
  const gain = audio.createGain()
  const t0 = audio.currentTime + startAt
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(freqEnd, t0 + duration)
  }
  gain.gain.setValueAtTime(0, t0)
  gain.gain.linearRampToValueAtTime(peak, t0 + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  osc.connect(gain)
  gain.connect(audio.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.02)
}

export function playCorrect(): void {
  const audio = ensureContext()
  if (!audio) return
  tone(audio, 660, 0, 0.09, { peak: 0.25 })
  tone(audio, 880, 0.05, 0.12, { peak: 0.2 })
}

export function playWrong(): void {
  const audio = ensureContext()
  if (!audio) return
  tone(audio, 220, 0, 0.2, { type: 'triangle', peak: 0.35, freqEnd: 140 })
}

export function playDigitComplete(): void {
  const audio = ensureContext()
  if (!audio) return
  tone(audio, 659.25, 0, 0.12, { peak: 0.22 })
  tone(audio, 880, 0.07, 0.14, { peak: 0.22 })
  tone(audio, 1318.5, 0.14, 0.32, { peak: 0.18 })
}

export function playWin(): void {
  const audio = ensureContext()
  if (!audio) return
  const notes = [523.25, 659.25, 783.99, 1046.5]
  notes.forEach((freq, i) => {
    tone(audio, freq, i * 0.13, 0.28, { peak: 0.3 })
  })
  tone(audio, 1318.5, notes.length * 0.13, 0.5, { peak: 0.22 })
}

export function playLost(): void {
  const audio = ensureContext()
  if (!audio) return
  const notes = [392, 311.13, 233.08]
  notes.forEach((freq, i) => {
    tone(audio, freq, i * 0.18, 0.32, { type: 'triangle', peak: 0.3 })
  })
}
