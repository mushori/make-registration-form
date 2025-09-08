// ===== Utilities (LocalStorage DB) =====
const DB_KEY = 'registrations';
const getDb = () => JSON.parse(localStorage.getItem(DB_KEY) || '[]');
const setDb = (rows) => localStorage.setItem(DB_KEY, JSON.stringify(rows));

// ===== Routing (switch views) =====
const views = {
  login: document.getElementById('view-login'),
  register: document.getElementById('view-register'),
  database: document.getElementById('view-database'),
};
const navButtons = Array.from(document.querySelectorAll('[data-view]'));

function show(view){
  Object.values(views).forEach(v=>v.style.display='none');
  views[view].style.display='block';
  navButtons.forEach(b=>b.classList.toggle('active', b.dataset.view===view));
  if(view==='database') renderTable();
}

navButtons.forEach(btn=>btn.addEventListener('click',(e)=>{
  e.preventDefault(); // prevent anchor default navigation if any
  const view = btn.dataset.view;
  if(view!=='login' && !state.isAuth){
    alert('Silakan login terlebih dahulu.');
    return;
  }
  show(view);
}));

// ===== Auth (demo) =====
const state = {
  isAuth: false,
  user: null,
  allowUser: {username:'admin', password:'admin123'}
};

const elAuthName = document.getElementById('authName');
const elAuthDot = document.getElementById('authDot');
const btnLogout = document.getElementById('btnLogout');

document.getElementById('formLogin').addEventListener('submit', (e)=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  const username = fd.get('username').trim();
  const password = fd.get('password').trim();
  if(username===state.allowUser.username && password===state.allowUser.password){
    state.isAuth = true; state.user = username;
    elAuthName.textContent = 'Login sebagai ' + username;
    elAuthDot.style.display='inline-block';
    btnLogout.style.display='block';
    show('register');
  }else{
    alert('Username atau password salah. Coba lagi.');
  }
});

btnLogout.addEventListener('click', ()=>{
  state.isAuth=false; state.user=null; 
  elAuthName.textContent='Belum login'; elAuthDot.style.display='none';
  btnLogout.style.display='none';
  show('login');
});

// ===== Register =====
document.getElementById('formRegister').addEventListener('submit', (e)=>{
  e.preventDefault();
  if(!state.isAuth){ alert('Anda belum login'); return; }
  const fd = new FormData(e.target);
  const row = {
    nrp: fd.get('nrp').trim(),
    nama: fd.get('nama').trim(),
    jurusan: fd.get('jurusan') || '',
    email: fd.get('email').trim(),
    password: fd.get('passwordReg'), // disimpan hanya untuk simulasi; JANGAN lakukan ini pada produksi
    wa: fd.get('wa').trim(),
    jk: fd.get('jk') || '',
    alamat: fd.get('alamat').trim(),
    createdAt: new Date().toISOString()
  };
  // simple duplicate check by NIM/Email
  const db = getDb();
  const dupe = db.find(x=>x.nrp===row.nrp || x.email.toLowerCase()===row.email.toLowerCase());
  if(dupe){
    alert('NIM atau Email sudah terdaftar.');
    return;
  }
  db.push(row); setDb(db);
  alert('Data berhasil disimpan!');
  e.target.reset();
  show('database');
});

// ===== Database Table =====
function renderTable(){
  const tbody = document.querySelector('#tableDb tbody');
  tbody.innerHTML='';
  const rows = getDb();
  document.getElementById('countBadge').textContent = rows.length;
  rows.forEach((r,i)=>{
    const tr = document.createElement('tr');
    const fmt = new Date(r.createdAt).toLocaleString();
    tr.innerHTML = `
      <td>${i+1}</td>
      <td>${r.nrp}</td>
      <td>${r.nama}</td>
      <td>${r.jurusan}</td>
      <td>${r.email}</td>
      <td>${r.wa}</td>
      <td>${r.jk}</td>
      <td>${r.alamat}</td>
      <td>${fmt}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Export JSON & Clear
document.getElementById('btnExport').addEventListener('click', ()=>{
  const blob = new Blob([JSON.stringify(getDb(), null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'database-registrasi.json'; a.click();
  URL.revokeObjectURL(url);
});
document.getElementById('btnClear').addEventListener('click', ()=>{
  if(confirm('Yakin ingin mengosongkan database?')){ setDb([]); renderTable(); }
});

// Misc
document.getElementById('year').textContent = new Date().getFullYear();
