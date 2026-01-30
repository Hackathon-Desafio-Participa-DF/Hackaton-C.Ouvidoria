# Hackaton-C.Ouvidoria

Trata-se do primeiro Hackaton em controle social promovido pe Controladoria Geral do Distrito Federal. Neste presente repositório contém o conteúdo referente a categoria de Ouvidoria.

# Categoria Ouvidoria

O desafio da categoria Ouvidoria consiste no desenvolvimento de uma versão PWA do
Sistema Participa DF, que amplie o acesso e a inclusão dos cidadãos na abertura de manifestações.
A solução deverá contemplar recursos de acessibilidade e permitir o envio de relatos em múltiplos
formatos, como texto e áudio, com possibilidade de anexar imagem e vídeo, além de assegurar
anonimato opcional, emissão de protocolo e conformidade com as diretrizes de acessibilidade
digital (WCAG).

# Execução do projeto

## Requisitos

- Node.js 20+
- npm

### npm (SQLite)

**Backend:**
```bash
cd backend
npm install
npm run setup:local   # Configura SQLite + migra + popula dados
npm run dev           # http://localhost:3001
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev           # http://localhost:5173
```


# Detalhes do projeto

## Estrutura do Projeto

```
/Hackaton-C.Ouvidoria

├── frontend/          # PWA React + TypeScript + Vite
├── backend/           # API Node.js + Express + Prisma
├── loadtest/          # Diretório de teste de carga
└── docker-compose.yml # Configuracao Docker
```

## Credenciais de Teste Gestor

Apos executar o seed:
- **Email:** admin@cgdf.gov.br
- **Senha:** admin123

## Funcionalidades

### Cidadao
- Registrar manifestacao (reclamacao, sugestao, elogio, denuncia, solicitacao)
- Descrever por texto ou audio gravado
- Anexar imagens e videos
- Opcao de anonimato
- Receber protocolo unico
- Consultar status por protocolo

### Gestor (Admin)
- Dashboard com estatisticas
- Listar e filtrar manifestacoes
- Atualizar status
- Responder manifestacoes

## Modelo de Manifestacao

Conforme Manual de Respostas da Ouvidoria Geral do DF:

| Campo | Descricao |
|-------|-----------|
| Relato | Relato completo do ocorrido|
| assunto | O que (objeto da demanda) |
| dataFato | Quando (data exata) |
| horarioFato | Horario ou periodo |
| local | Onde (com referencias) |
| pessoasEnvolvidas | Nomes e matriculas |

## Acessibilidade (WCAG 2.1 AA)

- Navegacao por teclado
- Labels e ARIA attributes
- Contraste de cores adequado
- Skip links
- Menu de acessibilidade (ajuste de fonte, alto contraste)

## Scripts do Backend

| Comando | Descricao |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run db:sqlite` | Configura para SQLite |
| `npm run db:postgres` | Configura para PostgreSQL |
| `npm run setup:local` | Setup completo local (SQLite) |
| `npm run prisma:studio` | Interface visual do banco |
| `npm run seed` | Popula dados de exemplo |

## Scripts do Frontend

| Comando | Descricao |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de producao |
| `npm run preview` | Preview do build |

## API Endpoints

### Publicos
- `POST /api/manifestacoes` - Criar manifestacao
- `GET /api/manifestacoes/:protocolo` - Consultar por protocolo
- `POST /api/upload` - Upload de arquivos

### Admin (Autenticado)
- `POST /api/auth/login` - Login
- `GET /api/admin/dashboard` - Estatisticas
- `GET /api/admin/manifestacoes` - Listar
- `GET /api/admin/manifestacoes/:id` - Detalhes
- `PATCH /api/admin/manifestacoes/:id/status` - Atualizar status
- `POST /api/admin/manifestacoes/:id/resposta` - Responder

## Tecnologias

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Headless UI, PWA

**Backend:** Node.js, Express, TypeScript, Prisma, JWT, Multer

**Banco:** SQLite (dev local)
