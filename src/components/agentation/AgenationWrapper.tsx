'use client'

/**
 * Agentation — Development-only visual feedback tool.
 * Only active in NODE_ENV=development.
 */
import { useEffect, useState } from 'react'

export default function AgenationWrapper() {
  const [AgentComp, setAgentComp] = useState<React.ComponentType | null>(null)

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      import('agentation').then((mod) => {
        const AgentationInner = () => (
          <mod.Agentation
            endpoint="http://localhost:4747"
            onSessionCreated={(id: string) => console.log('[Agentation] Session:', id)}
          />
        )
        AgentationInner.displayName = 'AgentationInner'
        setAgentComp(() => AgentationInner)
      }).catch(() => {/* agentation not available */})
    }
  }, [])

  if (!AgentComp) return null
  return <AgentComp />
}
