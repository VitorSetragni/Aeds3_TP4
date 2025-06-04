/**
 * Implementação da Tabela Hash Extensível
 */

// Classe para a estrutura de dados
class RegistroSimples {
    constructor(chave, valor) {
        this.chave = chave;
        this.valor = valor;
    }

    hashCode() {
        return this.chave;
    }

    toString() {
        return `${this.chave}:${this.valor}`;
    }
}
// Classe para a estrutura de dados
class Cesto {
    constructor(quantidadeMaxima, profundidadeLocal = 0) {
        this.profundidadeLocal = profundidadeLocal;
        this.quantidade = 0;
        this.quantidadeMaxima = quantidadeMaxima;
        this.elementos = [];
    }

    create(elem) {
        if (this.full()) {
            return false;
        }

        // Encontra a posição correta para inserir o elemento (ordem crescente de hash)
        let i = this.quantidade - 1;
        while (i >= 0 && elem.hashCode() < this.elementos[i].hashCode()) {
            i--;
        }

        // Insere o elemento na posição correta
        this.elementos.splice(i + 1, 0, elem);
        this.quantidade++;
        return true;
    }

    read(chave) {
        if (this.empty()) {
            return null;
        }

        for (let i = 0; i < this.quantidade; i++) {
            if (this.elementos[i].hashCode() === chave) {
                return this.elementos[i];
            }
        }
        return null;
    }

    update(elem) {
        if (this.empty()) {
            return false;
        }

        for (let i = 0; i < this.quantidade; i++) {
            if (this.elementos[i].hashCode() === elem.hashCode()) {
                this.elementos[i] = elem;
                return true;
            }
        }
        return false;
    }

    delete(chave) {
        if (this.empty()) {
            return false;
        }

        for (let i = 0; i < this.quantidade; i++) {
            if (this.elementos[i].hashCode() === chave) {
                this.elementos.splice(i, 1);
                this.quantidade--;
                return true;
            }
        }
        return false;
    }

    empty() {
        return this.quantidade === 0;
    }

    full() {
        return this.quantidade === this.quantidadeMaxima;
    }

    clone() {
        const novoCesto = new Cesto(this.quantidadeMaxima, this.profundidadeLocal);
        novoCesto.quantidade = this.quantidade;
        novoCesto.elementos = [...this.elementos];
        return novoCesto;
    }
}
// Classe para a estrutura de dados
class Diretorio {
    constructor() {
        this.profundidadeGlobal = 0;
        this.enderecos = [0];
        this.cestos = new Map();
    }

    hash(chave) {
        return Math.abs(chave) % Math.pow(2, this.profundidadeGlobal);
    }

    hash2(chave, profundidadeLocal) {
        return Math.abs(chave) % Math.pow(2, profundidadeLocal);
    }

    duplica() {
        if (this.profundidadeGlobal >= 20) { // Limite para profundidade
            return false;
        }

        this.profundidadeGlobal++;

        const q1 = Math.pow(2, this.profundidadeGlobal - 1);
        const q2 = Math.pow(2, this.profundidadeGlobal);

        const novosEnderecos = new Array(q2);

        // Copia o vetor anterior para a primeira metade do novo vetor
        for (let i = 0; i < q1; i++) {
            novosEnderecos[i] = this.enderecos[i];
        }

        // Copia o vetor anterior novamente ,mas para a segunda metade do novo vetor
        for (let i = q1; i < q2; i++) {
            novosEnderecos[i] = this.enderecos[i - q1];
        }

        this.enderecos = novosEnderecos;
        return true;
    }
}

class HashExtensivel {
    constructor(quantidadeDadosPorCesto) {
        this.quantidadeDadosPorCesto = quantidadeDadosPorCesto;
        this.diretorio = new Diretorio();
        this.historicoOperacoes = [];

        // Cria o primeiro cesto vazio
        const cestoInicial = new Cesto(quantidadeDadosPorCesto);
        this.diretorio.cestos.set(0, cestoInicial);
    }

