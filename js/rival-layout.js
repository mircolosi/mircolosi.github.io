/**
 * RIVAL Layout Interactive Logic
 * Handles smooth scrolling, navbar shrink, publication filter tabs, and mobile navigation
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky Header scroll effect & Active Nav Highlighting
  const header = document.querySelector('.site-header');
  const sections = document.querySelectorAll('section[id], header[id]');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-menu a');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Active Section Tracking
    let currentId = '';
    const scrollPosition = window.scrollY + 120;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  });

  // 2. Mobile Menu Toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
      });
    });
  }

  // 3. Dynamic Typewriter Effect for Hero Headline
  const typeTextElem = document.querySelector('.typed-text');
  if (typeTextElem) {
    const phrases = [
      'Senior Vision & Perception Engineer',
      'Robotics & Computer Vision Engineer',
      'Humanoid State Estimation Specialist',
      '3D Gaussian Splatting & SLAM Researcher'
    ];
    let phraseIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function typeLoop() {
      const currentPhrase = phrases[phraseIdx];
      
      if (isDeleting) {
        typeTextElem.textContent = currentPhrase.substring(0, charIdx - 1);
        charIdx--;
        typingSpeed = 50;
      } else {
        typeTextElem.textContent = currentPhrase.substring(0, charIdx + 1);
        charIdx++;
        typingSpeed = 90;
      }

      if (!isDeleting && charIdx === currentPhrase.length) {
        isDeleting = true;
        typingSpeed = 1800; // Pause on complete text
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        typingSpeed = 400; // Pause before typing new phrase
      }

      setTimeout(typeLoop, typingSpeed);
    }

    typeLoop();
  }

  // 4. Publications Category Filter
  const filterBtns = document.querySelectorAll('.filter-btn');
  const pubCards = document.querySelectorAll('.publication-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');

      pubCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterVal === 'all' || category === filterVal) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 250);
        }
      });
    });
  });

  // 5. Contact Form Handler (Opens user's mail client or displays helpful alert)
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('senderName').value;
      const email = document.getElementById('senderEmail').value;
      const subject = document.getElementById('msgSubject').value;
      const message = document.getElementById('msgBody').value;

      const mailtoUrl = `mailto:colosi@diag.uniroma1.it?subject=${encodeURIComponent(subject + ' [From ' + name + ']')}&body=${encodeURIComponent(message + '\n\nSender Email: ' + email)}`;
      window.location.href = mailtoUrl;
    });
  }
});
