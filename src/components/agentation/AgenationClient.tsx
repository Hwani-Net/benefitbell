'use client'

import { Agentation } from 'agentation'

export default function AgenationClient() {
  return (
    <Agentation
      endpoint="http://localhost:4747"
      onSessionCreated={(sessionId: string) => {
        console.log('[Agentation] Session:', sessionId)
      }}
    />
  )
}
