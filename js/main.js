// Side effect: Adds scroll-based shadow to navigation
function handleNavScroll () {
  var nav = document.getElementById('nav')
  if (window.scrollY > 10) {
    nav.classList.add('scrolled')
  } else {
    nav.classList.remove('scrolled')
  }
}

// Side effect: Toggles mobile menu open/closed state
function toggleMobileMenu () {
  var hamburger = document.getElementById('hamburger')
  var menu = document.getElementById('mobile-menu')
  hamburger.classList.toggle('open')
  menu.classList.toggle('open')
}

// Side effect: Closes mobile menu
function closeMobileMenu () {
  var hamburger = document.getElementById('hamburger')
  var menu = document.getElementById('mobile-menu')
  hamburger.classList.remove('open')
  menu.classList.remove('open')
}

// Side effect: Observes elements and adds 'visible' class for fade-in animation
function initScrollAnimations () {
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
        observer.unobserve(entry.target)
      }
    })
  }, {
    threshold: 0,
    rootMargin: '0px 0px 0px 0px'
  })

  var elements = document.querySelectorAll('.fade-up')
  elements.forEach(function (el) {
    observer.observe(el)
  })
}

// Pure: extracts the page name from a pathname
// Input: pathname string -> Output: filename without extension
function getPageName (pathname) {
  var path = pathname.replace(/\/$/, '/index.html')
  var parts = path.split('/')
  var filename = parts[parts.length - 1] || 'index.html'
  return filename.replace('.html', '')
}

// Side effect: Sets active nav link based on current page URL
function setActiveNavLink () {
  var navLinks = document.querySelectorAll('.nav-link')
  var currentPage = getPageName(window.location.pathname)

  navLinks.forEach(function (link) {
    link.classList.remove('active')
    var linkPage = getPageName(link.getAttribute('href'))
    if (linkPage === currentPage) {
      link.classList.add('active')
    }
  })
}

// Pure: gets stored theme preference from localStorage
// Input: none -> Output: 'light', 'dark', or null
function getStoredTheme () {
  try {
    return localStorage.getItem('theme')
  } catch (e) {
    return null
  }
}

// Side effect: saves theme preference to localStorage
function storeTheme (theme) {
  try {
    localStorage.setItem('theme', theme)
  } catch (e) {
    // localStorage unavailable
  }
}

// Pure: determines effective theme from stored pref and system setting
// Input: stored theme string or null -> Output: 'light' or 'dark'
function getEffectiveTheme (stored) {
  if (stored === 'light' || stored === 'dark') return stored
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
  return 'light'
}

// Side effect: applies theme to document
function applyTheme (theme) {
  document.documentElement.setAttribute('data-theme', theme)
}

// Side effect: toggles between light and dark
function toggleTheme () {
  var current = document.documentElement.getAttribute('data-theme') || 'light'
  var next = current === 'dark' ? 'light' : 'dark'
  applyTheme(next)
  storeTheme(next)
}

// Side effect: initializes theme and wires toggle button
function initTheme () {
  var stored = getStoredTheme()
  var theme = getEffectiveTheme(stored)
  applyTheme(theme)

  var btn = document.getElementById('theme-toggle')
  if (btn) {
    btn.addEventListener('click', toggleTheme)
  }

  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      if (!getStoredTheme()) {
        applyTheme(e.matches ? 'dark' : 'light')
      }
    })
  }
}

// Side effect: Initializes all event listeners and animations on page load
function init () {
  initTheme()
  var hamburger = document.getElementById('hamburger')
  if (hamburger) {
    hamburger.addEventListener('click', toggleMobileMenu)
  }

  var mobileLinks = document.querySelectorAll('.mobile-link')
  mobileLinks.forEach(function (link) {
    link.addEventListener('click', closeMobileMenu)
  })

  window.addEventListener('scroll', handleNavScroll)

  initScrollAnimations()
  setActiveNavLink()
  handleNavScroll()
}

document.addEventListener('DOMContentLoaded', init)
