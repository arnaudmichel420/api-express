import { defineConfig } from "vite";

export default defineConfig({
    test:{
        environment: 'node',
        globalSetup:'tests/setup.js'
    }
})