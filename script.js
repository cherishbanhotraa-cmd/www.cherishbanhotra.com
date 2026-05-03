const menuBtn = document.getElementById('menuBtn');
const menu = document.getElementById('menu');
menuBtn.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
});

function renderData(data) {
  const cards = document.getElementById('musicCards');
  cards.innerHTML = data.releases.map((r) => `
    <article class="card">
      <h3>${r.title}</h3>
      <p>${r.artists}</p>
      <a href="${r.spotify}" target="_blank" rel="noopener">Spotify</a>
    </article>
  `).join('');

  const bio = document.querySelector('#bio p');
  if (bio && data.profile.about) bio.textContent = data.profile.about;
}

fetch('/api/dashboard')
  .then((r) => r.json())
  .then(renderData)
  .catch(() => {
    const cards = document.getElementById('musicCards');
    cards.innerHTML = '<p>Unable to load releases right now.</p>';
  });
