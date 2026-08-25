import { createWidget, widget, align, prop, event } from '@zos/ui'
import { Battery, Step, HeartRate, Calorie, Time } from '@zos/sensor'
import { launchApp, SYSTEM_APP_HR, SYSTEM_APP_STATUS, SYSTEM_APP_SPORT, SYSTEM_APP_SETTING } from '@zos/router'
import { createTimer, stopTimer } from '@zos/timer'
import { getScene, SCENE_AOD } from '@zos/app'
import { px } from '@zos/utils'

// Helper function to safely launch native system applications / widgets
function openSystemApp(appId, fallbackAppId = null, url = '') {
  if (url) {
    try {
      if (typeof launchApp === 'function' && typeof appId !== 'undefined') {
        launchApp({
          appId: appId,
          url: url,
          native: true
        })
        return
      }
    } catch (e) {
      console.log('Error launching with url:', e)
    }

    try {
      if (typeof hmApp !== 'undefined' && typeof hmApp.startApp === 'function') {
        hmApp.startApp({
          url: url,
          native: true
        })
        return
      }
    } catch (e) {
      console.log('Error in hmApp.startApp with url:', e)
    }
  }

  try {
    if (typeof launchApp === 'function' && typeof appId !== 'undefined') {
      launchApp({
        appId: appId,
        native: true
      })
      return
    }
  } catch (e) {
    console.log('Error launching system app:', e)
  }

  if (fallbackAppId && typeof launchApp === 'function') {
    try {
      launchApp({
        appId: fallbackAppId,
        native: true
      })
      return
    } catch (e) {
      console.log('Error launching fallback system app:', e)
    }
  }

  try {
    if (typeof hmApp !== 'undefined' && typeof hmApp.startApp === 'function') {
      hmApp.startApp({
        native: true,
        appid: appId
      })
    }
  } catch (e) {
    console.log('Error in hmApp.startApp fallback:', e)
  }
}

// Date format constants
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const DAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']

// Ultra-Bold Modern Typography Font (Outfit Black 900 Weight)
const FONT_BOLD = 'fonts/outfit-black.ttf'

// Hardware-Optimized Grid Settings for 1 Hz Real-Time Smartwatch Rendering
const GRID_W = 40
const GRID_H = 40
const BLOCK_SIZE = 12
const HALF_BLOCK = 6
const MAX_ITER = 16
const CENTER_X = 240
const CENTER_Y = 240
const MAX_R_SQ = 236 * 236 // Circular screen boundary radius

// Iconic Mandelbrot Zoom Destinations (cycles each minute)
const ZOOM_TARGETS = [
  { name: 'Electric Cardioid', cr: -0.65, ci: 0.0, minSpan: 0.015, maxSpan: 1.30 },
  { name: 'Seahorse Valley', cr: -0.743643887, ci: 0.1318259042, minSpan: 0.008, maxSpan: 1.30 },
  { name: 'Triple Spiral', cr: -0.16070135, ci: 1.0375665, minSpan: 0.010, maxSpan: 1.30 },
  { name: 'Elephant Valley', cr: 0.27415, ci: 0.48235, minSpan: 0.012, maxSpan: 1.30 },
  { name: 'Mini-Brot Satellite', cr: -1.74975, ci: 0.00015, minSpan: 0.006, maxSpan: 1.30 },
  { name: 'Starfish Galaxy', cr: -0.776592847, ci: 0.136640848, minSpan: 0.008, maxSpan: 1.30 },
  { name: 'Feather Valley', cr: -0.7995, ci: 0.1562, minSpan: 0.010, maxSpan: 1.30 },
  { name: 'Golden Spiral', cr: -0.7492, ci: 0.1102, minSpan: 0.009, maxSpan: 1.30 }
]

