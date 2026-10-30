// The thin blue loading bar at the top of the planner pages (#nav-progress,
// rendered by BottomNav.astro). Started when a nav link is tapped, and again
// on the new page while its data loads, so it stays visible until the page
// is ready.

const CREEP = 'width 1.8s cubic-bezier(0.1, 0.5, 0.1, 1), opacity 0.2s';

function bar() {
  return document.getElementById('nav-progress');
}

// Show the bar and let it creep towards 85%. `from` lets the new page pick
// up roughly where the previous page's bar left off.
export function startNavProgress(from = 0) {
  const b = bar();
  if (!b) return;
  b.style.transition = 'none';
  b.style.width = `${from}%`;
  b.style.opacity = '1';
  void b.offsetWidth; // apply the start width before animating
  b.style.transition = CREEP;
  b.style.width = '85%';
}

// Fill to 100%, then fade out and reset.
export function finishNavProgress() {
  const b = bar();
  if (!b || b.style.opacity !== '1') return;
  b.style.transition = 'width 0.2s ease-out, opacity 0.3s ease 0.2s';
  b.style.width = '100%';
  b.style.opacity = '0';
  setTimeout(() => {
    if (b.style.opacity !== '0') return; // restarted meanwhile
    b.style.transition = 'none';
    b.style.width = '0%';
  }, 550);
}
