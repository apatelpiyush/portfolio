const NAV_BAR = document.getElementById('navBar');
const NAV_LIST = document.getElementById('navList');
const HERO_HEADER = document.getElementById('heroHeader');
const HAMBURGER_BTN = document.getElementById('hamburgerBtn');
const NAV_LINKS = Array.from( document.querySelectorAll('.nav__list-link'));
const SERVICE_BOXES = document.querySelectorAll('.service-card__box');
const ACTIVE_LINK_CLASS = 'active';
const BREAKPOINT = 576;

let currentServiceBG = null;
let currentActiveLink = document.querySelector('.nav__list-link.active');

// Remove the active state once the breakpoint is reached
const resetActiveState = ()=>{
  NAV_LIST.classList.remove('nav--active');
  Object.assign(NAV_LIST.style, {
    height: null
  });
  Object.assign(document.body.style, {
    overflowY: null
  });
}

//Add padding to the header to make it visible because navbar has a fixed position.
const addPaddingToHeroHeaderFn = () => {
  const NAV_BAR_HEIGHT = NAV_BAR.getBoundingClientRect().height;
  const HEIGHT_IN_REM = NAV_BAR_HEIGHT / 10;

  // If hamburger button is active, do not add padding
  if (NAV_LIST.classList.contains('nav--active')) {
    return;
  }
  Object.assign(HERO_HEADER.style, {
    paddingTop: HEIGHT_IN_REM + 'rem'
  });
}
addPaddingToHeroHeaderFn();
window.addEventListener('resize', ()=>{
  addPaddingToHeroHeaderFn();

  // When the navbar is active and the window is being resized, remove the active state once the breakpoint is reached
  if(window.innerWidth >= BREAKPOINT){
    addPaddingToHeroHeaderFn();
    resetActiveState();
  }
});

// As the user scrolls, the active link should change based on the section currently displayed on the screen.
window.addEventListener('scroll', ()=>{
  const sections = document.querySelectorAll('#heroHeader, #services, #works, #contact');

  // Loop through sections and check if they are visible
  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const NAV_BAR_HEIGHT = NAV_BAR.getBoundingClientRect().height;
    if (window.scrollY >= sectionTop - NAV_BAR_HEIGHT) {
      const ID = section.getAttribute('id');
      const LINK = NAV_LINKS.filter(link => {
        return link.href.includes('#'+ID);
      })[0];
      console.log(LINK);
      currentActiveLink.classList.remove(ACTIVE_LINK_CLASS);
      LINK.classList.add(ACTIVE_LINK_CLASS);
      currentActiveLink = LINK;
    }
  });
});

// Shows & hide navbar on smaller screen
HAMBURGER_BTN.addEventListener('click', ()=>{
  NAV_LIST.classList.toggle('nav--active');
  if (NAV_LIST.classList.contains('nav--active')) {
    Object.assign(document.body.style, {
      overflowY: 'hidden'
    });
    Object.assign(NAV_LIST.style, {
      height: '100vh'
    });
    return;
  }
  Object.assign(NAV_LIST.style, {
    height: 0
  });
  Object.assign(document.body.style, {
    overflowY: null
  });
});

// When navbar link is clicked, reset the active state
NAV_LINKS.forEach(link => {
  link.addEventListener('click', ()=>{
    resetActiveState();
    link.blur();
  })
})

// Handles the hover animation on services section
SERVICE_BOXES.forEach(service => {
  const moveBG = (x, y) => {
    Object.assign(currentServiceBG.style, {
      left: x + 'px',
      top: y + 'px',
    })
  }
  service.addEventListener('mouseenter', (e) => {
    if (currentServiceBG === null) {
      currentServiceBG = service.querySelector('.service-card__bg');
    }
    moveBG(e.clientX, e.clientY);
  });
  service.addEventListener('mousemove', (e) => {
    const LEFT = e.clientX - service.getBoundingClientRect().left;
    const TOP = e.clientY - service.getBoundingClientRect().top;
    moveBG(LEFT, TOP);
  });
  service.addEventListener('mouseleave', () => {
    const IMG_POS = service.querySelector('.service-card__illustration')
    const LEFT = IMG_POS.offsetLeft + currentServiceBG.getBoundingClientRect().width;
    const TOP = IMG_POS.offsetTop + currentServiceBG.getBoundingClientRect().height;

    moveBG(LEFT, TOP);
    currentServiceBG = null;
  });
});

// Handles smooth scrolling
new SweetScroll({
  trigger: '.nav__list-link',
  easing: 'easeOutQuint',
  offset: NAV_BAR.getBoundingClientRect().height - 80
});

