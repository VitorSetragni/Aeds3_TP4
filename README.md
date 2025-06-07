# 📊 HashVis – Visualizador de **Tabela Hash Extensível**
Trabalho Prático 4 — Algoritmos e Estruturas de Dados 3 (AEDS 3) — PUC Minas  

Este projeto implementa **uma Tabela Hash Extensível totalmente interativa**, exibida no navegador.  
Além de todas as operações CRUD, o sistema demonstra, passo a passo, como a estrutura reage a colisões, divisão de cestos e duplicação do diretório, facilitando o estudo do algoritmo.

---

## 🚀 O que o nosso trabalho faz?
1. **CRUD completo**  
   - Inserir, buscar, atualizar e remover registros (`chave → valor`).

2. **Visualização em tempo real**  
   - Diretório, cestos, profundidades (global/local) e ocupação são desenhados e atualizados após cada passo.

3. **Modo passo-a-passo & animações**  
   - Escolha entre execução contínua ou controlada pelo usuário.  
   - Velocidade das animações configurável.

4. **Reconfiguração dinâmica**  
   - Ajuste on-the-fly do tamanho máximo de dados por cesto (1 – 10).

5. **Histórico detalhado**  
   - Cada operação gera um log exibindo código equivalente, explicação textual e estados “antes/depois”.

6. **Interface acessível**  
   - Desenvolvida com **HTML + TailwindCSS** e **JavaScript ES6** (sem dependências externas).

---

## 👥 Participantes
| Nome | Matrícula |
|------|-----------|
| Vitor Leite Setragni | *xxxxx* |
| Gabriel Henrique de Morais | *xxxxx* |
| Mateus Martins Parreiras | *xxxxx* |

---

## 🏗️ Estrutura do Projeto

### Estrutura do Projeto


├── index.html            # Interface principal

├── styles.css            # Ajustes Tailwind + animações

├── hash/                 # Implementação da Tabela Hash Extensível

----├── registro.js       # class RegistroSimples

----├── cesto.js          # class Cesto

----├── diretorio.js      # class Diretorio

----└── hashExtensivel.js # class HashExtensivel

└── ui/                   # Camada de interação e renderização

----├── controller.js     # Lógica de CRUD + histórico

----└── renderer.js       # Funções de desenho (diretório, cestos, painel)





### Principais classes & métodos

| Classe | Finalidade | Métodos-chave |
|--------|------------|---------------|
| **`RegistroSimples`** | Par `(chave, valor)` | `hashCode()`, `toString()` |
| **`Cesto`** | Armazena elementos, controla **PL** | `create()`, `read()`, `update()`, `delete()`, `full()`, `empty()`, `clone()` |
| **`Diretorio`** | Vetor de endereços + **PG** | `hash()`, `duplica()` |
| **`HashExtensivel`** | Núcleo da estrutura | `create()`, `read()`, `update()`, `delete()`, `getDiretorio()`, `getCestos()` |

A camada **UI** encapsula:
- **`controller.js`** — validação de formulários, orquestra histórico, controla passo-a-passo.  
- **`renderer.js`** — atualiza DOM para diretório, cestos, painel de explicação e código.

---

## 💡 Experiência de Desenvolvimento

- **Requisitos atendidos?** Sim, implementamos todos os itens descritos no enunciado, incluindo a visualização interativa e o modo passo-a-passo.
- **Desafios mais notáveis:**  
  1. **Sincronização entre lógica e animação** — garantir que cada passo refletisse exatamente o estado interno.  
  2. **Divisão de cestos** — redistribuir elementos sem perder histórico da animação.  
  3. **Acessibilidade** — tornar a UI clara, mesmo em telas pequenas, apenas com Tailwind.
- **Resultados obtidos:** A aplicação está estável; testamos cenários de saturação, chaves negativas e diferentes tamanhos de cesto. Todos os casos foram exibidos corretamente.

---

## ✅ Checklist (responda sim/não)

| Item | Resposta |
|------|----------|
| A visualização interativa da Tabela Hash Extensível foi criada? | **Sim** |
| Há um vídeo de até 2 minutos demonstrando o uso da visualização? | **Sim**  |
| O trabalho está funcionando corretamente? | **Sim** |
| O trabalho está completo? | **Sim** |
| O trabalho é original e não a cópia de um trabalho de um colega? | **Sim** |

---

## 🎥 Demonstração em vídeo
[▶️ Assista ao vídeo (1 min 45 s)](https://youtu.be/SEU_VIDEO)

---

## 📂 Repositório
<https://github.com/VitorSetragni/Aeds3_TP4>

