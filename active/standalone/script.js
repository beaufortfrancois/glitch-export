p.innerHTML = `

navigator.standalone: ${navigator.standalone}
<br/>
window.matchMedia("display-mode: standalone").matches: ${window.matchMedia("display-mode: standalone").matches}
<br/>
document.referrer: ${document.referrer}
`;
