// import { marked } from 'https://cdn.jsdelivr.net/npm/marked@latest/lib/marked.esm.js';

(async () => {
  const tootsOutput = document.querySelector('.toots');
  const topicsOutput = document.querySelector('.topics');
  const tootTemplate = document.querySelector('#toot');
  const aiTootTemplate = document.querySelector('#ai-toot');

  const EVENT_SOURCE_URLS = [
    // 'https://toot.cafe/api/v1/streaming/public?access_token=lkeyrdnWyOW_p4GEEWWBadPjHshRLbs4i6Giq_U7KgA',
    // 'https://streaming.mastodon.social/api/v1/streaming/hashtag?tag=cats&access_token=Oo1yd7KpqsEOz2FAE7b-iy3faASc4ulanaspoN8HwOc',
    // 'https://streaming.mastodon.social/api/v1/streaming/hashtag?tag=catsofmastodon&access_token=Oo1yd7KpqsEOz2FAE7b-iy3faASc4ulanaspoN8HwOc',
    // 'https://streaming.mastodon.social/api/v1/streaming/hashtag?tag=caturday&access_token=Oo1yd7KpqsEOz2FAE7b-iy3faASc4ulanaspoN8HwOc',    
    'https://streaming.mastodon.social/api/v1/streaming/public?access_token=Oo1yd7KpqsEOz2FAE7b-iy3faASc4ulanaspoN8HwOc',
  ];

  const separator = '***************';
  const maxToots = 5;

  let pending = false;

  let session = null;
  try {
    session = await self.ai.languageModel.create();
    console.log(session);
  } catch (err) {
    console.error(err.name, err.message);
    alert(err.message);
    return;
  }

  let summarizer = null;
  try {
    summarizer = await self.ai.summarizer.create({
      sharedContext: `You will summarize Mastodon toots separated by "${separator}". Each toot has nothing to do with the others.`,
      type: 'key-points',
      format: 'plain-text',
      length: 'long',
    });
    console.log(summarizer);
  } catch (err) {
    console.error(err.name, err.message);
    alert(err.message);
    return;
  }

  let languageDetector = null;
  try {
    languageDetector = await self.ai.languageDetector.create();
  } catch (err) {
    console.error(err.name, err.message);
    alert(err.message);
    return;
  }

  const onUpdate = async (e) => {
    const data = JSON.parse(e.data);
    if (!(data.content && data.language)) {
      return;
    }
    const text = data.content;
    const language = languageTagToHumanReadable(data.language, 'en');
    const detectedLanguage = languageTagToHumanReadable(
      (await languageDetector.detect(text))[0].detectedLanguage,
      'en'
    );
    let toot;
    if (!pending && language !== 'English') {
      try {
        pending = true;
        const prompt = `You are a world class English language translator. When you translate, do not translate anything that looks like a URL, or that looks like a hashtag. Hashtags are words that begin with the "#" symbol. Now take this ${language} text and translate it to English:\n${separator}\n${text}\n${separator}`;
        console.log(prompt);
        const sessionClone = await session.clone();
        const stream = sessionClone.promptStreaming(prompt);
        let result = '';
        let previousLength = 0;
        for await (const chunk of stream) {
          const newContent = chunk.slice(previousLength);
          previousLength = chunk.length;
          result += newContent;
        }
        const translation = result;
        pending = false;
        toot = aiTootTemplate.content.cloneNode(true);
        toot.querySelector('.toot').innerHTML = translation.replace(
          /\n/g,
          '<br>'
        );
        toot.querySelector('.prompt').innerHTML = prompt.replace(/\n/g, '<br>');
        toot.querySelector(
          '.original-language'
        ).textContent = `Reported: ${language} (Detected: ${detectedLanguage})`;
      } catch (err) {
        pending = false;
        console.error(err.name, err.message);
        return;
      }
    } else if (language === 'English') {
      toot = tootTemplate.content.cloneNode(true);
      toot.querySelector('.toot').innerHTML = data.content;
      toot.querySelector(
        '.language'
      ).textContent = `Reported: ${language} (Detected: ${detectedLanguage})`;
    } else {
      return;
    }
    while (tootsOutput.children.length >= maxToots) {
      tootsOutput.removeChild(tootsOutput.firstChild);
    }
    tootsOutput.append(toot);
    topicsOutput.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
      inline: 'nearest',
    });
  };

  EVENT_SOURCE_URLS.forEach((EVENT_SOURCE_URL) => {
    const eventSource = new EventSource(EVENT_SOURCE_URL);
    eventSource.addEventListener('update', onUpdate);
  });

  const languageTagToHumanReadable = (languageTag, targetLanguage) => {
    try {
      const displayNames = new Intl.DisplayNames([targetLanguage], {
        type: 'language',
      });
      return displayNames.of(languageTag);
    } catch (err) {
      console.error(err.name, err.message, languageTag, targetLanguage);
    }
  };

  setInterval(async () => {
    const toots = Array.from(tootsOutput.querySelectorAll('.toot'))
      .map((toot) => toot.innerText)
      .join(`\n${separator}\n`)
      .trim();
    if (!toots) {
      return;
    }
    console.log(toots);
    try {
      const stream = summarizer.summarizeStreaming(toots);
      let previousLength = 0;
      topicsOutput.innerHTML = '';
      topicsOutput.style.display = 'block';
      for await (const chunk of stream) {
        const newContent = chunk.slice(previousLength);
        previousLength = chunk.length;        
        topicsOutput.insertAdjacentText('beforeend', newContent);
      }
    } catch (err) {
      console.error(err.name, err.message);
      if (err.name === "AbortError") {
    // alert(toots);
      }

    } finally {
      pending = false;
    }
  }, 20 * 1000);
})();
