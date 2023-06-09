/**
 * Copyright 2023 Prof. Ms. Ricardo Leme All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
"use strict"; //modo estrito
function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, ''); // Remove caracteres não numéricos

  if (cpf.length !== 11 || /^\d{11}$/.test(cpf.replace(/(\d)\1{10}/g, ''))) {
    return false; // Verifica se o CPF tem 11 dígitos e se não possui todos os dígitos iguais
  }

  let soma = 0;
  let resto;

  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpf.charAt(i - 1)) * (11 - i);
  }

  resto = (soma * 10) % 11;

  if (resto === 10 || resto === 11) {
    resto = 0;
  }

  if (resto !== parseInt(cpf.charAt(9))) {
    return false; // Verifica o primeiro dígito verificador
  }

  soma = 0;

  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpf.charAt(i - 1)) * (12 - i);
  }

  resto = (soma * 10) % 11;

  if (resto === 10 || resto === 11) {
    resto = 0;
  }

  if (resto !== parseInt(cpf.charAt(10))) {
    return false; // Verifica o segundo dígito verificador
  }

  return true; // CPF válido
}

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
    .orderByChild("nome")
    .on("value", (snapshot) => {
      tabela.innerHTML = "";
      let cabecalho = tabela.insertRow();
      cabecalho.className = "fundo-laranja-escuro";
      cabecalho.insertCell().textContent = "Nome";
      cabecalho.insertCell().textContent = "CPF";
      cabecalho.insertCell().textContent = "Nascimento";
      cabecalho.insertCell().textContent = "Email";
      cabecalho.insertCell().textContent = "Sexo";
      snapshot.forEach((item) => {
        // Dados do Firebase
        let db = item.ref._delegate._path.pieces_[0]; //collection
        let id = item.ref._delegate._path.pieces_[1]; //id do registro
        //Criando as novas linhas na tabela
        let novaLinha = tabela.insertRow();
        novaLinha.insertCell().innerHTML =
          "<small>" + item.val().nome + "</small>";
        novaLinha.insertCell().innerHTML =
          "<small>" + item.val().cpf + "</small>";
        novaLinha.insertCell().textContent = new Date(
          item.val().nascimento
        ).toLocaleDateString("pt-BR", { timeZone: "UTC" });
        novaLinha.insertCell().innerHTML =
          "<small>" + item.val().email + "</small>";
        novaLinha.insertCell().textContent = item.val().sexo;
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
      document.getElementById("nome").value = snapshot.val().nome;
      document.getElementById("cpf").value = snapshot.val().cpf;
      document.getElementById("email").value = snapshot.val().email;
      document.getElementById("nascimento").value = snapshot.val().nascimento;
      if (snapshot.val().sexo === "Masculino") {
        document.getElementById("sexo-0").checked = true;
      }else if(snapshot.val().sexo ==="Feminino") {
        document.getElementById("sexo-1").checked = true;
      }else {
        document.getElementById("sexo-2").checked = true;
      }
    });

  document.getElementById("nome").focus(); //Definimos o foco no campo nome
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
  // Verifica os campos obrigatórios
  if (document.getElementById("nome").value === "") {
    alerta("⚠️ É obrigatório informar o nome!", "warning");
  } else if (document.getElementById("email").value === "") {
    alerta("⚠️ É obrigatório informar o email!", "warning");
  }else if (document.getElementById("cpf").value === "") {
    alerta("⚠️ É obrigatório informar o CPF!", "warning");
  } else if (document.getElementById("nascimento").value === "") {
    alerta("⚠️ É obrigatório informar o nascimento!", "warning");
  } 
   else if (!validarEmail(document.getElementById("email").value)) {
    alerta("⚠️ Informe um email válido!", "warning");
  } else if (!validarCPF(document.getElementById("cpf").value)) {
    alerta("⚠️ Informe um CPF válido!", "warning");
  } else {
    incluir(event, collection);
  }
}

/**
 * validarCPF.
 * Valida o formato do CPF utilizando uma expressão regular.
 * @param {string} cpf - O CPF a ser validado
 * @return {boolean} - true se o CPF for válido, false caso contrário
 */
function validarCPF(cpf) {
  const regex = /^[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2}$/;
  return regex.test(cpf);
}

/**
 * validarEmail.
 * Valida o formato do email utilizando uma expressão regular.
 * @param {string} email - O email a ser validado
 * @return {boolean} - true se o email for válido, false caso contrário
 */
function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

async function incluir(event, collection) {
  let usuarioAtual = firebase.auth().currentUser;
  let botaoSalvar = document.getElementById("btnSalvarClientes");
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
      nome: values.nome.toUpperCase(),
      cpf: values.cpf,
      nascimento: values.nascimento,
      email: values.email.toLowerCase(),
      sexo: values.sexo,
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
      document.getElementById("formCadastro").reset(); //limpa o form
      //Limpamos o avatar do cliente
      botaoSalvar.innerHTML = '<i class="bi bi-save-fill"></i> Salvar';
    })
    .catch((error) => {
      alerta("❌ Falha ao incluir: " + error.message, "danger");
    });
}

async function alterar(event, collection) {
  let usuarioAtual = firebase.auth().currentUser;
  let botaoSalvar = document.getElementById("btnSalvarClientes");
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
      nome: values.nome.toUpperCase(),
      cpf: values.cpf,
      nascimento: values.nascimento,
      email: values.email.toLowerCase(),
      sexo: values.sexo,
      usuarioAlteracao: {
        uid: usuarioAtual.uid,
        nome: usuarioAtual.displayName,
        urlImagem: usuarioAtual.photoURL,
        email: usuarioAtual.email,
        dataAlteracao: new Date(),
      },
    })
    .then(() => {
      alerta("✅ Registro alterado com sucesso!", "success");
      document.getElementById("formCadastro").reset();
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

/**
 * Formata o valor do campo de CPF com pontos e traço enquanto o usuário digita os dados.
 *
 * @param {object} campo - O campo de entrada do CPF.
 */
function formatarCPF(campo) {
  // Remove caracteres não numéricos
  var cpf = campo.value.replace(/\D/g, "");

  // Adiciona pontos e traço conforme o usuário digita
  cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
  cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
  cpf = cpf.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

  // Atualiza o valor do campo
  campo.value = cpf;
}
























