import axios from 'axios'
const api = axios.create({ baseURL: 'http://localhost:3003/api' })

async function testLatency() {
    const start = Date.now()
    try {
        const res = await api.get('/')
        console.log(`✅ Success: ${res.data.message}`)
        console.log(`⏱️ Latency: ${Date.now() - start}ms`)
    } catch (err) {
        console.error(`❌ Error: ${err.message}`)
    }
}

testLatency()
