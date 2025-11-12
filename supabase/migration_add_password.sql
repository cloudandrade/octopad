-- Migração para adicionar campo password na tabela users
-- Execute este SQL no Supabase SQL Editor se a tabela já existir

-- Adicionar coluna password (opcional, NULL para usuários do Google)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password TEXT;

-- Comentário explicativo
COMMENT ON COLUMN users.password IS 'Hash da senha (NULL para usuários do Google)';

