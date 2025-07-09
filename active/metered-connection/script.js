pre.innerHTML += `navigator.connection.metered = ${navigator.connection.metered}<br/>`;
pre.innerHTML += `navigator.connection.downlink = ${navigator.connection.downlink}<br/>`;
pre.innerHTML += `navigator.connection.effectiveType = ${navigator.connection.effectiveType}<br/>`;
pre.innerHTML += `navigator.connection.rtt = ${navigator.connection.rtt}<br/>`;
pre.innerHTML += `navigator.connection.saveData = ${navigator.connection.saveData}<br/>`;
pre.innerHTML += `navigator.onLine = ${navigator.onLine}<br/>`;
pre.innerHTML += "<br/>";

navigator.connection.onchange = () => {
  pre.innerHTML += `[change] navigator.connection.metered = ${navigator.connection.metered}<br/>`;
  pre.innerHTML += `[change] navigator.connection.downlink = ${navigator.connection.downlink}<br/>`;
  pre.innerHTML += `[change] navigator.connection.effectiveType = ${navigator.connection.effectiveType}<br/>`;
  pre.innerHTML += `[change] navigator.connection.rtt = ${navigator.connection.rtt}<br/>`;
  pre.innerHTML += `[change] navigator.connection.saveData = ${navigator.connection.saveData}<br/>`;
  pre.innerHTML += `[change] navigator.onLine = ${navigator.onLine}<br/>`;
  pre.innerHTML += "<br/>";
};
