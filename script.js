document.addEventListener('DOMContentLoaded', () => {
    const botoes = document.querySelectorAll('.tab-btn');
    const semanas = document.querySelectorAll('.semana-content');

    botoes.forEach(botao => {
        botao.addEventListener('click', () => {
            const id = botao.dataset.semana;
            semanas.forEach(sec => sec.classList.remove('active'));
            document.getElementById(id).classList.add('active');
        });
    });

    document.querySelectorAll('.semana-content').forEach(section => {
        const btn = section.querySelector('.adicionar');
        const inputNome = section.querySelector('.nome');
        const inputFoto = section.querySelector('.foto');
        const lista = section.querySelector('.lista-alunos');
        const semanaId = section.id;

        carregarAlunos(semanaId, lista);

        btn.addEventListener('click', () => {
            const nome = inputNome.value.trim();
            const foto = inputFoto.files[0];

            if (!nome) {
                alert("Por favor, insira o nome do aluno.");
                return;
            }

            const leitor = new FileReader();
            leitor.onload = function(e) {
                const aluno = {
                    nome,
                    foto: e.target.result,
                    estrelas: [false, false, false, false, false],
                    pontos: 0
                };
                salvarAluno(aluno, semanaId);
                criarAluno(aluno, lista, semanaId);
            };

            if (foto) {
                leitor.readAsDataURL(foto);
            } else {
                const aluno = {
                    nome,
                    foto: 'https://via.placeholder.com/50',
                    estrelas: [false, false, false, false, false],
                    pontos: 0
                };
                salvarAluno(aluno, semanaId);
                criarAluno(aluno, lista, semanaId);
            }

            inputNome.value = '';
            inputFoto.value = '';
        });
    });

    // Botão de toggle para mostrar/ocultar a sidebar
    const toggleBtn = document.getElementById('toggleSidebar');
    const sidebar = document.querySelector('.sidebar');

    function atualizarPosicaoBotao() {
        if (sidebar.classList.contains('recolhida')) {
            toggleBtn.style.left = '10px';
        } else {
            toggleBtn.style.left = '190px';
        }
    }

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('recolhida');
            atualizarPosicaoBotao();
        });

        atualizarPosicaoBotao(); // Ajusta ao carregar a página
    }
});

// Criação de aluno
function criarAluno(aluno, container, semanaId) {
    const alunoDiv = document.createElement('div');
    alunoDiv.className = 'aluno';

    const img = document.createElement('img');
    img.src = aluno.foto;

    const spanNome = document.createElement('span');
    spanNome.textContent = aluno.nome;

    const pontuacao = document.createElement('span');
    pontuacao.className = 'pontuacao';
    pontuacao.textContent = aluno.pontos;

    const estrelasDiv = document.createElement('div');
    estrelasDiv.className = 'estrelas';

    aluno.estrelas.forEach((ativa, i) => {
        const estrela = document.createElement('span');
        estrela.className = 'estrela';
        estrela.innerHTML = '★';
        if (ativa) estrela.classList.add('ativa');

        estrela.addEventListener('click', () => {
            aluno.estrelas[i] = !aluno.estrelas[i];
            aluno.pontos += aluno.estrelas[i] ? 1 : -1;
            estrela.classList.toggle('ativa');
            pontuacao.textContent = aluno.pontos;
            atualizarAluno(aluno, semanaId);
        });

        estrelasDiv.appendChild(estrela);
    });

    const removerBtn = document.createElement('button');
    removerBtn.className = 'remover';
    removerBtn.innerHTML = '&times;';
    removerBtn.addEventListener('click', () => {
        removerAluno(aluno, semanaId);
        alunoDiv.remove();
    });

    alunoDiv.appendChild(img);
    alunoDiv.appendChild(spanNome);
    alunoDiv.appendChild(pontuacao);
    alunoDiv.appendChild(estrelasDiv);
    alunoDiv.appendChild(removerBtn);

    container.appendChild(alunoDiv);
}

// LocalStorage: salvar, atualizar, remover, carregar

function salvarAluno(aluno, semana) {
    const alunos = JSON.parse(localStorage.getItem(semana)) || [];
    alunos.push(aluno);
    localStorage.setItem(semana, JSON.stringify(alunos));
}

function atualizarAluno(alunoAtualizado, semana) {
    const alunos = JSON.parse(localStorage.getItem(semana)) || [];
    const index = alunos.findIndex(a => a.nome === alunoAtualizado.nome);
    if (index > -1) {
        alunos[index] = alunoAtualizado;
        localStorage.setItem(semana, JSON.stringify(alunos));
    }
}

function removerAluno(alunoRemovido, semana) {
    const alunos = JSON.parse(localStorage.getItem(semana)) || [];
    const novosAlunos = alunos.filter(a => a.nome !== alunoRemovido.nome);
    localStorage.setItem(semana, JSON.stringify(novosAlunos));
}

function carregarAlunos(semana, container) {
    const alunos = JSON.parse(localStorage.getItem(semana)) || [];
    alunos.forEach(aluno => criarAluno(aluno, container, semana));
}