    create(elem) {
        const historicoOperacao = {
            tipo: 'inserir',
            elemento: elem,
            diretorioAntes: [...this.diretorio.enderecos],
            duplicouDiretorio: false
        };

        // Identifica a hash do diretório
        const i = this.diretorio.hash(elem.hashCode());

        // Recupera o cesto
        const enderecoCesto = this.diretorio.enderecos[i];
        const cesto = this.diretorio.cestos.get(enderecoCesto);

        if (!cesto) {
            historicoOperacao.resultado = false;
            this.historicoOperacoes.push(historicoOperacao);
            return false;
        }

        historicoOperacao.cestoAntes = cesto.clone();

        // Testa se a chave já existe no cesto
        if (cesto.read(elem.hashCode()) !== null) {
            historicoOperacao.resultado = false;
            this.historicoOperacoes.push(historicoOperacao);
            return false;
        }

        // Testa se o cesto já não está cheio
        if (!cesto.full()) {
            // Insere a chave no cesto
            cesto.create(elem);
            historicoOperacao.cestoDepois = cesto.clone();
            historicoOperacao.resultado = true;
            this.historicoOperacoes.push(historicoOperacao);
            return true;
        }

        // Se chegou aqui o cesto está cheio
        // Divisão de cestos
        // Duplica o diretório se necessário
        const profundidadeLocal = cesto.profundidadeLocal;
        if (profundidadeLocal >= this.diretorio.profundidadeGlobal) {
            this.diretorio.duplica();
            historicoOperacao.duplicouDiretorio = true;
        }

        // Cria os novos cestos e aumenta a profundidade
        const cesto1 = new Cesto(this.quantidadeDadosPorCesto, profundidadeLocal + 1);
        const cesto2 = new Cesto(this.quantidadeDadosPorCesto, profundidadeLocal + 1);

        // Adiciona os novos cestos ao mapa
        const novoEndereco1 = enderecoCesto;
        const novoEndereco2 = this.diretorio.cestos.size;

        this.diretorio.cestos.set(novoEndereco1, cesto1);
        this.diretorio.cestos.set(novoEndereco2, cesto2);

        // Atualiza os endereços no diretório
        const inicio = this.diretorio.hash2(elem.hashCode(), profundidadeLocal);
        const deslocamento = Math.pow(2, profundidadeLocal);
        const max = Math.pow(2, this.diretorio.profundidadeGlobal);

        let troca = false;
        for (let j = inicio; j < max; j += deslocamento) {
            if (troca) {
                this.diretorio.enderecos[j] = novoEndereco2;
            } else {
                this.diretorio.enderecos[j] = novoEndereco1;
            }
            troca = !troca;
        }

        // Reinsere as chaves do cesto antigo recalculando o hash
        for (let j = 0; j < cesto.quantidade; j++) {
            this.create(cesto.elementos[j]);
        }

        // Insere o novo elemento
        const resultado = this.create(elem);

        historicoOperacao.diretorioDepois = [...this.diretorio.enderecos];
        historicoOperacao.resultado = resultado;
        this.historicoOperacoes.push(historicoOperacao);

        return resultado;
    }

    read(chave) {
        const historicoOperacao = {
            tipo: 'buscar',
            elemento: chave
        };

        // Identifica a hash do diretório
        const i = this.diretorio.hash(chave);

        // Recupera o cesto
        const enderecoCesto = this.diretorio.enderecos[i];
        const cesto = this.diretorio.cestos.get(enderecoCesto);

        if (!cesto) {
            historicoOperacao.resultado = null;
            this.historicoOperacoes.push(historicoOperacao);
            return null;
        }

        historicoOperacao.cestoAntes = cesto.clone();

        // Busca o elemento no cesto
        const resultado = cesto.read(chave);

        historicoOperacao.resultado = resultado;
        this.historicoOperacoes.push(historicoOperacao);

        return resultado;
    }

