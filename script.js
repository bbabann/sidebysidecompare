const stage = document.getElementById('stage');
const divider = document.getElementById('divider');

// Mode toggle
document.querySelectorAll('.mode').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mode').forEach((b) => {
      b.classList.toggle('is-active', b === btn);
      b.setAttribute('aria-selected', b === btn);
    });
    stage.dataset.mode = btn.dataset.mode;
  });
});

divider.addEventListener('input', () => {
  stage.style.setProperty('--pos', `${divider.value}%`);
});

// Image loading via click or drag & drop
document.querySelectorAll('.drop').forEach((drop) => {
  const input = drop.querySelector('input');
  const img = drop.querySelector('img');
  const hint = drop.querySelector('.hint');

  const show = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    img.src = URL.createObjectURL(file);
    img.hidden = false;
    hint.hidden = true;
  };

  input.addEventListener('change', () => show(input.files[0]));
  drop.addEventListener('dragover', (e) => {
    e.preventDefault();
    drop.classList.add('is-over');
  });
  drop.addEventListener('dragleave', () => drop.classList.remove('is-over'));
  drop.addEventListener('drop', (e) => {
    e.preventDefault();
    drop.classList.remove('is-over');
    show(e.dataTransfer.files[0]);
  });
});
