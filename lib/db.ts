import postgres from 'postgres'

// Connection string do Supabase PostgreSQL
// Formato: postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres
const connectionString = process.env.DATABASE_URL || ''

let sql: ReturnType<typeof postgres> | null = null

export function getDb() {
  if (!connectionString) {
    console.warn('DATABASE_URL não configurado. Usando modo de desenvolvimento.')
    return null
  }

  // Criar conexão apenas uma vez (singleton)
  if (!sql) {
    sql = postgres(connectionString, {
      max: 1, // Limitar conexões para evitar problemas
      idle_timeout: 20,
      connect_timeout: 10,
    })
  }

  return sql
}

// Fechar conexão quando necessário
export async function closeDb() {
  if (sql) {
    await sql.end()
    sql = null
  }
}

