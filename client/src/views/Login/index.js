/* eslint-disable */
export function canvas () {
  const canvasEl = document.getElementById('canvas')
  const ctx = canvasEl.getContext('2d')
  const mousePos = [0, 0]

  const easingFactor = 5.0
  const backgroundColor = '#000'
  const nodeColor = '#fff'
  const edgeColor = '#fff'

  const nodes = []
  const edges = []

  function addEdge (edge) {
    let ignore = false

    edges.forEach(function (e) {
      if (e.from === edge.from && e.to === edge.to) {
        ignore = true
      }

      if (e.to === edge.from && e.from === edge.to) {
        ignore = true
      }
    })

    if (!ignore) {
      edges.push(edge)
    }
  }

  function constructNodes () {
    for (let i = 0; i < 100; i++) {
      const node = {
        drivenByMouse: i === 0,
        x: Math.random() * canvasEl.width,
        y: Math.random() * canvasEl.height,
        vx: Math.random() * 1 - 0.5,
        vy: Math.random() * 1 - 0.5,
        radius:
          Math.random() > 0.9 ? 3 + Math.random() * 3 : 1 + Math.random() * 3
      }

      nodes.push(node)
    }

    nodes.forEach(function (e) {
      nodes.forEach(function (e2) {
        if (e === e2) {
          return
        }

        const edge = {
          from: e,
          to: e2
        }

        addEdge(edge)
      })
    })
  }

  function lengthOfEdge (edge) {
    return Math.sqrt(
      Math.pow(edge.from.x - edge.to.x, 2) + Math.pow(edge.from.y - edge.to.y, 2)
    )
  }

  function adjustNodeDrivenByMouse () {
    nodes[0].x += (mousePos[0] - nodes[0].x) / easingFactor
    nodes[0].y += (mousePos[1] - nodes[0].y) / easingFactor
  }

  function render () {
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, canvasEl.width, canvasEl.height)

    edges.forEach(function (e) {
      const l = lengthOfEdge(e)
      const threshold = canvasEl.width / 8

      if (l > threshold) {
        return
      }

      ctx.strokeStyle = edgeColor
      ctx.lineWidth = (1.0 - l / threshold) * 2.5
      ctx.globalAlpha = 1.0 - l / threshold
      ctx.beginPath()
      ctx.moveTo(e.from.x, e.from.y)
      ctx.lineTo(e.to.x, e.to.y)
      ctx.stroke()
    })
    ctx.globalAlpha = 1.0

    nodes.forEach(function (e) {
      if (e.drivenByMouse) {
        return
      }

      ctx.fillStyle = nodeColor
      ctx.beginPath()
      ctx.arc(e.x, e.y, e.radius, 0, 2 * Math.PI)
      ctx.fill()
    })
  }

  function step () {
    nodes.forEach(function (e) {
      if (e.drivenByMouse) {
        return
      }

      e.x += e.vx
      e.y += e.vy

      function clamp (min, max, value) {
        if (value > max) {
          return max
        } else if (value < min) {
          return min
        } else {
          return value
        }
      }

      if (e.x <= 0 || e.x >= canvasEl.width) {
        e.vx *= -1
        e.x = clamp(0, canvasEl.width, e.x)
      }

      if (e.y <= 0 || e.y >= canvasEl.height) {
        e.vy *= -1
        e.y = clamp(0, canvasEl.height, e.y)
      }
    })

    adjustNodeDrivenByMouse()
    render()
    window.requestAnimationFrame(step)
  }

  window.onresize = function () {
    canvasEl.width = document.body.clientWidth
    canvasEl.height = canvasEl.clientHeight

    if (nodes.length === 0) {
      constructNodes()
    }

    render()
  }

  window.onmousemove = function (e) {
    mousePos[0] = e.clientX
    mousePos[1] = e.clientY
  }

  window.onresize()
  window.requestAnimationFrame(step)
}
