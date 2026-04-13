import {defineConfig} from 'vitest/config'
import {fileURLToPath} from 'node:url'

export default defineConfig({
    test: {
        environment: 'node',
        include: ['tests/**/*.test.js'],
        clearMocks: true,
        restoreMocks: true,
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./', import.meta.url)),
        },
    },
})
