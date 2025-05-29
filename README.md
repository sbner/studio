
# Notas Aqui - Aplicativo de Anotações Simples

Bem-vindo ao "Notas Aqui"! Este é um aplicativo de anotações simples, construído como um projeto inicial no Firebase Studio, demonstrando funcionalidades básicas de um CRUD (Criar, Ler, Atualizar, Excluir) para anotações, com persistência de dados no Local Storage do navegador e uma simulação de sincronização com um backend.

## ✨ Funcionalidades

*   **Criação de Anotações:** Adicione novas anotações com título, conteúdo e uma etiqueta de cor opcional.
*   **Edição de Anotações:** Modifique anotações existentes.
*   **Exclusão de Anotações:** Remova anotações que não são mais necessárias.
*   **Listagem de Anotações:** Visualize todas as suas anotações em um layout de grade.
*   **Etiquetas de Cor:** Organize suas anotações visualmente com etiquetas coloridas.
*   **Persistência Local:** Suas anotações são salvas no Local Storage do navegador, permitindo o uso offline.
*   **Simulação de Sincronização:** O aplicativo simula chamadas para um backend (via `console.log`) para operações de criação, atualização e exclusão, preparando o terreno para uma integração real.
*   **Interface Responsiva:** Design adaptável para diferentes tamanhos de tela.

## 🚀 Tecnologias Utilizadas

*   **Next.js:** Framework React para renderização no lado do servidor (SSR) e geração de sites estáticos (SSG), utilizando o App Router.
*   **React:** Biblioteca JavaScript para construir interfaces de usuário.
*   **TypeScript:** Superset do JavaScript que adiciona tipagem estática.
*   **ShadCN UI:** Coleção de componentes de UI reutilizáveis, construídos com Radix UI e Tailwind CSS.
*   **Tailwind CSS:** Framework CSS utility-first para estilização rápida e customizável.
*   **Lucide Icons:** Biblioteca de ícones SVG.
*   **Genkit (Firebase):** Configurado no projeto, embora não ativamente utilizado para a funcionalidade principal de anotações neste momento.
*   **React Hook Form & Zod:** Para gerenciamento e validação de formulários.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter o seguinte instalado em sua máquina:

*   [Node.js](https://nodejs.org/) (versão 18.x ou superior recomendada)
*   [npm](https://www.npmjs.com/) (geralmente vem com o Node.js) ou [yarn](https://yarnpkg.com/)

## ⚙️ Configuração e Instalação

Siga os passos abaixo para configurar e executar o projeto localmente:

1.  **Clone o Repositório:**
    ```bash
    git clone <URL_DO_SEU_REPOSITORIO_GIT>
    ```
    (Substitua `<URL_DO_SEU_REPOSITORIO_GIT>` pela URL real do seu projeto se estiver clonando de um repositório remoto. Se estiver trabalhando localmente, pule este passo.)

2.  **Navegue até o Diretório do Projeto:**
    ```bash
    cd nome-do-seu-projeto
    ```
    (Substitua `nome-do-seu-projeto` pelo nome da pasta do projeto.)

3.  **Instale as Dependências:**
    Usando npm:
    ```bash
    npm install
    ```
    Ou usando yarn:
    ```bash
    yarn install
    ```

## ▶️ Executando a Aplicação

Após a instalação das dependências, você pode iniciar o servidor de desenvolvimento:

```bash
npm run dev
```
Ou usando yarn:
```bash
yarn dev
```

Isso iniciará a aplicação em modo de desenvolvimento, geralmente na porta `http://localhost:9002`. Abra este endereço no seu navegador para ver o aplicativo em funcionamento.

As alterações feitas no código serão refletidas automaticamente no navegador graças ao Hot Module Replacement (HMR).

### Comandos Adicionais (Genkit)

O projeto está configurado com Genkit. Embora não seja essencial para a funcionalidade principal de anotações no momento, os seguintes comandos estão disponíveis:

*   Para iniciar o servidor de desenvolvimento do Genkit (se você for desenvolver fluxos de IA):
    ```bash
    npm run genkit:dev
    ```
*   Para iniciar o servidor de desenvolvimento do Genkit com recarregamento automático ao salvar alterações nos arquivos de IA:
    ```bash
    npm run genkit:watch
    ```

## 📁 Estrutura do Projeto (Visão Geral)

*   `src/app/`: Contém as páginas principais da aplicação (usando o App Router do Next.js).
    *   `page.tsx`: A página inicial que renderiza a lista de anotações e o formulário.
    *   `layout.tsx`: O layout raiz da aplicação.
    *   `globals.css`: Estilos globais e configuração do tema ShadCN.
*   `src/components/`: Componentes React reutilizáveis.
    *   `ui/`: Componentes da biblioteca ShadCN UI.
    *   `NoteCard.tsx`: Componente para exibir uma única anotação.
    *   `NoteForm.tsx`: Formulário para criar/editar anotações.
    *   `NoteList.tsx`: Componente para exibir a lista de anotações.
*   `src/hooks/`: Hooks customizados do React.
    *   `useLocalStorage.ts`: Hook para interagir com o Local Storage.
    *   `useToast.ts`: Hook para exibir notificações (toasts).
*   `src/lib/`: Utilitários e tipos.
    *   `types.ts`: Definições de tipos TypeScript (ex: interface `Note`).
    *   `utils.ts`: Funções utilitárias (ex: `cn` para classnames).
*   `src/services/`: Lógica de serviços, como a simulação de sincronização.
    *   `syncService.ts`: Simula chamadas de API para CRUD de anotações.
*   `src/ai/`: Arquivos relacionados à configuração e fluxos do Genkit.
*   `public/`: Arquivos estáticos.
*   `next.config.ts`: Arquivo de configuração do Next.js.
*   `tailwind.config.ts`: Arquivo de configuração do Tailwind CSS.
*   `tsconfig.json`: Arquivo de configuração do TypeScript.

## 🔮 Próximos Passos e Possíveis Melhorias

*   Implementar integração real com um backend (ex: Firebase Firestore) para sincronização de dados.
*   Adicionar autenticação de usuários.
*   Melhorar a UI/UX com mais animações ou feedback visual.
*   Implementar busca e filtragem de anotações.
*   Adicionar testes unitários e de integração.
