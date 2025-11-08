import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, FileText, Trash2, Calendar } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_protected/account/documents")({
    component: RouteComponent,
});

interface Document {
    id: string;
    name: string;
    type: string;
    size: string;
    date: string;
}

function RouteComponent() {
    const [documents] = useState<Document[]>([
        {
            id: "1",
            name: "Q4 Business Report.pdf",
            type: "PDF",
            size: "2.4 MB",
            date: "2025-01-15",
        },
        {
            id: "2",
            name: "Product Roadmap.docx",
            type: "DOCX",
            size: "1.1 MB",
            date: "2025-01-10",
        },
        {
            id: "3",
            name: "Research Notes.txt",
            type: "TXT",
            size: "156 KB",
            date: "2025-01-08",
        },
    ]);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Documents</h1>
                    <p className="text-muted-foreground">Manage your knowledge base files</p>
                </div>
                <Button className="gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Files
                </Button>
            </div>

            <Card className="border-2 border-dashed border-border p-12 text-center hover:border-primary/50 hover:bg-accent/50 transition-all cursor-pointer">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-accent flex items-center justify-center">
                        <Upload className="h-8 w-8 text-accent-foreground" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Drag and drop files here</h3>
                        <p className="text-sm text-muted-foreground">or click to browse • PDF, DOCX, TXT, MD supported</p>
                    </div>
                    <Button variant="outline">Browse Files</Button>
                </div>
            </Card>

            <div>
                <h2 className="text-xl font-semibold mb-4">Your Documents ({documents.length})</h2>
                <div className="space-y-3">
                    {documents.map((doc) => (
                        <Card key={doc.id} className="p-6 hover:shadow-md transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center">
                                        <FileText className="h-6 w-6 text-accent-foreground" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold mb-1">{doc.name}</h3>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span>{doc.type}</span>
                                            <span>•</span>
                                            <span>{doc.size}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {doc.date}
                                            </span>
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
            </div>
        </div>
    );
}