    update(elem) {
        const historicoOperacao = {
            tipo: 'atualizar',
            elemento: elem
        };

        // Identifica a hash do diretório
        const i = this.diretorio.hash(elem.hashCode());

        // Recupera o cesto
        const enderecoCesto = this.diretorio.enderecos[i];
        const cesto = this.diretorio.cestos.get(enderecoCesto);

        if (!cesto) {
            historicoOperacao.resultado = false;
            this.historicoOperacoes.push(historicoOperacao);
            return false;
        }

        historicoOperacao.cestoAntes = cesto.clone();

        // Atualiza o elemento no cesto
        const resultado = cesto.update(elem);

        if (resultado) {
            historicoOperacao.cestoDepois = cesto.clone();
        }

        historicoOperacao.resultado = resultado;
        this.historicoOperacoes.push(historicoOperacao);

        return resultado;
    }

    delete(chave) {
        const historicoOperacao = {
            tipo: 'remover',
            elemento: chave
        };

        // Identifica a hash do diretório
        const i = this.diretorio.hash(chave);

        // Recupera o cesto
        const enderecoCesto = this.diretorio.enderecos[i];
        const cesto = this.diretorio.cestos.get(enderecoCesto);

        if (!cesto) {
            historicoOperacao.resultado = false;
            this.historicoOperacoes.push(historicoOperacao);
            return false;
        }

        historicoOperacao.cestoAntes = cesto.clone();

        // Remove o elemento do cesto
        const resultado = cesto.delete(chave);

        if (resultado) {
            historicoOperacao.cestoDepois = cesto.clone();
        }

        historicoOperacao.resultado = resultado;
        this.historicoOperacoes.push(historicoOperacao);

        return resultado;
    }

    // Métodos para visualização
    getDiretorio() {
        return [...this.diretorio.enderecos];
    }

    getCestos() {
        return new Map(this.diretorio.cestos);
    }

    getProfundidadeGlobal() {
        return this.diretorio.profundidadeGlobal;
    }

    getHistoricoOperacoes() {
        return [...this.historicoOperacoes];
    }

    limparHistorico() {
        this.historicoOperacoes = [];
    }
}

// Variáveis globais
let hashTable;
let operacaoAtual = 'inserir';
let cestoSelecionado = null;
let passoAtual = 0;
let historicoOperacoes = [];
let pausado = false;
let modoPasso = false;
let velocidadeAnimacao = 50
let carregando = false;
let elementoDestacado = null;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa a tabela hash suportando 4 termos por cesto
    hashTable = new HashExtensivel(4);

    // Renderiza o estado inicial
    atualizarVisualizacao();

    // Configura os listeners de eventos
    configurarEventListeners();
});

// Configuração de eventos
function configurarEventListeners() {
    // Botões de operação
    document.querySelectorAll('[data-operacao]').forEach(botao => {
        botao.addEventListener('click', () => {
            document.querySelectorAll('[data-operacao]').forEach(b => b.classList.remove('active'));
            botao.classList.add('active');
            operacaoAtual = botao.dataset.operacao;

            // Mostra/esconde formulários específicos
            if (operacaoAtual === 'configurar') {
                document.getElementById('form-inserir-buscar').style.display = 'none';
                document.getElementById('form-configurar').style.display = 'block';
            } else {
                document.getElementById('form-inserir-buscar').style.display = 'block';
                document.getElementById('form-configurar').style.display = 'none';

                // Mostra/esconde campo de valor
                if (operacaoAtual === 'inserir' || operacaoAtual === 'atualizar') {
                    document.getElementById('valor-container').style.display = 'block';
                } else {
                    document.getElementById('valor-container').style.display = 'none';
                }
            }
        });
    });

    // Formulário de operações
    document.getElementById('operacao-form').addEventListener('submit', (e) => {
        e.preventDefault();

        if (carregando) return;

        carregando = true;
        document.getElementById('btn-executar').textContent = 'Processando...';
        document.getElementById('btn-executar').disabled = true;

        switch (operacaoAtual) {
            case 'inserir':
                handleInserir();
                break;
            case 'buscar':
                handleBuscar();
                break;
            case 'atualizar':
                handleAtualizar();
                break;
            case 'remover':
                handleRemover();
                break;
            case 'configurar':
                handleConfigurar();
                break;
        }
    });

    // Botão limpar histórico
    document.getElementById('btn-limpar').addEventListener('click', () => {
        limparHistorico();
    });

    // Controle de velocidade
    velocidadeAnimacao = 100;


    // Modo passo a passo
    document.getElementById('modo-passo').addEventListener('change', (e) => {
        modoPasso = e.target.checked;
        document.getElementById('btn-avancar').style.display = modoPasso ? 'inline-block' : 'none';
    });

    // Botão avançar
    document.getElementById('btn-avancar').addEventListener('click', () => {
        if (pausado) {
            pausado = false;
            processarProximoPasso();
        }
    });
}

