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
