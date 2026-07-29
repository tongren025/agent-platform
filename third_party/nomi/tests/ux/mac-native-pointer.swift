import CoreGraphics
import Foundation

func postMouse(_ type: CGEventType, x: Double, y: Double) {
  guard let event = CGEvent(
    mouseEventSource: nil,
    mouseType: type,
    mouseCursorPosition: CGPoint(x: x, y: y),
    mouseButton: .left
  ) else {
    exit(2)
  }
  event.post(tap: .cghidEventTap)
}

let arguments = CommandLine.arguments
guard arguments.count >= 2 else { exit(2) }

switch arguments[1] {
case "preflight":
  print(CGPreflightPostEventAccess() ? "true" : "false")
case "click":
  guard arguments.count == 4, let x = Double(arguments[2]), let y = Double(arguments[3]) else { exit(2) }
  postMouse(.mouseMoved, x: x, y: y)
  // 给透明 overlay 的 80ms hover 采样与 renderer→main IPC 足够时间切回穿透态。
  usleep(500_000)
  postMouse(.leftMouseDown, x: x, y: y)
  usleep(80_000)
  postMouse(.leftMouseUp, x: x, y: y)
case "drag":
  guard
    arguments.count == 6,
    let startX = Double(arguments[2]),
    let startY = Double(arguments[3]),
    let endX = Double(arguments[4]),
    let endY = Double(arguments[5])
  else { exit(2) }
  postMouse(.mouseMoved, x: startX, y: startY)
  usleep(500_000)
  postMouse(.leftMouseDown, x: startX, y: startY)
  usleep(180_000)
  // 先跨过 Chromium 的 dragstart 阈值，再给页面 bridge→主进程→overlay 开启命中留时间。
  let kickoffX = startX + (endX >= startX ? 16 : -16)
  let kickoffY = startY + (endY >= startY ? 8 : -8)
  postMouse(.leftMouseDragged, x: kickoffX, y: kickoffY)
  usleep(700_000)
  let steps = 60
  for step in 1...steps {
    let progress = Double(step) / Double(steps)
    let eased = progress * progress * (3 - 2 * progress)
    let x = kickoffX + (endX - kickoffX) * eased
    let y = kickoffY + (endY - kickoffY) * eased
    postMouse(.leftMouseDragged, x: x, y: y)
    usleep(18_000)
  }
  usleep(180_000)
  postMouse(.leftMouseUp, x: endX, y: endY)
default:
  exit(2)
}
