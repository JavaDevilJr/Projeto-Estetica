
/*Serviços*/

/**
 * obtemDados.
 * Obtem dados da collection a partir do Firebase.
 * @param {string} collection - Nome da collection no Firebase
 * @return {object} - Uma tabela com os dados obtidos
 */

async function obtemDadosServicos(collection) {
    let spinner = document.getElementById("carregandoDados");
    let tabela = document.getElementById("tabelaDadosServicos");
    await firebase
      .database()
      .ref(collection)
      .orderByChild("nome")
      .on("value", (snapshot) => {
        tabela.innerHTML = "";
        let cabecalho = tabela.insertRow();
        cabecalho.className = "fundo-laranja-escuro";
        cabecalho.insertCell().textContent = "Serviço";
        cabecalho.insertCell().textContent = "Valor";
        snapshot.forEach((item) => {
          // Dados do Firebase
          let db = item.ref._delegate._path.pieces_[0]; //collection
          let id = item.ref._delegate._path.pieces_[1]; //id do registro
          //Criando as novas linhas na tabela
          let novaLinha = tabela.insertRow();
          novaLinha.insertCell().innerHTML =
            "<small>" + item.val().servico + "</small>";
          novaLinha.insertCell().innerHTML = 
            "<small>" + item.val().valor + "</small>";
          novaLinha.insertCell().innerHTML = `<button class='btn btn-sm btn-danger' onclick=remover('${db}','${id}')><i class="bi bi-trash"></i></button>
        <button class='btn btn-sm btn-warning' onclick=carregaDadosAlteracao('${db}','${id}')><i class="bi bi-pencil-square"></i></button>`;
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
        document.getElementById("servico").value = snapshot.val().servico;
        document.getElementById("valor").value = snapshot.val().valor;
      });
  
    document.getElementById("servico").focus();
  }
  
  function salvarServico(event, collection) {
    event.preventDefault(); 
    //Verifica os campos obrigatórios
    if (document.getElementById("servico").value === "") {
      alerta("⚠️É obrigatório informar o serviço!", "warning");
    } 
    else if (document.getElementById("valor").value === "") {
      alerta("⚠️É obrigatório informar o valor!", "warning");
    }
    else {
      incluir(event, collection);
    }
  }
  
  async function incluir(event, collection) {
    let usuarioAtual = firebase.auth().currentUser;
    let botaoSalvar = document.getElementById("btnSalvarServico");
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
        servico: document.getElementById("servico").value.toUpperCase(),
        valor:document.getElementById("valor").value,
        usuarioInclusao: {
          uid: usuarioAtual.uid,
          nome: usuarioAtual.displayName,
          urlImagem: usuarioAtual.photoURL,
          email: usuarioAtual.email,
          dataInclusao: new Date(),
        },
      })
      .then(() => {
        alerta(`✅ Registro incluído com sucesso!`, "success");
        document.getElementById("formCadastroServico").reset(); //limpa o form
        //Limpamos o avatar do cliente
        botaoSalvar.innerHTML = '<i class="bi bi-save-fill"></i> Salvar';
      })
      .catch((error) => {
        alerta("❌ Falha ao incluir: " + error.message, "danger");
      });
  }
  
  async function alterar(event, collection) {
    let usuarioAtual = firebase.auth().currentUser;
    let botaoSalvar = document.getElementById("btnSalvar");
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
        servico: values.servico.toUpperCase(),
        valor: values.valor,
        usuarioInclusao: {
          uid: usuarioAtual.uid,
          nome: usuarioAtual.displayName,
          urlImagem: usuarioAtual.photoURL,
          email: usuarioAtual.email,
          dataInclusao: new Date(),
        },
      })
      .then(() => {
        alerta("✅ Registro alterado com sucesso!", "success");
        document.getElementById("formCadastroServico").reset();
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