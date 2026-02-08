// app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA8aHxI4Iede-kzP7h2Fg6x2cL0skzH9Kg",
  authDomain: "portal-bosque.firebaseapp.com",
  projectId: "portal-bosque",
  storageBucket: "portal-bosque.firebasestorage.app",
  messagingSenderId: "1087257982761",
  appId: "1:1087257982761:web:d9f797bf9951b07cc0e938"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;

// Elementos DOM
const emailInput = document.getElementById('email');
const passInput = document.getElementById('pass');
const authNotice = document.getElementById('authNotice');
const appNotice = document.getElementById('appNotice');
const authDiv = document.getElementById('auth');
const appDiv = document.getElementById('app');
const tabla = document.getElementById('tabla');
const entrada = document.getElementById('entrada');
const salida = document.getElementById('salida');
const fecha = document.getElementById('fecha');
const mes = document.getElementById('mes');
const totalDiv = document.getElementById('total');

function notice(msg,target='auth'){ 
  const el = target==='app' ? appNotice : authNotice;
  el.textContent = msg;
  el.classList.remove('hidden');
  setTimeout(()=>el.classList.add('hidden'),3000);
}

// Inicializa fecha y mes
const now = new Date();
fecha.value = now.toISOString().slice(0,10);
mes.value = now.toISOString().slice(0,7);

// Registro
document.getElementById('btnRegister').onclick = async ()=>{
  if(!emailInput.value||!passInput.value){ notice('Completa los datos'); return; }
  try{
    await createUserWithEmailAndPassword(auth,emailInput.value,passInput.value);
    notice('✅ Cuenta creada correctamente');
  }catch(e){ notice(e.message); }
};

// Login
document.getElementById('btnLogin').onclick = async ()=>{
  if(!emailInput.value||!passInput.value){ notice('Completa los datos'); return; }
  try{
    await signInWithEmailAndPassword(auth,emailInput.value,passInput.value);
    currentUser = emailInput.value;
    authDiv.classList.add('hidden');
    appDiv.classList.remove('hidden');
    render();
  }catch(e){ notice('Datos incorrectos'); }
};

// Logout
document.getElementById('btnLogout').onclick = async ()=>{
  await signOut(auth);
  currentUser=null;
  authDiv.classList.remove('hidden');
  appDiv.classList.add('hidden');
};

// Guardar horario
document.getElementById('btnGuardar').onclick = async ()=>{
  if(!fecha.value||!entrada.value||!salida.value) return;
  const f = fecha.value.split('-').reverse().join('/');
  await addDoc(collection(db,'horarios'),{
    user: currentUser,
    fecha: f,
    entrada: entrada.value,
    salida: salida.value,
    timestamp: Date.now()
  });
  entrada.value=''; salida.value='';
  render();
};

// Renderizar tabla
async function render(){
  tabla.innerHTML='';
  let totalMin =0;
  const q = query(collection(db,'horarios'),where('user','==',currentUser),orderBy('timestamp','desc'));
  const snapshot = await getDocs(q);
  snapshot.forEach(docSnap=>{
    const d = docSnap.data();
    const mins = (d.salida.split(':')[0]*60 + +d.salida.split(':')[1]) - (d.entrada.split(':')[0]*60 + +d.entrada.split(':')[1]);
    totalMin+=mins;
    tabla.innerHTML += `<tr>
      <td>${d.fecha}</td>
      <td>${d.entrada}</td>
      <td>${d.salida}</td>
      <td>${String(Math.floor(mins/60)).padStart(2,'0')}:${String(mins%60).padStart(2,'0')} hs</td>
      <td></td>
    </tr>`;
  });
  totalDiv.textContent = `Total del mes: ${String(Math.floor(totalMin/60)).padStart(2,'0')}:${String(totalMin%60).padStart(2,'0')} hs`;
}

// Compartir por WhatsApp
document.getElementById('btnShare').onclick = ()=>{
  const phone = prompt('Número de celular (con código país):');
  if(!phone) return;
  let text = '🕒 Horario Portal Bosque\n';
  tabla.querySelectorAll('tr').forEach(tr=>{
    text += tr.cells[0].textContent + ' | ' + tr.cells[1].textContent + ' - ' + tr.cells[2].textContent + ' | ' + tr.cells[3].textContent + '\n';
  });
  const url = `https://wa.me/${phone}?text=` + encodeURIComponent(text);
  window.open(url,'_blank');
};

// Registrar service worker para PWA
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('service-worker.js').then(()=>console.log('SW registrado'));
}