// Funções de manipulação da tabela hash
function handleInserir() {
    const chave = parseInt(document.getElementById('chave').value, 10);
    const valor = document.getElementById('valor').value;

    if (isNaN(chave)) {
        alert('A chave deve ser um número válido');
        resetarFormulario();
        return;
    }

    if (!valor.trim()) {
        alert('O valor não pode estar vazio');
        resetarFormulario();
        return;
    }

    const elemento = new RegistroSimples(chave, valor);
    hashTable.create(elemento);

    historicoOperacoes = hashTable.getHistoricoOperacoes();
    hashTable.limparHistorico();

    passoAtual = 0;
    pausado = false;
    processarProximoPasso();
}

function handleBuscar() {
    const chave = parseInt(document.getElementById('chave').value, 10);

    if (isNaN(chave)) {
        alert('A chave deve ser um número válido');
        resetarFormulario();
        return;
    }

    hashTable.read(chave);

    historicoOperacoes = hashTable.getHistoricoOperacoes();
    hashTable.limparHistorico();

    passoAtual = 0;
    pausado = false;
    processarProximoPasso();
}

function handleAtualizar() {
    const chave = parseInt(document.getElementById('chave').value, 10);
    const valor = document.getElementById('valor').value;

    if (isNaN(chave)) {
        alert('A chave deve ser um número válido');
        resetarFormulario();
        return;
    }

    if (!valor.trim()) {
        alert('O valor não pode estar vazio');
        resetarFormulario();
        return;
    }

    const elemento = new RegistroSimples(chave, valor);
    hashTable.update(elemento);

    historicoOperacoes = hashTable.getHistoricoOperacoes();
    hashTable.limparHistorico();

    passoAtual = 0;
    pausado = false;
    processarProximoPasso();
}

function handleRemover() {
    const chave = parseInt(document.getElementById('chave').value, 10);

    if (isNaN(chave)) {
        alert('A chave deve ser um número válido');
        resetarFormulario();
        return;
    }

    hashTable.delete(chave);

    historicoOperacoes = hashTable.getHistoricoOperacoes();
    hashTable.limparHistorico();

    passoAtual = 0;
    pausado = false;
    processarProximoPasso();
}

function handleConfigurar() {
    const dadosPorCesto = parseInt(document.getElementById('dados-por-cesto').value, 10);

    if (isNaN(dadosPorCesto) || dadosPorCesto < 1 || dadosPorCesto > 10) {
        alert('A quantidade de dados por cesto deve ser um número entre 1 e 10');
        return;
    }

    hashTable = new HashExtensivel(dadosPorCesto);

    atualizarMensagemExplicativa(
        'Tabela Hash Extensível reconfigurada com ' + dadosPorCesto + ' dados por cesto.',
        null,
        null
    );

    atualizarVisualizacao();
    resetarFormulario();
}

function limparHistorico() {
    historicoOperacoes = [];
    passoAtual = 0;
    cestoSelecionado = null;
    elementoDestacado = null;
    location.reload();
    atualizarMensagemExplicativa(
        'Histórico de operações limpo. Utilize o painel de controle para realizar novas operações.',
        null,
        null
    );

    atualizarVisualizacao();
}