// ==================
// Auto-load GitHub Repositories into Works
// ==================
(function autoLoadGitHubRepos(){
  const worksList = document.getElementById('worksList');
  if(!worksList){ return; }

  const GITHUB_USERNAME = 'apatelpiyush'; // change if needed
  const MAX_REPOS = 6;
  const PLACEHOLDER_IMG = 'assets/works/sample3.png';

  const createBadge = (text) => {
    const badge = document.createElement('span');
    badge.className = 'work__badge';
    badge.textContent = text;
    return badge;
  }

  const createWorkCard = (repo) => {
    const article = document.createElement('article');
    article.className = 'work';

    const link = document.createElement('a');
    link.className = 'work__box';
    link.href = repo.html_url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', `Open GitHub repository ${repo.name}`);

    const imgBox = document.createElement('span');
    imgBox.className = 'work__img-box';
    const img = document.createElement('img');
    img.src = PLACEHOLDER_IMG;
    img.alt = 'Project preview image';
    imgBox.appendChild(img);

    const title = document.createElement('h3');
    title.className = 'work__title';
    title.textContent = repo.name.replace(/[-_]/g, ' ');

    const badges = document.createElement('span');
    badges.className = 'work__badges';
    if(repo.language){
      badges.appendChild(createBadge(repo.language));
    }

    link.appendChild(imgBox);
    link.appendChild(title);
    link.appendChild(badges);

    article.appendChild(link);
    return article;
  }

  const setLoading = (isLoading, message = 'Loading repositories...') => {
    if(isLoading){
      worksList.innerHTML = `<p class="work__loading">${message}</p>`;
    }else{
      const el = worksList.querySelector('.work__loading');
      if(el){ el.remove(); }
    }
  }

  const showError = (message) => {
    worksList.innerHTML = `<p class="work__error">${message}</p>`;
  }

  const fetchRepos = async () => {
    try{
      setLoading(true);
      const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=50&sort=updated`, { headers: { 'Accept': 'application/vnd.github+json' } });
      if(!res.ok){ throw new Error(`Failed to fetch repos (${res.status})`); }
      const repos = await res.json();

      const filtered = repos
        .filter(r => !r.fork && !r.archived)
        .sort((a,b) => (b.stargazers_count - a.stargazers_count) || (new Date(b.pushed_at) - new Date(a.pushed_at)))
        .slice(0, MAX_REPOS);

      setLoading(false);
      worksList.innerHTML = '';
      if(filtered.length === 0){
        showError('No repositories to display.');
        return;
      }
      filtered.forEach(repo => worksList.appendChild(createWorkCard(repo)));
    }catch(err){
      console.error('Error loading GitHub repos:', err);
      showError('Unable to load GitHub repositories right now. Please try again later.');
    }
  }

  fetchRepos();
})();

// ==================
// Handle Age & DOB display
// ==================
(function updateAgeFromDOB(){
  const aboutItems = Array.from(document.querySelectorAll('.about__item'));
  if(aboutItems.length === 0){ return; }

  const getItemByLabel = (labelText) => aboutItems.find(item => {
    const label = item.querySelector('.about__label');
    return label && label.textContent.trim().toLowerCase() === labelText.toLowerCase();
  });

  const ageItem = getItemByLabel('Age');
  const dobItem = getItemByLabel('DOB');
  if(!ageItem || !dobItem){ return; }

  const ageValueEl = ageItem.querySelector('.about__value');
  const dobValueEl = dobItem.querySelector('.about__value');
  if(!ageValueEl || !dobValueEl){ return; }

  const dobText = dobValueEl.textContent.trim();
  if(!dobText){ dobItem.remove(); return; }

  const parseDOB = (text) => {
    const parts = text.split(/[-/]/).map(part => parseInt(part, 10));
    if(parts.length !== 3 || parts.some(isNaN)){ return null; }
    const [day, month, year] = parts;
    const date = new Date(year, month - 1, day);
    return isNaN(date.getTime()) ? null : date;
  };

  const getAgeDetails = (birthDate) => {
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    const hasHadBirthday =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
    if(!hasHadBirthday){
      years -= 1;
    }
    const isBirthday = today.getMonth() === birthDate.getMonth() && today.getDate() === birthDate.getDate();
    return { years, isBirthday };
  };

  const birthDate = parseDOB(dobText);
  if(!birthDate){
    console.warn('Unable to parse DOB, removing DOB entry without updating age.');
    dobItem.remove();
    return;
  }

  console.info('Recorded DOB for age updates:', dobText);
  const { years, isBirthday } = getAgeDetails(birthDate);
  ageValueEl.textContent = years.toString();
  if(isBirthday){
    ageValueEl.setAttribute('data-celebrate-birthday', 'true');
  }

  dobItem.remove();
})();

// ==================
// Anti-download deterrents for About photo
// ==================
(function protectPhoto(){
  const photoCard = document.querySelector('.about__photo-card');
  const photo = document.querySelector('.about__photo');
  if(!photoCard || !photo) return;

  // Disable context menu
  photoCard.addEventListener('contextmenu', (e) => e.preventDefault());
  photo.addEventListener('contextmenu', (e) => e.preventDefault());

  // Prevent drag
  photo.addEventListener('dragstart', (e) => e.preventDefault());

  // Add invisible overlay to make saving harder
  const overlay = document.createElement('div');
  Object.assign(overlay.style, {
    position: 'absolute',
    inset: '0',
    pointerEvents: 'none'
  });
  // Only append if the card is positioned relative
  photoCard.style.position = 'relative';
  photoCard.appendChild(overlay);
})();