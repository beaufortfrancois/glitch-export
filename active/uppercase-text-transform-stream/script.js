const LOREM_IPSUM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sic enim censent, oportunitatis esse beate vivere. Non quam nostram quidem, inquit Pomponius iocans; Itaque primos congressus copulationesque et consuetudinum instituendarum voluntates fieri propter voluptatem; Duo Reges: constructio interrete. Id enim ille summum bonum eu)qumi/an et saepe a)qambi/an appellat, id est animum terrore liberum. An eum discere ea mavis, quae cum plane perdidiceriti nihil sciat? Nam quid possumus facere melius? Alia quaedam dicent, credo, magna antiquorum esse peccata, quae ille veri investigandi cupidus nullo modo ferre potuerit. Itaque illa non dico me expetere, sed legere, nec optare, sed sumere, contraria autem non fugere, sed quasi secernere. Quae qui non vident, nihil umquam magnum ac cognitione dignum amaverunt.";

const upperCaseTextTransformStream = new TransformStream({
  transform(chunk, controller) {
    controller.enqueue(chunk.toUpperCase());
  },
  flush(controller) {
    controller.terminate();
  }
});

const loremIpsumstream = new ReadableStream({
  async start(controller) {
    for (const char of LOREM_IPSUM) {
      firstParagraph.textContent += char;
      await new Promise(resolve => setTimeout(resolve, 10));
      controller.enqueue(char);
    }
    controller.close();
  }
});

(async () => {
  const stream = loremIpsumstream.pipeThrough(upperCaseTextTransformStream);
  const reader = stream.getReader();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    secondParagraph.textContent += value;
  }
})();