// Funções para processamento de passos
function processarProximoPasso() {
    if (historicoOperacoes.length === 0) {
        resetarFormulario();
        return;
    }

    const operacao = historicoOperacoes[0];

    // Atualiza o cabeçalho do painel explicativo
    document.getElementById('painel-header').className = 'header';
    document.getElementById('painel-header').classList.add('bg-' + getOperacaoCor(operacao.tipo));
    document.getElementById('painel-titulo').textContent = getOperacaoTitulo(operacao.tipo);
    document.getElementById('painel-passo').textContent = 'Passo ' + (passoAtual + 1);
    document.getElementById('painel-passo').style.display = 'block';

    // Processa o passo atual
    switch (operacao.tipo) {
        case 'inserir':
            processarPassoInsercao(operacao);
            break;
        case 'buscar':
            processarPassoBusca(operacao);
            break;
        case 'atualizar':
            processarPassoAtualizacao(operacao);
            break;
        case 'remover':
            processarPassoRemocao(operacao);
            break;
    }
}

function processarPassoInsercao(operacao) {
    const { elemento, resultado, duplicouDiretorio } = operacao;

    if (passoAtual === 0) {
        atualizarMensagemExplicativa(
            `Iniciando operação de inserção do elemento com chave ${elemento.chave} e valor "${elemento.valor}".`,
            'inserir',
            `hashTable.create(new RegistroSimples(${elemento.chave}, "${elemento.valor}"));`
        );
        avancarPasso();
    } else if (passoAtual === 1) {
        const indice = hashTable.diretorio.hash(elemento.chave);
        cestoSelecionado = indice;
        atualizarMensagemExplicativa(
            `Calculando o hash da chave ${elemento.chave}:\n` +
            `hash(${elemento.chave}) = ${elemento.chave} % 2^${hashTable.diretorio.profundidadeGlobal} = ${indice}\n` +
            `Índice do diretório: ${indice}`,
            'inserir',
            null
        );
        atualizarVisualizacao();
        avancarPasso();
    } else if (passoAtual === 2) {
        const indice = hashTable.diretorio.hash(elemento.chave);
        const enderecoCesto = hashTable.diretorio.enderecos[indice];
        atualizarMensagemExplicativa(
            `Localizando o cesto correspondente ao índice ${indice}.\n` +
            `Endereço do cesto: ${enderecoCesto}`,
            'inserir',
            null
        );
        avancarPasso();
    } else if (passoAtual === 3) {
        if (duplicouDiretorio) {
            atualizarMensagemExplicativa(
                `O cesto está cheio e precisa ser dividido.\n` +
                `Como a profundidade local do cesto é igual ou maior que a profundidade global do diretório, o diretório será duplicado.`,
                'inserir',
                `// Duplicação do diretório\ndiretorio.duplica();`
            );
            avancarPasso();
        } else if (resultado) {
            atualizarMensagemExplicativa(
                `O cesto tem espaço disponível. Inserindo o elemento com chave ${elemento.chave} e valor "${elemento.valor}".`,
                'inserir',
                null
            );
            avancarPasso();
        } else {
            atualizarMensagemExplicativa(
                `Não foi possível inserir o elemento. A chave ${elemento.chave} já existe ou ocorreu um erro.`,
                'inserir',
                null
            );
            finalizarOperacao();
        }
    } else if (passoAtual === 4) {
        if (duplicouDiretorio) {
            atualizarMensagemExplicativa(
                `Diretório duplicado. A profundidade global aumentou para ${hashTable.diretorio.profundidadeGlobal}.\n` +
                `Criando novos cestos com profundidade local incrementada e redistribuindo os elementos.`,
                'inserir',
                null
            );
            avancarPasso();
        } else if (resultado) {
            atualizarMensagemExplicativa(
                `Elemento inserido com sucesso!\n` +
                `Chave: ${elemento.chave}, Valor: "${elemento.valor}"`,
                'inserir',
                null
            );
            finalizarOperacao();
        }
    } else if (passoAtual === 5) {
        atualizarMensagemExplicativa(
            `Elemento inserido com sucesso após a reorganização!\n` +
            `Chave: ${elemento.chave}, Valor: "${elemento.valor}"`,
            'inserir',
            null
        );
        finalizarOperacao();
    }
}