// Glowing Electric Color Engine
function getMandelbrotColor(iter, zMag, max, paletteIdx, phase) {
  // Solid deep black interior for cardioid & bulbs
  if (iter === max && zMag < 1.0) return 0x000000

  let t
  if (iter < max) {
    t = ((iter / max) + phase) % 1.0
  } else {
    t = (((zMag / 4.0) * 0.5) + phase + 0.5) % 1.0
  }

  const p = paletteIdx % 5

  if (p === 0) {
    // Electric Cyan & Royal Blue Aura
    const r = Math.floor(Math.sin(t * 6.28) * 40 + 10)
    const g = Math.floor(Math.sin(t * 6.28 + 1.2) * 125 + 130)
    const b = Math.floor(Math.sin(t * 6.28 + 2.4) * 110 + 145)
    return ((r & 0xFF) << 16) | ((g & 0xFF) << 8) | (b & 0xFF)
  } else if (p === 1) {
    // Cyber Neon Magenta & Deep Violet
    const r = Math.floor(Math.sin(t * 6.28) * 120 + 135)
    const g = Math.floor(Math.sin(t * 6.28 + 1.0) * 40 + 20)
    const b = Math.floor(Math.sin(t * 6.28 + 2.0) * 120 + 135)
    return ((r & 0xFF) << 16) | ((g & 0xFF) << 8) | (b & 0xFF)
  } else if (p === 2) {
    // Emerald Aurora & Neon Lime
    const r = Math.floor(Math.sin(t * 6.28 + 2.0) * 30 + 10)
    const g = Math.floor(Math.sin(t * 6.28) * 120 + 135)
    const b = Math.floor(Math.sin(t * 6.28 + 1.0) * 90 + 90)
    return ((r & 0xFF) << 16) | ((g & 0xFF) << 8) | (b & 0xFF)
  } else if (p === 3) {
    // Solar Amber & Crimson Glow
    const r = Math.floor(Math.sin(t * 6.28) * 120 + 135)
    const g = Math.floor(Math.sin(t * 6.28 + 1.0) * 90 + 100)
    const b = Math.floor(Math.sin(t * 6.28 + 2.0) * 30 + 10)
    return ((r & 0xFF) << 16) | ((g & 0xFF) << 8) | (b & 0xFF)
  } else {
    // Cosmic Nebula
    const r = Math.floor(Math.sin(t * 6.28) * 120 + 135)
    const g = Math.floor(Math.sin(t * 6.28 + 2.0) * 120 + 135)
    const b = Math.floor(Math.sin(t * 6.28 + 4.0) * 120 + 135)
    return ((r & 0xFF) << 16) | ((g & 0xFF) << 8) | (b & 0xFF)
  }
}

function padZero(num) {
  return num < 10 ? `0${num}` : `${num}`
}

