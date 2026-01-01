import { geckos } from '@geckos.io/client'
import { PORT } from '@kapulaga/common'

const channel = geckos({ port: PORT });
channel.onConnect(error => {
  if (error) {
    console.error('[CLIENT] Connection failed:', error.message)
    return
  }

  console.log('[CLIENT] Connection established with HQ!')

  console.log('[CLIENT] Sending Ping...')
  channel.emit('ping')

  channel.on('pong', (data) => {
    console.log(`[CLIENT] Incoming transmission: ${data}`)
    alert(`Success! ${data}`)
  })
})