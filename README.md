# Octopad

Projeto Next.js com autenticação OAuth do Google.

## Configuração

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
Crie um arquivo `.env.local` na raiz do projeto com:
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=seu-secret-aqui
GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret
```

3. Para obter as credenciais do Google:
   - Acesse [Google Cloud Console](https://console.cloud.google.com/)
   - Crie um novo projeto ou selecione um existente (ex: "google-oauth-tutorial")
   - **Primeiro, configure a Tela de Consentimento OAuth:**
     - Vá em "APIs e serviços" > "Tela de permissão OAuth"
     - Escolha "Externo" (para testes) ou "Interno" (se for organização Google Workspace)
     - Preencha as informações básicas (nome do app, email de suporte, etc.)
     - Adicione seu email como usuário de teste (se escolher "Externo")
   - **Depois, crie as credenciais:**
     - Vá em "APIs e serviços" > "Credenciais"
     - Clique em "Criar credenciais" > "ID do cliente OAuth"
     - Escolha "Aplicativo da Web"
     - Configure a URL de redirecionamento autorizada: `http://localhost:3000/api/auth/callback/google`
     - Copie o "ID do cliente" e o "Segredo do cliente" gerados
   - **Nota:** Não é necessário ativar APIs específicas como "Google Cloud APIs" ou "Google+ API" para OAuth básico funcionar

4. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

