const firebaseConfig = {
  apiKey: "AIzaSyBLe7Eri7w_L5HbKBGRdKOyejOHiP5AuK8",
  authDomain: "crud-fatec-guilherme.firebaseapp.com",
  databaseURL: "https://crud-fatec-guilherme-default-rtdb.firebaseio.com",
  projectId: "crud-fatec-guilherme",
  storageBucket: "crud-fatec-guilherme.appspot.com",
  messagingSenderId: "602491180255",
  appId: "1:602491180255:web:1564242cb3f2916402456a",
  measurementId: "G-99T1M3ZGLT",
};

//inicializando o Firebase
firebase.initializeApp(firebaseConfig);
//efetuando a ligação com o database
const database = firebase.database();
