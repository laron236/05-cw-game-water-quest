// charity: water side panel facts (rotates every 12s, independent of fact bar)
const cwSideFacts = [
  "100% of public donations fund clean water projects.",
  "Over 17.5 million people now have clean water thanks to charity: water.",
  "Every $40 can bring clean water to one person.",
  "More than 137,000 water projects funded in 29 countries.",
  "Follow @charitywater on social media to spread the word!",
  "Women and children spend 200 million hours a day collecting water.",
  "Clean water changes everything. Join the mission!"
];

function setSideFact() {
  const el = document.getElementById('cw-side-fact');
  if (!el) return;
  let last = el.getAttribute('data-last-fact');
  let idx;
  do {
    idx = Math.floor(Math.random() * cwSideFacts.length);
  } while (cwSideFacts[idx] === last && cwSideFacts.length > 1);
  el.textContent = cwSideFacts[idx];
  el.setAttribute('data-last-fact', cwSideFacts[idx]);
}

window.addEventListener('DOMContentLoaded', () => {
  setSideFact();
  setInterval(setSideFact, 12000);
});