function formatNumber(num) {
  if (num === undefined || num === null) return '0'
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

WatchFace({
  state: {
    isAOD: false,
    timerId: null,
    lastRenderedSecond: -1,
    batterySensor: null,
    stepSensor: null,
    heartRateSensor: null,
    calorieSensor: null,
    timeSensor: null,

    // Sensor event listener callbacks
    batteryCallback: null,
    stepCallback: null,
    hrCallback: null,
    calorieCallback: null,

    // Cached values to avoid redundant widget redraws
    lastBatteryVal: -1,
    lastStepVal: -1,
    lastStepTargetVal: -1,
    lastHeartRateVal: -1,
    lastCalorieVal: -1,

    // Background Canvas
    bgCanvas: null,

    // UI Widget handles
    dateWidget: null,
    timeWidget: null,
    batteryWidget: null,
    stepWidget: null,
    heartRateWidget: null,
    calorieWidget: null,

    // Bezel Progress Arcs
    stepArc: null,
    batteryArc: null,
    calorieArc: null
  },

  checkAOD() {
    try {
      if (typeof getScene === 'function') {
        this.state.isAOD = getScene() === SCENE_AOD
      } else if (typeof hmSetting !== 'undefined' && hmSetting.getScreenType) {
        this.state.isAOD = hmSetting.getScreenType() === hmSetting.screen_type.AOD
      }
    } catch (e) {
      console.log('Scene detection error:', e)
    }
  },

  onInit() {
    console.log('[WatchFace] onInit')
    this.checkAOD()
  },

  build() {
    this.checkAOD()
    console.log('[WatchFace] build UI, isAOD:', this.state.isAOD)

    if (this.state.isAOD) {
      this.initAODView()
      this.startAODTimer()
    } else {
      this.initSensors()
      this.initView()
      this.startClockTimer()

      const now = new Date()
      this.renderMandelbrotZoom(now.getSeconds(), now.getMinutes(), true)
    }
  },

  /**
   * Minimalist Always-On Display layout
   */
  initAODView() {
    this.state.dateWidget = createWidget(widget.TEXT, {
      x: px(40),
      y: px(128),
      w: px(400),
      h: px(36),
      color: 0x94A3B8,
      text_size: px(24),
      font: FONT_BOLD,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      text: 'MONDAY, AUG 24'
    })

    this.state.timeWidget = createWidget(widget.TEXT, {
      x: px(20),
      y: px(168),
      w: px(440),
      h: px(145),
      color: 0xFFFFFF,
      text_size: px(132),
      font: FONT_BOLD,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      text: '10:48'
    })

    this.updateAODClock()
  },

  updateAODClock() {
    const now = new Date()
    let rawHours = now.getHours()
    const is24H = this.state.timeSensor && typeof this.state.timeSensor.is24Hour === 'boolean' ? this.state.timeSensor.is24Hour : true

    if (!is24H) {
      rawHours = rawHours % 12 || 12
    }

    const hours = padZero(rawHours)
    const minutes = padZero(now.getMinutes())
    const dayName = DAYS[now.getDay()]
    const monthName = MONTHS[now.getMonth()]
    const dateNum = now.getDate()

    if (this.state.timeWidget) {
      this.state.timeWidget.setProperty(prop.TEXT, `${hours}:${minutes}`)
    }

    if (this.state.dateWidget) {
      this.state.dateWidget.setProperty(prop.TEXT, `${dayName}, ${monthName} ${dateNum}`)
    }
  },

  startAODTimer() {
    if (this.state.timerId) {
      stopTimer(this.state.timerId)
    }
    this.state.timerId = createTimer(1000, 1000, () => {
      this.updateAODClock()
    })
  },

  initSensors() {
    try {
      if (typeof Battery !== 'undefined') {
        this.state.batterySensor = new Battery()
      }
    } catch (e) {
      console.log('Battery sensor init error:', e)
    }

    try {
      if (typeof Step !== 'undefined') {
        this.state.stepSensor = new Step()
      }
    } catch (e) {
      console.log('Step sensor init error:', e)
    }

    try {
      if (typeof HeartRate !== 'undefined') {
        this.state.heartRateSensor = new HeartRate()
      }
    } catch (e) {
      console.log('HeartRate sensor init error:', e)
    }

    try {
      if (typeof Calorie !== 'undefined') {
        this.state.calorieSensor = new Calorie()
      }
    } catch (e) {
      console.log('Calorie sensor init error:', e)
    }

    try {
      if (typeof Time !== 'undefined') {
        this.state.timeSensor = new Time()
      }
    } catch (e) {
      console.log('Time sensor init error:', e)
    }
  },

  initView() {
    // 1. Mandelbrot Dynamic Canvas Background (full watchface area 480x480)
    try {
      this.state.bgCanvas = createWidget(widget.CANVAS, {
        x: px(0),
        y: px(0),
        w: px(480),
        h: px(480)
      })
    } catch (e) {
      console.log('Canvas widget creation fallback:', e)
    }

    // 2. Segmented Bezel Progress Arcs
    // Left Track (Steps background)
    createWidget(widget.ARC, {
      x: px(10),
      y: px(10),
      w: px(460),
      h: px(460),
      radius: px(230),
      start_angle: 135,
      end_angle: 225,
      color: 0x1E293B,
      line_width: px(7)
    })
    // Left Active Arc (Steps progress - Electric Cyan)
    this.state.stepArc = createWidget(widget.ARC, {
      x: px(10),
      y: px(10),
      w: px(460),
      h: px(460),
      radius: px(230),
      start_angle: 135,
      end_angle: 135,
      color: 0x00F0FF,
      line_width: px(7)
    })

    // Right Track (Battery background)
    createWidget(widget.ARC, {
      x: px(10),
      y: px(10),
      w: px(460),
      h: px(460),
      radius: px(230),
      start_angle: -45,
      end_angle: 45,
      color: 0x1E293B,
      line_width: px(7)
    })
    // Right Active Arc (Battery progress - Emerald Green)
    this.state.batteryArc = createWidget(widget.ARC, {
      x: px(10),
      y: px(10),
      w: px(460),
      h: px(460),
      radius: px(230),
      start_angle: -45,
      end_angle: -45,
      color: 0x10B981,
      line_width: px(7)
    })

    // Bottom Track (Calories background)
    createWidget(widget.ARC, {
      x: px(10),
      y: px(10),
      w: px(460),
      h: px(460),
      radius: px(230),
      start_angle: 45,
      end_angle: 135,
      color: 0x1E293B,
      line_width: px(7)
    })
    // Bottom Active Arc (Calories progress - Rose / Magenta)
    this.state.calorieArc = createWidget(widget.ARC, {
      x: px(10),
      y: px(10),
      w: px(460),
      h: px(460),
      radius: px(230),
      start_angle: 45,
      end_angle: 45,
      color: 0xEC4899,
      line_width: px(7)
    })

    // 3. Date & Day Display
    this.state.dateWidget = createWidget(widget.TEXT, {
      x: px(40),
      y: px(68),
      w: px(400),
      h: px(38),
      color: 0xFFFFFF,
      text_size: px(25),
      font: FONT_BOLD,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      text: 'MONDAY, AUG 24'
    })

    // 4. Digital Clock
    this.state.timeWidget = createWidget(widget.TEXT, {
      x: px(10),
      y: px(105),
      w: px(460),
      h: px(135),
      color: 0xFFFFFF,
      text_size: px(126),
      font: FONT_BOLD,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      text: '10:48'
    })

    // 5. Metrics Dashboard

    // Left Column: STEPS
    const stepHeader = createWidget(widget.TEXT, {
      x: px(35),
      y: px(254),
      w: px(120),
      h: px(26),
      color: 0x38BDF8,
      text_size: px(16),
      font: FONT_BOLD,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      text: '👟 STEPS'
    })
    this.state.stepWidget = createWidget(widget.TEXT, {
      x: px(35),
      y: px(282),
      w: px(120),
      h: px(38),
      color: 0xFFFFFF,
      text_size: px(27),
      font: FONT_BOLD,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      text: '0'
    })
    const onStepClick = () => {
      openSystemApp(SYSTEM_APP_STATUS)
    }
    stepHeader.addEventListener(event.CLICK_DOWN, onStepClick)
    this.state.stepWidget.addEventListener(event.CLICK_DOWN, onStepClick)

    // Vertical Divider 1
    createWidget(widget.FILL_RECT, {
      x: px(160),
      y: px(258),
      w: px(1),
      h: px(54),
      color: 0x334155
    })

    // Middle Column: HEART RATE
    const hrHeader = createWidget(widget.TEXT, {
      x: px(170),
      y: px(254),
      w: px(140),
      h: px(26),
      color: 0xFB7185,
      text_size: px(16),
      font: FONT_BOLD,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      text: '♥ BPM'
    })
    this.state.heartRateWidget = createWidget(widget.TEXT, {
      x: px(170),
      y: px(282),
      w: px(140),
      h: px(38),
      color: 0xFFFFFF,
      text_size: px(27),
      font: FONT_BOLD,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      text: '--'
    })
    const onHrClick = () => {
      openSystemApp(SYSTEM_APP_HR)
    }
    hrHeader.addEventListener(event.CLICK_DOWN, onHrClick)
    this.state.heartRateWidget.addEventListener(event.CLICK_DOWN, onHrClick)

    // Vertical Divider 2
    createWidget(widget.FILL_RECT, {
      x: px(319),
      y: px(258),
      w: px(1),
      h: px(54),
      color: 0x334155
    })

    // Right Column: BATTERY / POWER
    const batteryHeader = createWidget(widget.TEXT, {
      x: px(325),
      y: px(254),
      w: px(120),
      h: px(26),
      color: 0x34D399,
      text_size: px(16),
      font: FONT_BOLD,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      text: '⚡ POWER'
    })
    this.state.batteryWidget = createWidget(widget.TEXT, {
      x: px(325),
      y: px(282),
      w: px(120),
      h: px(38),
      color: 0xFFFFFF,
      text_size: px(27),
      font: FONT_BOLD,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      text: '100%'
    })
    const onBatteryClick = () => {
      openSystemApp(SYSTEM_APP_SETTING)
    }
    batteryHeader.addEventListener(event.CLICK_DOWN, onBatteryClick)
    this.state.batteryWidget.addEventListener(event.CLICK_DOWN, onBatteryClick)

    // 6. Bottom Row: CALORIES
    this.state.calorieWidget = createWidget(widget.TEXT, {
      x: px(40),
      y: px(348),
      w: px(400),
      h: px(36),
      color: 0xFBBF24,
      text_size: px(23),
      font: FONT_BOLD,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      text: '🔥 0 KCAL'
    })
    const onCalorieClick = () => {
      openSystemApp(SYSTEM_APP_STATUS)
    }
    this.state.calorieWidget.addEventListener(event.CLICK_DOWN, onCalorieClick)

    // Initial update of clock and sensor values
    const now = new Date()
    this.updateClock(now)
    this.updateAllSensors(true)

    // Register sensor callbacks
    this.registerSensorListeners()
  },

  /**
   * Continuous-Potential progressive Mandelbrot zoom engine
   * @param {number} second - Current second (0..59)
   * @param {number} minute - Current minute
   * @param {boolean} force - Force redraw
   */
  renderMandelbrotZoom(second, minute, force = false) {
    if (!this.state.bgCanvas || this.state.isAOD) return
    if (!force && second === this.state.lastRenderedSecond) return

    this.state.lastRenderedSecond = second

    const targetIdx = minute % ZOOM_TARGETS.length
    const target = ZOOM_TARGETS[targetIdx]
    const paletteIdx = targetIdx

    // Smooth sinusoidal zoom dive (0..30 dives in, 30..59 pulls back out)
    const progress = (1 - Math.cos((second / 60) * 2 * Math.PI)) / 2
    const logRatio = Math.log(target.minSpan / target.maxSpan)
    const span = target.maxSpan * Math.exp(progress * logRatio)

    // Center point stays anchored to the boundary target
    const overviewWeight = (span - target.minSpan) / (target.maxSpan - target.minSpan)
    const cr = target.cr * (1 - overviewWeight) + (-0.65) * overviewWeight
    const ci = target.ci * (1 - overviewWeight) + (0.0) * overviewWeight
    const phase = second / 60.0

    const canvas = this.state.bgCanvas

    try {
      if (typeof canvas.clear === 'function') {
        canvas.clear()
      }
    } catch (e) {
      // Clear optional
    }

    const xmin = cr - span
    const xmax = cr + span
    const ymin = ci - span
    const ymax = ci + span

    let currentPaintColor = -1

    // Compute Mandelbrot grid and draw horizontal line spans
    for (let y = 0; y < GRID_H; y++) {
      const yPixel = y * BLOCK_SIZE + HALF_BLOCK
      const dy = yPixel - CENTER_Y
      const cy = ymin + (y / GRID_H) * (ymax - ymin)
      const yCenter = Math.floor(yPixel)
      let runStart = -1
      let prevColor = null

      for (let x = 0; x < GRID_W; x++) {
        const xPixel = x * BLOCK_SIZE + HALF_BLOCK
        const dx = xPixel - CENTER_X
        const distSq = dx * dx + dy * dy

        let color = 0x000000 // Outer bezel border

        // Only compute within the circular watchface area
        if (distSq <= MAX_R_SQ) {
          const cx = xmin + (x / GRID_W) * (xmax - xmin)
          let zx = 0
          let zy = 0
          let iter = 0

          // Fast escape iteration
          while (zx * zx + zy * zy < 4.0 && iter < MAX_ITER) {
            const xtemp = zx * zx - zy * zy + cx
            zy = 2.0 * zx * zy + cy
            zx = xtemp
            iter++
          }

          // Continuous gradient color mapping
          color = getMandelbrotColor(iter, zx * zx + zy * zy, MAX_ITER, paletteIdx, phase)
        }

        if (prevColor === null) {
          prevColor = color
          runStart = x
        } else if (color !== prevColor) {
          if (currentPaintColor !== prevColor) {
            canvas.setPaint({ color: prevColor, line_width: BLOCK_SIZE })
            currentPaintColor = prevColor
          }
          canvas.drawLine({
            x1: Math.floor(runStart * BLOCK_SIZE),
            y1: yCenter,
            x2: Math.floor(x * BLOCK_SIZE),
            y2: yCenter
          })

          prevColor = color
          runStart = x
        }
      }

      if (prevColor !== null) {
        if (currentPaintColor !== prevColor) {
          canvas.setPaint({ color: prevColor, line_width: BLOCK_SIZE })
          currentPaintColor = prevColor
        }
        canvas.drawLine({
          x1: Math.floor(runStart * BLOCK_SIZE),
          y1: yCenter,
          x2: Math.floor(GRID_W * BLOCK_SIZE),
          y2: yCenter
        })
      }
    }
  },

  registerSensorListeners() {
    if (this.state.isAOD) return

    if (this.state.batterySensor && typeof this.state.batterySensor.onChange === 'function') {
      this.state.batteryCallback = () => {
        this.updateBattery()
      }
      this.state.batterySensor.onChange(this.state.batteryCallback)
    }

    if (this.state.stepSensor && typeof this.state.stepSensor.onChange === 'function') {
      this.state.stepCallback = () => {
        this.updateSteps()
      }
      this.state.stepSensor.onChange(this.state.stepCallback)
    }

    if (this.state.heartRateSensor) {
      this.state.hrCallback = () => {
        this.updateHeartRate()
      }
      if (typeof this.state.heartRateSensor.onCurrentChange === 'function') {
        this.state.heartRateSensor.onCurrentChange(this.state.hrCallback)
      }
      if (typeof this.state.heartRateSensor.onLastChange === 'function') {
        this.state.heartRateSensor.onLastChange(this.state.hrCallback)
      }
    }

    if (this.state.calorieSensor && typeof this.state.calorieSensor.onChange === 'function') {
      this.state.calorieCallback = () => {
        this.updateCalories()
      }
      this.state.calorieSensor.onChange(this.state.calorieCallback)
    }
  },

  unregisterSensorListeners() {
    try {
      if (this.state.batterySensor && typeof this.state.batterySensor.offChange === 'function' && this.state.batteryCallback) {
        this.state.batterySensor.offChange(this.state.batteryCallback)
        this.state.batteryCallback = null
      }
    } catch (e) {}

    try {
      if (this.state.stepSensor && typeof this.state.stepSensor.offChange === 'function' && this.state.stepCallback) {
        this.state.stepSensor.offChange(this.state.stepCallback)
        this.state.stepCallback = null
      }
    } catch (e) {}

    try {
      if (this.state.heartRateSensor && this.state.hrCallback) {
        if (typeof this.state.heartRateSensor.offCurrentChange === 'function') {
          this.state.heartRateSensor.offCurrentChange(this.state.hrCallback)
        }
        if (typeof this.state.heartRateSensor.offLastChange === 'function') {
          this.state.heartRateSensor.offLastChange(this.state.hrCallback)
        }
        this.state.hrCallback = null
      }
    } catch (e) {}

    try {
      if (this.state.calorieSensor && typeof this.state.calorieSensor.offChange === 'function' && this.state.calorieCallback) {
        this.state.calorieSensor.offChange(this.state.calorieCallback)
        this.state.calorieCallback = null
      }
    } catch (e) {}
  },

  updateClock(currentDate) {
    if (this.state.isAOD) {
      this.updateAODClock()
      return
    }

    const now = currentDate || new Date()
    const secondVal = now.getSeconds()
    const minuteVal = now.getMinutes()

    // Continuously zoom into the Mandelbrot set every second
    if (secondVal !== this.state.lastRenderedSecond) {
      this.renderMandelbrotZoom(secondVal, minuteVal)
    }

    let rawHours = now.getHours()
    const is24H = this.state.timeSensor && typeof this.state.timeSensor.is24Hour === 'boolean' ? this.state.timeSensor.is24Hour : true

    if (!is24H) {
      rawHours = rawHours % 12 || 12
    }

    const hours = padZero(rawHours)
    const minutes = padZero(minuteVal)
    const dayName = DAYS[now.getDay()]
    const monthName = MONTHS[now.getMonth()]
    const dateNum = now.getDate()

    // Modern bold digital time
    if (this.state.timeWidget) {
      this.state.timeWidget.setProperty(prop.TEXT, `${hours}:${minutes}`)
    }

    if (this.state.dateWidget) {
      this.state.dateWidget.setProperty(prop.TEXT, `${dayName}, ${monthName} ${dateNum}`)
    }

    // Continuously refresh all sensor values (diff checks ensure 0 redundant widget calls)
    this.updateAllSensors(false)
  },

  updateAllSensors(force = false) {
    this.updateBattery(force)
    this.updateSteps(force)
    this.updateHeartRate(force)
    this.updateCalories(force)
  },

  updateBattery(force = false) {
    if (!this.state.batterySensor) return
    try {
      let level = null
      if (typeof this.state.batterySensor.getCurrent === 'function') {
        level = this.state.batterySensor.getCurrent()
      } else if (typeof this.state.batterySensor.current === 'number') {
        level = this.state.batterySensor.current
      }

      if (typeof level === 'number' && !isNaN(level)) {
        if (force || level !== this.state.lastBatteryVal) {
          this.state.lastBatteryVal = level
          if (this.state.batteryWidget) {
            this.state.batteryWidget.setProperty(prop.TEXT, `${level}%`)
          }
          if (this.state.batteryArc) {
            const angleSpan = (Math.max(0, Math.min(100, level)) / 100) * 90
            const endAngle = -45 + angleSpan
            const arcColor = level > 50 ? 0x10B981 : level > 20 ? 0xFBBF24 : 0xEF4444
            this.state.batteryArc.setProperty(prop.MORE, {
              start_angle: -45,
              end_angle: Math.min(45, endAngle),
              color: arcColor
            })
          }
        }
      }
    } catch (e) {
      console.log('Error updating battery:', e)
    }
  },

  updateSteps(force = false) {
    if (!this.state.stepSensor) return
    try {
      let current = 0
      if (typeof this.state.stepSensor.getCurrent === 'function') {
        current = this.state.stepSensor.getCurrent()
      } else if (typeof this.state.stepSensor.current === 'number') {
        current = this.state.stepSensor.current
      }

      let target = 8000
      if (typeof this.state.stepSensor.getTarget === 'function') {
        target = this.state.stepSensor.getTarget()
      } else if (typeof this.state.stepSensor.target === 'number') {
        target = this.state.stepSensor.target
      }

      const stepChanged = current !== this.state.lastStepVal
      const targetChanged = target !== this.state.lastStepTargetVal

      if (force || stepChanged) {
        this.state.lastStepVal = current
        if (this.state.stepWidget) {
          this.state.stepWidget.setProperty(prop.TEXT, `${formatNumber(current)}`)
        }
      }

      if (force || stepChanged || targetChanged) {
        this.state.lastStepTargetVal = target
        if (target > 0 && this.state.stepArc) {
          const pct = Math.min(100, Math.max(0, (current / target) * 100))
          const angleSpan = (pct / 100) * 90
          const endAngle = 135 + angleSpan
          this.state.stepArc.setProperty(prop.MORE, {
            start_angle: 135,
            end_angle: Math.min(225, endAngle)
          })
        }
      }
    } catch (e) {
      console.log('Error updating steps:', e)
    }
  },

  updateHeartRate(force = false) {
    if (!this.state.heartRateSensor || !this.state.heartRateWidget) return
    try {
      let hr = 0
      if (typeof this.state.heartRateSensor.getCurrent === 'function') {
        hr = this.state.heartRateSensor.getCurrent()
      }
      if ((!hr || hr <= 0) && typeof this.state.heartRateSensor.getLast === 'function') {
        hr = this.state.heartRateSensor.getLast()
      }
      if ((!hr || hr <= 0) && typeof this.state.heartRateSensor.last === 'number') {
        hr = this.state.heartRateSensor.last
      }
      if ((!hr || hr <= 0) && typeof this.state.heartRateSensor.current === 'number') {
        hr = this.state.heartRateSensor.current
      }

      const hrVal = typeof hr === 'number' && hr > 0 ? hr : 0
      if (force || hrVal !== this.state.lastHeartRateVal) {
        this.state.lastHeartRateVal = hrVal
        if (hrVal > 0) {
          this.state.heartRateWidget.setProperty(prop.TEXT, `${hrVal}`)
        } else {
          this.state.heartRateWidget.setProperty(prop.TEXT, '--')
        }
      }
    } catch (e) {
      console.log('Error updating heart rate:', e)
    }
  },

  updateCalories(force = false) {
    if (!this.state.calorieSensor || !this.state.calorieWidget) return
    try {
      let cal = 0
      if (typeof this.state.calorieSensor.getCurrent === 'function') {
        cal = this.state.calorieSensor.getCurrent()
      } else if (typeof this.state.calorieSensor.current === 'number') {
        cal = this.state.calorieSensor.current
      }

      let target = 600
      if (typeof this.state.calorieSensor.getTarget === 'function') {
        target = this.state.calorieSensor.getTarget()
      } else if (typeof this.state.calorieSensor.target === 'number') {
        target = this.state.calorieSensor.target
      }
      if (!target || target <= 0) target = 600

      if (force || cal !== this.state.lastCalorieVal) {
        this.state.lastCalorieVal = cal
        this.state.calorieWidget.setProperty(prop.TEXT, `🔥 ${formatNumber(cal)} KCAL`)
        if (this.state.calorieArc) {
          const pct = Math.min(100, Math.max(0, (cal / target) * 100))
          const angleSpan = (pct / 100) * 90
          const endAngle = 45 + angleSpan
          this.state.calorieArc.setProperty(prop.MORE, {
            start_angle: 45,
            end_angle: Math.min(135, endAngle)
          })
        }
      }
    } catch (e) {
      console.log('Error updating calories:', e)
    }
  },

  startClockTimer() {
    if (this.state.timerId) {
      stopTimer(this.state.timerId)
    }
    // Update every second (1000ms)
    this.state.timerId = createTimer(1000, 1000, () => {
      this.updateClock()
    })
  },

  onDestroy() {
    console.log('[WatchFace] onDestroy')
    if (this.state.timerId) {
      stopTimer(this.state.timerId)
      this.state.timerId = null
    }
    this.unregisterSensorListeners()
  }
})
