'use strict' //modo estrito
// Atalhos para os elementos DOM - Document Object Model
const formNovoUsuario = document.getElementById('formNovoUsuario')

//Adiciona um Listener no formulário
formNovoUsuario.addEventListener('submit', (event) => {
 const email = document.getElementById('email').value
 const senha = document.getElementById('senha').value
 event.preventDefault()
novoUsuario(email, senha)
}
)


"use strict"; //modo estrito

/**
 * obtemDados.
 * Obtem dados da collection a partir do Firebase.
 * @param {string} collection - Nome da collection no Firebase
 * @return {object} - Uma tabela com os dados obtidos
 */
async function obtemDados(collection) {
  let spinner = document.getElementById("carregandoDados");
  let tabela = document.getElementById("tabelaDados");
  await firebase
    .database()
    .ref(collection)
    .orderByChild("email")
    .on("value", (snapshot) => {
      tabela.innerHTML = "";
      let cabecalho = tabela.insertRow();
      cabecalho.className = "fundo-laranja-escuro";
      cabecalho.insertCell().textContent = "Email";
      cabecalho.insertCell().textContent = "Senha";
      snapshot.forEach((item) => {
        // Dados do Firebase
        let db = item.ref._delegate._path.pieces_[0]; //collection
        let id = item.ref._delegate._path.pieces_[1]; //id do registro
        //Criando as novas linhas na tabela
        let novaLinha = tabela.insertRow();
        novaLinha.insertCell().innerHTML =
          "<small>" + item.val().email + "</small>";
          novaLinha.insertCell().innerHTML =
          "<small>" + item.val().senha + "</small>";
        novaLinha.insertCell().innerHTML = `<button class='btn btn-sm btn-danger' onclick=remover('${db}','${id}')><i class="bi bi-trash"></i></button>`;
      });
      let rodape = tabela.insertRow();
      rodape.className = "fundo-laranja-claro";
      rodape.insertCell().colSpan = "6";
    });
  spinner.classList.add("d-none"); //oculta o carregando...
}

/**
 * obtemDados.
 * Obtem dados da collection a partir do Firebase.
 * @param {string} db - Nome da collection no Firebase
 * @param {integer} id - Id do registro no Firebase
 * @return {object} - Os dados do registro serão vinculados aos inputs do formulário.
 */

async function carregaDadosAlteracao(db, id) {
  await firebase
    .database()
    .ref(db + "/" + id)
    .on("value", (snapshot) => {
      document.getElementById("id").value = id;
      document.getElementById("email").value = snapshot.val().email;
      document.getElementById("senha").value = snapshot.val().senha;
    });

  document.getElementById("email").focus();
}

/**
 * incluir.
 * Inclui os dados do formulário na collection do Firebase.
 * @param {object} event - Evento do objeto clicado
 * @param {string} collection - Nome da collection no Firebase
 * @return {null} - Snapshot atualizado dos dados
 */

function salvar(event, collection) {
  event.preventDefault(); // evita que o formulário seja recarregado
  //Verifica os campos obrigatórios
  if (document.getElementById("email").value === "") {
    alerta("⚠️É obrigatório informar um email!", "warning");
  }
  else if (document.getElementById("senha").value === "") {
    alerta("⚠️É obrigatório informar uma senha!", "warning");
  }
  else {
    incluir(event, collection);
  }
}

async function incluir(event, collection) {
  let usuarioAtual = firebase.auth().currentUser;
  let botaoSalvar = document.getElementById("btnSalvarFunc");
  botaoSalvar.innerText = "Aguarde...";
  event.preventDefault();
  //Obtendo os campos do formulário
  const form = document.forms[0];
  const data = new FormData(form);
  //Obtendo os valores dos campos
  const values = Object.fromEntries(data.entries());
  //Enviando os dados dos campos para o Firebase
  return await firebase
    .database()
    .ref(collection)
    .push({
      email: values.email.toLowerCase(),
      senha: values.senha,
      usuarioInclusao: {
        uid: usuarioAtual.uid,
        email: usuarioAtual.email,
        dataInclusao: new Date(),
      },
    })
    .then(() => {
      alerta(`✅ Registro incluído com sucesso!`, "success");
      document.getElementById("formCadastro").reset(); //limpa o form
      //Limpamos o avatar do cliente
      botaoSalvar.innerHTML = '<i class="bi bi-save-fill"></i> Salvar';
    })
}

async function alterar(event, collection) {
  let usuarioAtual = firebase.auth().currentUser;
  let botaoSalvar = document.getElementById("btnSalvarFunc");
  botaoSalvar.innerText = "Aguarde...";
  event.preventDefault();
  //Obtendo os campos do formulário
  const form = document.forms[0];
  const data = new FormData(form);
  //Obtendo os valores dos campos
  const values = Object.fromEntries(data.entries());
  //Enviando os dados dos campos para o Firebase
  return await firebase
    .database()
    .ref()
    .child(collection + "/" + values.id)
    .update({
      email: values.email.toLowerCase(),
      senha: values.senha.toLowerCase(),
      usuarioAlteracao: {
        uid: usuarioAtual.uid,
        email: values.email,
        dataInclusao: new Date(),
      },
    })
    .then(() => {
      alerta("✅ Registro alterado com sucesso!", "success");
      document.getElementById("formNovoUsuario").reset();
      document.getElementById("id").value = "";
      botaoSalvar.innerHTML = '<i class="bi bi-save-fill"></i> Salvar';
    })
    .catch((error) => {
      console.error(error.code);
      console.error(error.message);
      alerta("❌ Falha ao alterar: " + error.message, "danger");
    });
}

/**
 * remover.
 * Remove os dados da collection a partir do id passado.
 * @param {string} db - Nome da collection no Firebase
 * @param {integer} id - Id do registro no Firebase
 * @return {null} - Snapshot atualizado dos dados
 */
async function remover(db, id) {
  if (window.confirm("⚠️Confirma a exclusão do registro?")) {
    let dadoExclusao = await firebase
      .database()
      .ref()
      .child(db + "/" + id);
    dadoExclusao
      .remove()
      .then(() => {
        alerta("✅ Registro removido com sucesso!", "success");
      })
      .catch((error) => {
        console.error(error.code);
        console.error(error.message);
        alerta("❌ Falha ao excluir: " + error.message, "danger");
      });
  }
}