function processarPassoBusca(operacao) {
    const { elemento, resultado } = operacao;

    if (passoAtual === 0) {
        atualizarMensagemExplicativa(
            `Iniciando operação de busca do elemento com chave ${elemento}.`,
            'buscar',
            `hashTable.read(${elemento});`
        );
        avancarPasso();
    } else if (passoAtual === 1) {
        const indice = hashTable.diretorio.hash(elemento);
        cestoSelecionado = indice;
        atualizarMensagemExplicativa(
            `Calculando o hash da chave ${elemento}:\n` +
            `hash(${elemento}) = ${elemento} % 2^${hashTable.diretorio.profundidadeGlobal} = ${indice}\n` +
            `Índice do diretório: ${indice}`,
            'buscar',
            null
        );
        atualizarVisualizacao();
        avancarPasso();
    } else if (passoAtual === 2) {
        const indice = hashTable.diretorio.hash(elemento);
        const enderecoCesto = hashTable.diretorio.enderecos[indice];
        atualizarMensagemExplicativa(
            `Localizando o cesto correspondente ao índice ${indice}.\n` +
            `Endereço do cesto: ${enderecoCesto}`,
            'buscar',
            null
        );
        avancarPasso();
    } else if (passoAtual === 3) {
        if (resultado) {
            elementoDestacado = resultado.hashCode();
            atualizarMensagemExplicativa(
                `Elemento encontrado!\n` +
                `Chave: ${resultado.chave}, Valor: "${resultado.valor}"`,
                'buscar',
                null
            );
            atualizarVisualizacao();
        } else {
            atualizarMensagemExplicativa(
                `Elemento com chave ${elemento} não encontrado.`,
                'buscar',
                null
            );
        }
        finalizarOperacao();
    }
}

function processarPassoAtualizacao(operacao) {
    const { elemento, resultado } = operacao;

    if (passoAtual === 0) {
        atualizarMensagemExplicativa(
            `Iniciando operação de atualização do elemento com chave ${elemento.chave} para o valor "${elemento.valor}".`,
            'atualizar',
            `hashTable.update(new RegistroSimples(${elemento.chave}, "${elemento.valor}"));`
        );
        avancarPasso();
    } else if (passoAtual === 1) {
        const indice = hashTable.diretorio.hash(elemento.chave);
        cestoSelecionado = indice;
        atualizarMensagemExplicativa(
            `Calculando o hash da chave ${elemento.chave}:\n` +
            `hash(${elemento.chave}) = ${elemento.chave} % 2^${hashTable.diretorio.profundidadeGlobal} = ${indice}\n` +
            `Índice do diretório: ${indice}`,
            'atualizar',
            null
        );
        atualizarVisualizacao();
        avancarPasso();
    } else if (passoAtual === 2) {
        const indice = hashTable.diretorio.hash(elemento.chave);
        const enderecoCesto = hashTable.diretorio.enderecos[indice];
        atualizarMensagemExplicativa(
            `Localizando o cesto correspondente ao índice ${indice}.\n` +
            `Endereço do cesto: ${enderecoCesto}`,
            'atualizar',
            null
        );
        avancarPasso();
    } else if (passoAtual === 3) {
        if (resultado) {
            elementoDestacado = elemento.hashCode();
            atualizarMensagemExplicativa(
                `Elemento encontrado e atualizado com sucesso!\n` +
                `Chave: ${elemento.chave}, Novo valor: "${elemento.valor}"`,
                'atualizar',
                null
            );
            atualizarVisualizacao();
        } else {
            atualizarMensagemExplicativa(
                `Não foi possível atualizar. Elemento com chave ${elemento.chave} não encontrado.`,
                'atualizar',
                null
            );
        }
        finalizarOperacao();
    }
}

