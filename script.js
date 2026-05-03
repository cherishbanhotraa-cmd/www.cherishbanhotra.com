const releases = [
  {
    title: 'Roothe Roothe',
    artists: 'Harjas Harjaayi, Cherish Banhotra, Sshiv',
    spotify: 'https://open.spotify.com/track/4f8G5x6a7Vj8QxjP6Pp2R8',
    youtube: 'https://youtu.be/'
  },
  {
    title: 'Tumhari Tasveeren',
    artists: 'Harjas Harjaayi, Cherish Banhotra, Sshiv',
    spotify: 'https://open.spotify.com/track/5vWgD2Q4fAgjM9QCYGxKTv',
    youtube: 'https://youtu.be/'
  }
];

const menuBtn = document.getElementById('menuBtn');
const menu = document.getElementById('menu');
menuBtn.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
});

const cards = document.getElementById('musicCards');
cards.innerHTML = releases.map(r => `
  <article class="card">
    <h3>${r.title}</h3>
    <p>${r.artists}</p>
    <a href="${r.spotify}" target="_blank" rel="noopener">Spotify</a>
  </article>
`).join('');
