import { geckos } from '@geckos.io/server';
import { PORT } from '@kapulaga/common';

const io = geckos();
io.listen(PORT);

console.log(`[SERVER] Radio tower active. Listening on port ${PORT}...`)

io.onConnection(channel => {
    console.log(`[SERVER] Soldier connected. ID: ${channel.id}`)

    channel.onDisconnect(() => {
        console.log(`[SERVER] Soldier disconnected: ${channel.id}`)
    })

    channel.on('ping', () => {
        console.log(`[SERVER] Received Ping from ${channel.id}`)
        channel.emit('pong', 'Server confirms: Roger that.')
    })
})