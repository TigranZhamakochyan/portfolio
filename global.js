
console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// let navLinks = $$("nav a");

// let currentLink = navLinks.find(
//   (a) => a.host === location.host && a.pathname === location.pathname,
// );
// currentLink?.classList.add('current');


let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'contact/', title: 'Contact' },
  { url: 'resume/', title: 'Resume' },
  { url: 'https://github.com/TigranZhamakochyan', title: 'GitHub' },
];

let nav = document.createElement('nav');
document.querySelector('h1').after(nav);

const BASE_PATH = "/portfolio/";

for (let p of pages) {
  let url = p.url;
  let title = p.title;

  if (!url.startsWith('http')) {
    url = BASE_PATH + url;
  }

  nav.insertAdjacentHTML(
    'beforeend',
    `<a href="${url}">${title}</a>`
  );
}