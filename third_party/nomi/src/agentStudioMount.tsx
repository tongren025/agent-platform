import React from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import '@fontsource-variable/inter/wght.css'
import '@fontsource-variable/fraunces/wght.css'
import '@mantine/core/styles/UnstyledButton.css'
import '@mantine/core/styles/CloseButton.css'
import '@mantine/core/styles/Notification.css'
import '@mantine/notifications/styles.css'
import './styles/index.css'
import NomiStudioApp from './workbench/NomiStudioApp'
import { NomiAppProviders } from './NomiAppProviders'
import { NomiColorSchemeProvider } from './theme/NomiColorSchemeProvider'
import { primeNomiColorScheme } from './theme/colorScheme'

export type AgentStudioCanvasMount = {
  unmount: () => void
}

/**
 * Agent Studio 主站挂载入口。
 *
 * 复用上游工作台源码，但不创建独立 HTML、iframe 或第二套路由页面；
 * 鉴权和平台 API 通过同源请求共享主站会话。
 */
export function mountAgentStudioCanvas(container: HTMLElement): AgentStudioCanvasMount {
  primeNomiColorScheme()
  const styles = [
    ['agent-studio-canvas-tailwind', '/agent-canvas/tailwind.generated.css'],
    ['agent-studio-canvas-style', '/agent-canvas/agent-canvas.css'],
  ] as const
  for (const [styleId, href] of styles) {
    if (document.getElementById(styleId)) continue
    const link = document.createElement('link')
    link.id = styleId
    link.rel = 'stylesheet'
    link.href = href
    document.head.appendChild(link)
  }
  const root: Root = createRoot(container)
  root.render(
    <React.StrictMode>
      <NomiColorSchemeProvider>
        <NomiAppProviders>
          <HashRouter>
            <NomiStudioApp />
          </HashRouter>
        </NomiAppProviders>
      </NomiColorSchemeProvider>
    </React.StrictMode>,
  )
  return { unmount: () => root.unmount() }
}
