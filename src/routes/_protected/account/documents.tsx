import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, FileText, Trash2, Calendar, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { uploadDocument, fetchDocuments, type Document } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_protected/account/documents")({
    component: RouteComponent,
});

function RouteComponent() {
    const { user } = useRouteContext({ from: "/_protected" });
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [textTitle, setTextTitle] = useState("");
    const [textContent, setTextContent] = useState("");
    const [showTextInput, setShowTextInput] = useState(false);

    const loadDocuments = async () => {
        try {
            setIsLoading(true);
            const response = await fetchDocuments();
            setDocuments(response.documents || []);
        } catch (error) {
            toast.error("Failed to load documents: " + (error instanceof Error ? error.message : "Unknown error"));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadDocuments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    const handleFileUpload = async (file: File | null, text: string | null, title: string) => {
        if (!file && !text) {
            toast.error("Please provide a file or text");
            return;
        }

        setIsUploading(true);
        try {
            await uploadDocument(file, text, title);
            toast.success("Document uploaded successfully!");
            setTextTitle("");
            setTextContent("");
            setShowTextInput(false);
            await loadDocuments();
        } catch (error) {
            toast.error("Upload failed: " + (error instanceof Error ? error.message : "Unknown error"));
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const title = file.name.replace(/\.[^/.]+$/, "");
            await handleFileUpload(file, null, title);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            const title = file.name.replace(/\.[^/.]+$/, "");
            await handleFileUpload(file, null, title);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = () => {
        setDragActive(false);
    };

    const handleTextSubmit = () => {
        if (textContent.trim()) {
            const title = textTitle.trim() || "Text Document";
            handleFileUpload(null, textContent.trim(), title);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Documents</h1>
                    <p className="text-muted-foreground">Manage your knowledge base files</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowTextInput(!showTextInput)}>
                        {showTextInput ? "Cancel" : "Add Text"}
                    </Button>
                    <Button className="gap-2" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                        {isUploading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="h-4 w-4" />
                                Upload Files
                            </>
                        )}
                    </Button>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt,.md"
                    onChange={handleFileSelect}
                    className="hidden"
                />
            </div>

            {showTextInput && (
                <Card className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Document Title</label>
                            <input
                                type="text"
                                placeholder="Enter document title..."
                                className="w-full px-3 py-2 border border-border rounded-md bg-background"
                                value={textTitle}
                                onChange={(e) => setTextTitle(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Text Content</label>
                            <textarea
                                placeholder="Paste or type your text content here..."
                                className="w-full px-3 py-2 border border-border rounded-md bg-background min-h-[200px]"
                                value={textContent}
                                onChange={(e) => setTextContent(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => {
                                setShowTextInput(false);
                                setTextTitle("");
                                setTextContent("");
                            }}>
                                Cancel
                            </Button>
                            <Button onClick={handleTextSubmit} disabled={!textContent.trim() || isUploading}>
                                {isUploading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    "Upload Text"
                                )}
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            <Card
                className={`border-2 border-dashed p-12 text-center transition-all cursor-pointer ${
                    dragActive
                        ? "border-primary bg-accent/50"
                        : "border-border hover:border-primary/50 hover:bg-accent/50"
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => !showTextInput && fileInputRef.current?.click()}
            >
                <div className="flex flex-col items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-accent flex items-center justify-center">
                        <Upload className="h-8 w-8 text-accent-foreground" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Drag and drop files here</h3>
                        <p className="text-sm text-muted-foreground">or click to browse • PDF, TXT, MD supported</p>
                    </div>
                    {!showTextInput && <Button variant="outline">Browse Files</Button>}
                </div>
            </Card>

            <div>
                <h2 className="text-xl font-semibold mb-4">
                    Your Documents ({isLoading ? "..." : documents.length})
                </h2>
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : documents.length === 0 ? (
                    <Card className="p-12 text-center">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">No documents yet. Upload your first document to get started!</p>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {documents.map((doc) => (
                            <Card key={doc.id} className="p-6 hover:shadow-md transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center">
                                            <FileText className="h-6 w-6 text-accent-foreground" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold mb-1">{doc.title}</h3>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span>{doc.chunks} chunks</span>
                                                {doc.created_at && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(doc.created_at).toLocaleDateString()}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
