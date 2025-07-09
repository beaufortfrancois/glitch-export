const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const siteRoot = new URL("/nav-api/", location).href;
const pageTitle = document.querySelector(".page-title");

navigation.addEventListener("navigate", (event) => {
  if (!event.canTransition || !event.destination.url.startsWith(siteRoot)) {
    return;
  }

  event.transitionWhile(
    (async () => {
      await wait(1000);
      
      throw Error('oops');

      const pageName = new URL(event.destination.url).pathname.match(
        /[^/]*$/
      )[0];

      pageTitle.textContent = pageName
        ? `This is page ${pageName}`
        : `This is the index page!`;
    })()
  );
});
