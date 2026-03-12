# 🏭 SadMi - Software de Análise de Desempenho de Máquina Industriais

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

## Domínio do Problema e Escopo
No ambiente de manufatura, a visibilidade sobre o desempenho do maquinário é vital para o controle de custos e eficiência. O **SadMi** é uma aplicação Web (SPA e API REST) focada na coleta e análise de dados de produção industrial em tempo real.

O sistema possui uma hierarquia de acesso: administradores gerenciam as contas dos clientes (usuários), e cada cliente gerencia seu próprio parque fabril. Para garantir a segurança e a integridade da telemetria, cada máquina cadastrada recebe um token de comunicação único e exclusivo.

As máquinas poderão enviar periodicamente relatórios de ciclos de produção contendo:
- Desempenho e quantidade de peças produzidas por período.
- Identificação do operador logado na máquina.
- Tipo de peça produzida.
- Consumo de matéria-prima e energia.
- Observações de anomalias.

---

## Stack Tecnológico e Infraestrutura

A arquitetura explora tecnologias modernas para garantir alta disponibilidade e desempenho tanto no lado do cliente (Client-side) quanto no servidor (Server-side).

### Front-end (Client-side)
A interface do usuário é uma Single-Page Application (SPA) construída com **React**. O ecossistema do React foi escolhido por facilitar a criação de dashboards interativos e pela sua alta reatividade, uma característica essencial para a camada de *View*, que precisa renderizar e atualizar gráficos e tabelas de desempenho dinamicamente sem recarregar a página.

### Back-end (Server-side)
O núcleo lógico do sistema é centralizado em um back-end monolítico desenvolvido em **Node.js** com o framework **Express**. Como o Node.js opera sob uma arquitetura não bloqueante (event-driven), ele lida com operações de I/O de maneira altamente eficiente, evitando gargalos ao receber requisições simultâneas e constantes de centenas de máquinas. Esta camada atua concentrando os *Controllers* e os *Models* do sistema.

### Persistência de Dados
Para o armazenamento não volátil, optou-se pelo **PostgreSQL**. A escolha por um banco de dados relacional justifica-se pela necessidade de modelar relações hierárquicas rígidas (Cliente -> Máquina -> Ciclo de Produção) e garantir a integridade absoluta das transações ocorridas no chão de fábrica.

### Infraestrutura e Qualidade
Para sustentar o ciclo de vida da aplicação, o ecossistema conta com as seguintes ferramentas:

* **Versionamento e Deploy:** Controle de código via Git com automação de CI/CD configurada no GitHub Actions, garantindo entregas contínuas em ambiente de produção.
* **Documentação de API:** O contrato da API REST é documentado interativamente via **Swagger** (OpenAPI), garantindo padronização. O **Postman** é utilizado para simular o comportamento das máquinas e testar rotas.
* **Testes Automatizados:** Utilização do framework Jest para aplicar o TDD (Test Driven Development) nas rotas críticas que envolvem os cálculos de telemetria e transações.
* **Observabilidade:** Ferramentas de log (como Morgan ou Winston) integram o servidor Node.js para rastrear anomalias nos envios das máquinas, mapear erros e monitorar o status HTTP de todas as requisições.

---

## Requisitos do Sistema

### Requisitos Funcionais (RF)
| ID | Descrição |
| :--- | :--- |
| **RF01** | O sistema deve possuir um módulo de autenticação (login) diferenciado para Administradores e Clientes. |
| **RF02** | O sistema deve permitir que usuários com perfil de Administrador cadastrem, editem e gerenciem as contas dos Clientes. |
| **RF03** | O sistema deve permitir que o Cliente cadastre e gerencie as máquinas do seu próprio parque fabril. |
| **RF04** | O sistema deve gerar e fornecer um token de comunicação único e exclusivo no momento do cadastro de cada máquina. |
| **RF05** | O sistema deve disponibilizar um endpoint (API REST) para receber relatórios de ciclos de produção das máquinas. |
| **RF06** | O sistema deve registrar, para cada ciclo de produção enviado pela máquina: desempenho/quantidade de peças, identificação do operador, tipo de peça, consumo (matéria-prima e energia) e anomalias. |
| **RF07** | O sistema deve exibir, na página principal do Cliente, um painel (dashboard) com gráficos sobre o desempenho geral de todas as máquinas cadastradas. |
| **RF08** | O sistema deve exibir, na página específica de cada máquina, um gráfico detalhado com o desempenho individual do equipamento. |

### Requisitos Não Funcionais (RNF)
| ID | Categoria | Descrição |
| :--- | :--- | :--- |
| **RNF01** | Interface | A interface do usuário deve ser construída como uma SPA utilizando React para garantir alta reatividade. |
| **RNF02** | Back-end | A API REST deve ser desenvolvida em Node.js com Express, utilizando arquitetura não bloqueante. |
| **RNF03** | Banco de Dados | O armazenamento deve ser feito em PostgreSQL para garantir a integridade das transações e hierarquias. |
| **RNF04** | Segurança | O endpoint de ingestão de telemetria só deve aceitar requisições que contenham o token válido da máquina. |
| **RNF05** | Testes | As rotas críticas (cálculos e transações) devem ser cobertas por testes automatizados em Jest (padrão TDD). |
| **RNF06** | Documentação | O contrato da API REST deve ser documentado de forma interativa utilizando OpenAPI (Swagger). |
| **RNF07** | Observabilidade | Integração de ferramentas de log (Morgan/Winston) no Node.js para rastrear requisições e anomalias. |
| **RNF08** | Infraestrutura | O versionamento deve ser via Git, com CI/CD configurada no GitHub Actions. |

---

## Casos de Uso Principais

Abaixo estão exemplos dos principais fluxos de interação entre os atores (Administrador, Cliente e Máquina) e o sistema:

* **UC01 - Gerenciar Clientes:** * **Ator:** Administrador.
  * **Descrição:** O Administrador faz login no sistema e acessa o painel de controle para cadastrar um novo Cliente (fábrica), definindo suas credenciais de acesso e informações de faturamento.
* **UC02 - Provisionar Nova Máquina:**
  * **Ator:** Cliente.
  * **Descrição:** O Cliente acessa seu ambiente, preenche os dados de um novo equipamento (ex: Torno CNC, Injetora) e o sistema retorna um `Bearer Token` exclusivo que será configurado no CLP/computador dessa máquina para autorizar o envio de dados.
* **UC03 - Ingestão de Telemetria:**
  * **Ator:** Máquina (Sistema Externo).
  * **Descrição:** A máquina finaliza um ciclo de produção e faz uma requisição POST automática para a API do SadMi, enviando o payload com a quantidade de peças, refugo e consumo de energia, autenticando-se via token.
* **UC04 - Monitoramento via Dashboard:**
  * **Ator:** Cliente.
  * **Descrição:** O Cliente acessa a página inicial da SPA e visualiza gráficos atualizados em tempo real que consolidam a eficiência geral do parque fabril (OEE) e destacam máquinas com anomalias registradas no último turno.

 ## Diagrama C4
 <img width="617" height="1158" alt="image" src="https://github.com/user-attachments/assets/8fddd95e-a893-47d6-bfb6-a33200501227" />


