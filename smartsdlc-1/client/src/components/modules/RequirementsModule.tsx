import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CloudUpload, Download } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { Requirement } from '@shared/schema';

interface ClassificationStats {
  Requirements: number;
  Design: number;
  Development: number;
  Testing: number;
  Deployment: number;
}

interface UploadResult {
  document: any;
  requirements: Requirement[];
  statistics: ClassificationStats;
  extractedText: string;
}

export default function RequirementsModule() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractedText, setExtractedText] = useState('');
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [statistics, setStatistics] = useState<ClassificationStats>({
    Requirements: 0,
    Design: 0,
    Development: 0,
    Testing: 0,
    Deployment: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetch('/api/requirements/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      return response.json() as Promise<UploadResult>;
    },
    onMutate: () => {
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);
    },
    onSuccess: (data) => {
      setUploadProgress(100);
      setExtractedText(data.extractedText);
      setRequirements(data.requirements);
      setStatistics(data.statistics);
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({
        title: "Document processed successfully",
        description: `Extracted ${data.requirements.length} requirements`,
      });
    },
    onError: (error) => {
      setUploadProgress(0);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to process PDF",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (file: File) => {
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const exportUserStories = () => {
    const userStories = requirements
      .filter(req => req.userStory)
      .map(req => `${req.phase}: ${req.userStory}`)
      .join('\n\n');

    const element = document.createElement('a');
    const file = new Blob([userStories], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'user-stories.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast({
      title: "User stories exported",
      description: "User stories have been downloaded as a text file",
    });
  };

  const getPhaseColor = (phase: string) => {
    const colors: Record<string, string> = {
      Requirements: 'bg-chart-1',
      Design: 'bg-chart-2',
      Development: 'bg-chart-3',
      Testing: 'bg-chart-4',
      Deployment: 'bg-chart-5',
    };
    return colors[phase] || 'bg-gray-500';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="requirements-module">
      {/* PDF Upload Section */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload Requirements Document</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload Dropzone */}
            <div
              className="file-dropzone rounded-lg p-8 text-center cursor-pointer"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              data-testid="file-dropzone"
            >
              <div className="mb-4">
                <CloudUpload className="mx-auto h-12 w-12 text-muted-foreground" />
              </div>
              <p className="text-sm text-foreground mb-2">Drop your PDF file here or click to browse</p>
              <p className="text-xs text-muted-foreground">Supports PDF files up to 10MB</p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={handleFileInput}
                data-testid="input-file-upload"
              />
              <Button variant="secondary" className="mt-4" disabled={uploadMutation.isPending}>
                Browse Files
              </Button>
            </div>

            {/* Upload Progress */}
            {uploadMutation.isPending && (
              <div data-testid="upload-progress">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-foreground">Processing document...</span>
                  <span className="text-muted-foreground">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            {/* Extracted Text Preview */}
            {extractedText && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Extracted Text Preview</h4>
                <div className="bg-muted rounded-lg p-4 text-sm text-muted-foreground font-mono max-h-32 overflow-y-auto">
                  {extractedText}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Classification Results */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>AI Classification Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Classification Stats */}
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(statistics).map(([phase, count]) => (
                <div key={phase} className="text-center p-4 bg-muted rounded-lg">
                  <div className={`text-2xl font-bold text-chart-${['Requirements', 'Design', 'Development', 'Testing', 'Deployment'].indexOf(phase) + 1}`}>
                    {count}
                  </div>
                  <div className="text-xs text-muted-foreground">{phase}</div>
                </div>
              ))}
            </div>

            {/* Generated User Stories */}
            {requirements.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground">Generated User Stories</h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {requirements
                    .filter(req => req.userStory)
                    .map(req => (
                      <div key={req.id} className="bg-muted rounded-lg p-4" data-testid={`user-story-${req.id}`}>
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={`${getPhaseColor(req.phase)} text-white`}>
                            {req.phase}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Confidence: {req.confidence}%
                          </span>
                        </div>
                        <p className="text-sm text-foreground">{req.userStory}</p>
                      </div>
                    ))}
                </div>

                <Button 
                  onClick={exportUserStories} 
                  className="w-full"
                  disabled={requirements.length === 0}
                  data-testid="button-export-stories"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export User Stories
                </Button>
              </div>
            )}

            {requirements.length === 0 && !uploadMutation.isPending && (
              <div className="text-center py-8 text-muted-foreground">
                Upload a PDF document to see AI classification results
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
