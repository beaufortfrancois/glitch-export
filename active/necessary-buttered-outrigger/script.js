button.onclick = async () => {
  const response = await fetch(
    "https://cdn.glitch.com/f6c02be4-2f4b-4e26-afba-802fcba5c8df%2FExample%20Domain.pdf"
  );
  const arrayBuffer = await response.arrayBuffer();

  const portableDocumentFile = new File([arrayBuffer], "hello.pdf", {
    type: "application/pdf"
  });
  const files = [portableDocumentFile];
  if (navigator?.canShare({ files })) {
    // Share PDF file
    navigator.share({ files });
  }
};

button.onclick = async () => {
  console.log('click')
  const response = await fetch(
    "https://cdn.glitch.com/a9975ea6-8949-4bab-addb-8a95021dc2da%2Fillustration.svg"
  );
  const arrayBuffer = await response.arrayBuffer();

        const textFile = new File([arrayBuffer], 'hello.txt', {type:'text/plain'});

  const svgFile = new File([], "hello.txt", {
    type: "image/svg"
  });
  const files = [textFile];
  if (navigator?.canShare({ files })) {
    // Share SVG file
    console.log('canShare');
    await navigator.share({ files });
  }
};