
class LineBreakLogger {
  constructor() {
    // A container for holding stream data until a new line.
    this.chunks = "";
  }

  transform(chunk) {
    // Append new chunks to existing chunks.
    this.chunks += chunk;
    // For each line breaks in chunks, send the parsed lines out.
    const lines = this.chunks.split("\r\n");
    this.chunks = lines.pop();
    lines.forEach((line) => console.log(line));
  }
}

lineBreakTransformer = new LineBreakLogger();
lineBreakTransformer.transform('hello ');
lineBreakTransformer.transform('joe\r\nhow');
lineBreakTransformer.transform(' are you today?');
lineBreakTransformer.transform('\r\n');