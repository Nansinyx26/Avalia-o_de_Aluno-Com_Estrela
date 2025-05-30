document.addEventListener('DOMContentLoaded', () => {
    const botoes = document.querySelectorAll('.tab-btn');
    const semanas = document.querySelectorAll('.semana-content');

    abrirDB();

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

            const adicionarAluno = (imagemReduzida) => {
                const aluno = {
                    id: Date.now(),
                    nome,
                    foto: imagemReduzida || 'https://via.placeholder.com/50',
                    estrelas: [false, false, false, false, false],
                    pontos: 0
                };
                salvarAluno(aluno, semanaId, () => criarAluno(aluno, lista, semanaId));
            };

            if (foto && foto.size > 0) {
                const leitor = new FileReader();
                leitor.onload = (e) => redimensionarImagem(e.target.result, adicionarAluno);
                leitor.onerror = () => alert("Erro ao ler a imagem. Tente outra foto.");
                leitor.readAsDataURL(foto);
            } else {
                adicionarAluno();
            }

            inputNome.value = '';
            inputFoto.value = '';
        });
    });

    const toggleBtn = document.getElementById('toggleSidebar');
    const sidebar = document.querySelector('.sidebar');

    function atualizarPosicaoBotao() {
        toggleBtn.style.left = sidebar.classList.contains('recolhida') ? '10px' : '190px';
    }

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('recolhida');
            atualizarPosicaoBotao();
        });

        atualizarPosicaoBotao();
    }
});

// IndexedDB

let db = null;

function abrirDB() {
    const request = indexedDB.open("avaliacaoAlunosDB", 1);

    request.onupgradeneeded = (e) => {
        db = e.target.result;
        for (let i = 1; i <= 8; i++) {
            const semana = `semana${i}`;
            if (!db.objectStoreNames.contains(semana)) {
                db.createObjectStore(semana, { keyPath: 'id' });
            }
        }
    };

    request.onsuccess = (e) => db = e.target.result;
    request.onerror = () => alert("Erro ao abrir o banco de dados.");
}

function salvarAluno(aluno, semana, callback) {
    const tx = db.transaction(semana, "readwrite");
    const store = tx.objectStore(semana);
    store.add(aluno).onsuccess = () => callback && callback();
}

function atualizarAluno(alunoAtualizado, semana) {
    const tx = db.transaction(semana, "readwrite");
    const store = tx.objectStore(semana);
    store.put(alunoAtualizado);
}

function removerAluno(aluno, semana) {
    const tx = db.transaction(semana, "readwrite");
    const store = tx.objectStore(semana);
    store.delete(aluno.id);
}

function carregarAlunos(semana, container) {
    const tx = indexedDB.open("avaliacaoAlunosDB", 1);
    tx.onsuccess = (e) => {
        const db = e.target.result;
        const store = db.transaction(semana, "readonly").objectStore(semana);
        const request = store.openCursor();

        request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                criarAluno(cursor.value, container, semana);
                cursor.continue();
            }
        };
    };
}

// UI

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

// Reduz imagem
function redimensionarImagem(imagemOriginal, callback) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const MAX_WIDTH = 120;
    const MAX_HEIGHT = 120;

    const img = new Image();
    img.onload = function() {
        let width = img.width;
        let height = img.height;

        if (width > height) {
            if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
            }
        } else {
            if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
            }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const resizedDataUrl = canvas.toDataURL("image/jpeg", 0.5); // qualidade melhor
        callback(resizedDataUrl);
    };

    img.onerror = function() {
        alert("Erro ao processar a imagem.");
    };

    img.src = imagemOriginal;
}