function processarPassoRemocao(operacao) {
    const { elemento, resultado } = operacao;

    if (passoAtual === 0) {
        atualizarMensagemExplicativa(
            `Iniciando operação de remoção do elemento com chave ${elemento}.`,
            'remover',
            `hashTable.delete(${elemento});`
        );
        avancarPasso();
    } else if (passoAtual === 1) {
        const indice = hashTable.diretorio.hash(elemento);
        cestoSelecionado = indice;
        atualizarMensagemExplicativa(
            `Calculando o hash da chave ${elemento}:\n` +
            `hash(${elemento}) = ${elemento} % 2^${hashTable.diretorio.profundidadeGlobal} = ${indice}\n` +
            `Índice do diretório: ${indice}`,
            'remover',
            null
        );
        atualizarVisualizacao();
        avancarPasso();
    } else if (passoAtual === 2) {
        const indice = hashTable.diretorio.hash(elemento);
        const enderecoCesto = hashTable.diretorio.enderecos[indice];
        atualizarMensagemExplicativa(
            `Localizando o cesto correspondente ao índice ${indice}.\n` +
            `Endereço do cesto: ${enderecoCesto}`,
            'remover',
            null
        );
        avancarPasso();
    } else if (passoAtual === 3) {
        if (resultado) {
            atualizarMensagemExplicativa(
                `Elemento com chave ${elemento} removido com sucesso!`,
                'remover',
                null
            );
        } else {
            atualizarMensagemExplicativa(
                `Não foi possível remover. Elemento com chave ${elemento} não encontrado.`,
                'remover',
                null
            );
        }
        finalizarOperacao();
    }
}

// Funções auxiliares
function avancarPasso() {
    passoAtual++;
    if (modoPasso) {
        pausado = true;
    } else {
        const delay = 1100 - (velocidadeAnimacao * 100); // 100ms a 1000ms
        setTimeout(() => {
            if (!modoPasso) {
                pausado = false;
                processarProximoPasso();
            }
        }, delay);
    }
}

function finalizarOperacao() {
    historicoOperacoes.shift();
    passoAtual = 0;

    setTimeout(() => {
        if (historicoOperacoes.length > 0) {
            pausado = false;
            processarProximoPasso();
        } else {
            document.getElementById('painel-passo').style.display = 'none';
            document.getElementById('painel-codigo-container').style.display = 'none';
            cestoSelecionado = null;
            elementoDestacado = null;
            atualizarVisualizacao();
            resetarFormulario();
        }
    }, 1500);
}

function resetarFormulario() {
    document.getElementById('chave').value = '';
    document.getElementById('valor').value = '';
    document.getElementById('btn-executar').textContent = 'Executar';
    document.getElementById('btn-executar').disabled = false;
    carregando = false;
}

function atualizarMensagemExplicativa(mensagem, tipo, codigo) {
    document.getElementById('painel-mensagem').textContent = mensagem;

    if (codigo) {
        document.getElementById('painel-codigo').textContent = codigo;
        document.getElementById('painel-codigo-container').style.display = 'block';
    } else {
        document.getElementById('painel-codigo-container').style.display = 'none';
    }
}

function getOperacaoCor(tipo) {
    switch (tipo) {
        case 'inserir': return 'green-600';
        case 'buscar': return 'blue-600';
        case 'atualizar': return 'yellow-600';
        case 'remover': return 'red-600';
        default: return 'gray-600';
    }
}

function getOperacaoTitulo(tipo) {
    switch (tipo) {
        case 'inserir': return 'Operação de Inserção';
        case 'buscar': return 'Operação de Busca';
        case 'atualizar': return 'Operação de Atualização';
        case 'remover': return 'Operação de Remoção';
        default: return 'Tabela Hash Extensível';
    }
}

// Funções de renderização
function atualizarVisualizacao() {
    renderizarDiretorio();
    renderizarCestos();
}

