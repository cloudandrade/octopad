# Configuração do Supabase para Octopad

Este guia explica como configurar o Supabase para habilitar o compartilhamento de tiers entre usuários usando connection string direta ao PostgreSQL.

## Por que usar Supabase?

O Supabase fornece um banco de dados PostgreSQL gratuito na nuvem. Usando connection string direta, você tem acesso completo ao banco de dados de forma simples e rápida.

## Passo a Passo

### 1. Criar conta no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Clique em "Start your project" ou "Sign up"
3. Faça login com sua conta GitHub ou crie uma conta

### 2. Criar um novo projeto

1. Clique em "New Project"
2. Preencha os dados:
   - **Name**: `octopad` (ou o nome que preferir)
   - **Database Password**: Escolha uma senha forte (anote esta senha!)
   - **Region**: Escolha a região mais próxima de você
3. Clique em "Create new project"
4. Aguarde alguns minutos enquanto o projeto é criado

### 3. Obter a Connection String

1. No painel do Supabase, vá em **Settings** > **Database**
2. Role até a seção **Connection string**
3. Selecione a aba **URI**
4. Você verá uma connection string no formato:
   ```
   postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
5. **Copie esta connection string** (ela já inclui sua senha)
6. **Importante**: Substitua `[PASSWORD]` pela senha que você definiu ao criar o projeto

### 4. Configurar variáveis de ambiente

1. No seu projeto, crie ou edite o arquivo `.env.local`
2. Adicione a seguinte variável:

```env
DATABASE_URL=postgresql://postgres:sua-senha@db.seu-projeto.supabase.co:5432/postgres
```

**Importante**: 
- Substitua `sua-senha` pela senha do banco de dados que você definiu
- Substitua `seu-projeto` pelo ID do seu projeto Supabase
- A connection string completa deve ficar assim:
  ```
  DATABASE_URL=postgresql://postgres:MinhaSenha123@db.abcdefghijklmnop.supabase.co:5432/postgres
  ```

### 5. Criar a tabela no banco de dados

1. No painel do Supabase, vá em **SQL Editor**
2. Clique em "New query"
3. Copie e cole o conteúdo do arquivo `supabase/schema.sql`
4. Clique em "Run" ou pressione `Ctrl+Enter` (ou `Cmd+Enter` no Mac)
5. Você deve ver uma mensagem de sucesso

### 6. Verificar se está funcionando

1. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

2. Acesse o dashboard e tente:
   - Criar um tier e copiar o código de compartilhamento
   - Adicionar um tier usando um código compartilhado

## Modo de Desenvolvimento (sem banco)

Se você não configurar o `DATABASE_URL`, o aplicativo funcionará em modo de desenvolvimento usando armazenamento em memória. Isso significa que:

- ✅ Tiers privados continuam funcionando normalmente (localStorage)
- ⚠️ Tiers compartilhados só funcionam durante a sessão do servidor (serão perdidos ao reiniciar)

Para produção, é recomendado configurar o Supabase.

## Solução de Problemas

### Erro: "DATABASE_URL não configurado"

- Verifique se a variável `DATABASE_URL` está correta no `.env.local`
- Certifique-se de que o arquivo `.env.local` está na raiz do projeto
- Reinicie o servidor de desenvolvimento após adicionar a variável
- Verifique se a connection string está completa e inclui a senha

### Erro de conexão ao banco

- Verifique se a senha na connection string está correta
- Verifique se o projeto Supabase está ativo
- Verifique se a connection string está no formato correto
- Certifique-se de que substituiu `[PASSWORD]` pela senha real

### Erro ao criar tabela

- Verifique se você está usando o SQL Editor correto
- Certifique-se de que o projeto foi criado completamente
- Tente executar os comandos SQL um por um

### Tiers compartilhados não aparecem

- Verifique o console do navegador para erros
- Verifique se a tabela foi criada corretamente no Supabase
- Verifique se a connection string está funcionando (teste no SQL Editor)

## Limites do Plano Gratuito

O plano gratuito do Supabase inclui:
- 500 MB de banco de dados
- 2 GB de transferência de dados por mês
- 50.000 requisições por mês

Para a maioria dos casos de uso, isso é mais que suficiente.

## Próximos Passos

Após configurar o Supabase, você pode:
- Compartilhar tiers entre diferentes dispositivos
- Compartilhar tiers com outros usuários
- Ter persistência de dados mesmo após reiniciar o servidor

## Segurança

**Importante**: A connection string contém a senha do banco de dados. Nunca:
- Compartilhe a connection string publicamente
- Faça commit da connection string no Git (já está no `.gitignore`)
- Use a connection string no frontend (apenas no servidor/API routes)
