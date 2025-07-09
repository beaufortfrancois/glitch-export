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

      const pageName = new URL(event.destination.url).pathname.match(
        /[^/]*$/
      )[0];

      pageTitle.textContent = pageName
        ? `This is page ${pageName}`
        : `This is the index page!`;

      const shouldResetScroll =
        (event.navigationType === "push" ||
          event.navigationType === "replace") &&
        !event.hashChange;

      if (shouldResetScroll) scrollTo(0, 0);
    })()
  );
});