function renderizarDiretorio() {
    // Atualiza a profundidade global
    document.getElementById('profundidade-global').textContent = hashTable.getProfundidadeGlobal();

    // Atualiza o tamanho do diretório
    const enderecos = hashTable.getDiretorio();
    document.getElementById('tamanho-diretorio').textContent = `Tamanho do diretório: ${enderecos.length} entradas`;

    // Renderiza a tabela do diretório
    const tabela = document.getElementById('diretorio-tabela');
    tabela.innerHTML = '';

    enderecos.forEach((endereco, indice) => {
        const tr = document.createElement('tr');
        tr.className = cestoSelecionado === indice ? 'bg-blue-50' : '';

        // Coluna de índice
        const tdIndice = document.createElement('td');
        tdIndice.innerHTML = `${indice} <span class="text-gray-500 text-xs">(${indice.toString(2).padStart(hashTable.getProfundidadeGlobal(), '0')})</span>`;
        tr.appendChild(tdIndice);

        // Coluna de endereço
        const tdEndereco = document.createElement('td');
        tdEndereco.textContent = endereco;
        tr.appendChild(tdEndereco);

        // Coluna de ação
        const tdAcao = document.createElement('td');
        const btnVisualizar = document.createElement('button');
        btnVisualizar.textContent = 'Visualizar';
        btnVisualizar.className = 'btn-visualizar';
        btnVisualizar.addEventListener('click', () => {
            cestoSelecionado = indice;
            atualizarVisualizacao();
        });
        tdAcao.appendChild(btnVisualizar);
        tr.appendChild(tdAcao);

        tabela.appendChild(tr);
    });
}

function renderizarCestos() {
    const container = document.getElementById('cestos-container');
    container.innerHTML = '';

    const cestos = hashTable.getCestos();

    cestos.forEach((cesto, endereco) => {
        // Cria o elemento do cesto
        const cestoElement = document.createElement('div');

        // Define as classes do cesto
        let cestoClass = 'cesto';
        if (cestoSelecionado !== null && hashTable.diretorio.enderecos[cestoSelecionado] === endereco) {
            cestoClass += ' destacado';
        } else if (cesto.full()) {
            cestoClass += ' cheio';
        } else if (cesto.empty()) {
            cestoClass += ' vazio';
        }
        cestoElement.className = cestoClass;

        // Cabeçalho do cesto
        const header = document.createElement('div');
        header.className = 'cesto-header';

        const titulo = document.createElement('div');
        titulo.className = 'cesto-titulo';
        titulo.textContent = `Cesto #${endereco}`;
        header.appendChild(titulo);

        const badges = document.createElement('div');
        badges.className = 'cesto-badges';

        const badgePL = document.createElement('span');
        badgePL.className = 'cesto-badge cesto-badge-pl';
        badgePL.textContent = `PL: ${cesto.profundidadeLocal}`;
        badges.appendChild(badgePL);

        const badgeQtd = document.createElement('span');
        badgeQtd.className = `cesto-badge cesto-badge-qtd ${cesto.full() ? 'cheio' : ''}`;
        badgeQtd.textContent = `${cesto.quantidade}/${cesto.quantidadeMaxima}`;
        badges.appendChild(badgeQtd);

        header.appendChild(badges);
        cestoElement.appendChild(header);

        // Elementos do cesto
        const elementos = document.createElement('div');
        elementos.className = 'cesto-elementos';

        for (let i = 0; i < cesto.quantidadeMaxima; i++) {
            const elementoDiv = document.createElement('div');

            if (i < cesto.quantidade) {
                const elemento = cesto.elementos[i];
                elementoDiv.className = `elemento ${elementoDestacado === elemento.hashCode() ? historicoOperacoes[0]?.tipo || '' : ''}`;

                const conteudo = document.createElement('div');
                conteudo.className = 'elemento-conteudo';

                const valor = document.createElement('span');
                valor.className = 'elemento-valor';
                valor.textContent = elemento.toString();
                conteudo.appendChild(valor);

                const hash = document.createElement('span');
                hash.className = 'elemento-hash';
                hash.textContent = `hash: ${elemento.hashCode()}`;
                conteudo.appendChild(hash);

                elementoDiv.appendChild(conteudo);
            } else {
                elementoDiv.className = 'elemento elemento-vazio';
                elementoDiv.textContent = 'vazio';
            }

            elementos.appendChild(elementoDiv);
        }

        cestoElement.appendChild(elementos);
        container.appendChild(cestoElement);
    });
}
