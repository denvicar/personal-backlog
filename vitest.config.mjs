import {defineConfig} from 'vitest/config'
import {fileURLToPath} from 'node:url'

export default defineConfig({
    test: {
        environment: 'node',
        include: ['tests/**/*.test.js', 'tests/**/*.test.jsx'],
        clearMocks: true,
        restoreMocks: true,
        setupFiles: ['./vitest.setup.js'],
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./', import.meta.url)),
        },
    },
})
