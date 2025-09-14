import { createServer, InlineConfig } from 'vite'
import path from 'path'

async function start() {
    const config: InlineConfig = {
        root: process.cwd(),
        configFile: path.resolve(process.cwd(), 'vite.config.ts'),
        server: { host: true, port: 5173 },
    }

    const server = await createServer(config)
    await server.listen()
    server.printUrls()
}

start().catch((err) => {
    console.error(err)
    process.exit(1)
}) 