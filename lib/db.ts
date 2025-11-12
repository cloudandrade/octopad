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

  // Validar formato básico da connection string
  try {
    const url = new URL(connectionString)
    if (!url.hostname || !url.port) {
      console.error('DATABASE_URL inválida: hostname ou porta ausentes')
      return null
    }
  } catch (error) {
    console.error('DATABASE_URL inválida: formato incorreto', error)
    return null
  }

  // Criar conexão apenas uma vez (singleton)
  if (!sql) {
    try {
      sql = postgres(connectionString, {
        max: 1, // Limitar conexões para evitar problemas
        idle_timeout: 20,
        connect_timeout: 10,
        // Adicionar configurações para melhor diagnóstico
        onnotice: () => {}, // Suprimir notices
        transform: {
          undefined: null,
        },
      })
    } catch (error) {
      console.error('Erro ao criar conexão com banco de dados:', error)
      return null
    }
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

