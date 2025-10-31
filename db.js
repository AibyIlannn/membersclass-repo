import postgres from 'postgres'
import dotenv from 'dotenv/config'
import 'dotenv/config'

let sql

try {
  // 🟢 Coba koneksi utama (DATABASE_URL)
  sql = postgres(process.env.DATABASE_URL, {
    ssl: 'require',
    connect_timeout: 10_000, // 10 detik
  })
  console.log('✅ Connected using DATABASE_URL')
} catch (error) {
  console.error('⚠️ DATABASE_URL connection failed:', error.message)
  console.log('🔁 Trying DATABASE_POOLER_URL fallback...')
  
  try {
    // 🔄 Coba koneksi fallback (DATABASE_POOLER_URL)
    sql = postgres(process.env.DATABASE_POOLER_URL, {
      ssl: 'require',
      connect_timeout: 10_000,
    })
    console.log('✅ Connected using DATABASE_POOLER_URL (Pooler)')
  } catch (poolError) {
    console.error('❌ Both connections failed:', poolError.message)
    process.exit(1) // hentikan server kalau dua-duanya gagal
  }
}

export default sql