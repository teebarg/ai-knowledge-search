import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import rehypeHighlight from 'rehype-highlight'

interface MarkdownProps {
    children: string;
}

export default function MarkdownUI({ children }: MarkdownProps) {
    return (
        <div className="prose prose-lg max-w-none dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight, remarkGfm]}>{children}</ReactMarkdown>
        </div>
    );
}
