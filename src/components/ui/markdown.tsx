import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const markdownText = `
Based on your documents, I found **5 relevant result(s)**. Here's what I found:

- to ensure that their processing costs are minimized.
- Notifies the Insurer via email
- An explanation of your batching algorithm’s approach

### Evaluation Criteria

**Algorithm Efficiency**
- Computational complexity
- Memory usage
- Scalability characteristics

**Adaptability**
- How well the solution handles changing conditions
- Robustness against varying input patterns

**Code Quality**
- Clean, maintainable implementation
- Comprehensive test coverage
- Clear documentation

**Innovation**
- Creative approach
`;

export default function MarkdownDisplay() {
  return (
    <div className="prose prose-lg max-w-none dark:prose-invert">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdownText}</ReactMarkdown>
    </div>
  );
}
