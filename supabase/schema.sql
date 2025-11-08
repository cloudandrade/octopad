-- Schema para tabela de tiers compartilhados
-- Execute este SQL no Supabase SQL Editor

-- Criar tabela para tiers compartilhados
CREATE TABLE IF NOT EXISTS shared_tiers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  share_code TEXT UNIQUE NOT NULL,
  pads JSONB NOT NULL DEFAULT '[]'::jsonb,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para busca rápida por código
CREATE INDEX IF NOT EXISTS idx_shared_tiers_share_code ON shared_tiers(share_code);

-- Nota: Como estamos usando connection string direta, não precisamos de RLS
-- A segurança é gerenciada pela connection string (apenas o servidor tem acesso)

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_shared_tiers_updated_at
  BEFORE UPDATE ON shared_tiers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Tabela de Usuários
-- ============================================

-- Criar tabela para usuários
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- ID do NextAuth (Google ID)
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para busca rápida por email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- Tabela de Tiers do Usuário
-- ============================================

-- Criar tabela para tiers do usuário
CREATE TABLE IF NOT EXISTS user_tiers (
  id TEXT PRIMARY KEY, -- ID do tier (gerado localmente)
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  share_code TEXT NOT NULL,
  pads JSONB NOT NULL DEFAULT '[]'::jsonb,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, share_code) -- Um usuário não pode ter dois tiers com o mesmo share_code
);

-- Criar índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_user_tiers_user_id ON user_tiers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tiers_share_code ON user_tiers(share_code);
CREATE INDEX IF NOT EXISTS idx_user_tiers_position ON user_tiers(user_id, position);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_user_tiers_updated_at
  BEFORE UPDATE ON user_tiers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

