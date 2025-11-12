import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

// Endpoint para testar a conexão com o banco de dados
export async function GET() {
  try {
    const db = getDb()
    
    if (!db) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Banco de dados não configurado',
          details: 'DATABASE_URL não está configurada ou é inválida'
        },
        { status: 500 }
      )
    }

    // Tentar fazer uma query simples para testar a conexão
    const result = await db`SELECT NOW() as current_time, version() as pg_version`
    
    return NextResponse.json({
      status: 'ok',
      message: 'Conexão com banco de dados estabelecida com sucesso',
      database: {
        currentTime: result[0]?.current_time,
        version: result[0]?.pg_version?.split(' ')[0] + ' ' + result[0]?.pg_version?.split(' ')[1],
      },
      connectionString: process.env.DATABASE_URL 
        ? `${process.env.DATABASE_URL.split('@')[0]}@***` // Ocultar senha
        : 'não configurada'
    })
  } catch (error: any) {
    console.error('Erro ao testar conexão com banco:', error)
    
    let errorMessage = 'Erro desconhecido ao conectar com o banco de dados'
    let errorCode = 'UNKNOWN'
    
    if (error?.code === 'ENOTFOUND') {
      errorMessage = 'Não foi possível resolver o hostname do banco de dados. Verifique se o projeto Supabase está ativo e se o hostname está correto.'
      errorCode = 'ENOTFOUND'
    } else if (error?.code === 'ECONNREFUSED') {
      errorMessage = 'Conexão recusada pelo servidor. Verifique se o projeto Supabase está ativo e se a porta está correta.'
      errorCode = 'ECONNREFUSED'
    } else if (error?.code === 'ETIMEDOUT') {
      errorMessage = 'Timeout ao conectar com o banco de dados. Verifique sua conexão de rede.'
      errorCode = 'ETIMEDOUT'
    } else if (error?.message) {
      errorMessage = error.message
      errorCode = error.code || 'UNKNOWN'
    }
    
    return NextResponse.json(
      {
        status: 'error',
        message: errorMessage,
        code: errorCode,
        details: error?.message,
        connectionString: process.env.DATABASE_URL 
          ? `${process.env.DATABASE_URL.split('@')[0]}@***` // Ocultar senha
          : 'não configurada'
      },
      { status: 500 }
    )
  }
}

