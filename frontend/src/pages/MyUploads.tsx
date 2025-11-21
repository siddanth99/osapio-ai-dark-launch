import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navigation } from '@/components/Navigation';
import { ProtectedRoute } from '@/components/Auth/ProtectedRoute';
import { 
  FileText, 
  Calendar, 
  Download, 
  Eye, 
  Trash2, 
  Upload,
  Search,
  Filter,
  MoreHorizontal,
  Copy,
  Check
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface FileUpload {
  id: string;
  filename: string;
  file_size: number;
  upload_timestamp: string;
  analysis_status: string;
  user_id: string;
  file_path?: string;
  analysis_result?: string;
  content_type?: string;
}

const MyUploadsContent = () => {
  const { user, getIdToken } = useAuth();
  const navigate = useNavigate();
  const [uploads, setUploads] = useState<FileUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedUpload, setSelectedUpload] = useState<FileUpload | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [uploadToDelete, setUploadToDelete] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedResult, setCopiedResult] = useState(false);

  const fetchUploads = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getIdToken();
      if (!token) {
        console.warn('No auth token available');
        setLoading(false);
        return;
      }

      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
      const url = `${backendUrl}/api/my-uploads`;
      console.log('Fetching uploads from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response status:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('Received uploads data:', data);
        console.log('Number of uploads:', Array.isArray(data) ? data.length : 0);
        setUploads(Array.isArray(data) ? data : []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || `Failed to fetch uploads (${response.status})`;
        console.error('Failed to fetch uploads:', {
          status: response.status,
          statusText: response.statusText,
          error: errorMessage,
          errorData
        });
        
        if (response.status === 503) {
          toast.error('Database unavailable. Please ensure MongoDB is running.');
        } else {
          toast.error(errorMessage);
        }
        setUploads([]);
      }
    } catch (error) {
      console.error('Error fetching uploads:', error);
      toast.error('Failed to fetch uploads');
      setUploads([]);
    } finally {
      setLoading(false);
    }
  }, [getIdToken]);

  useEffect(() => {
    if (user) {
      fetchUploads();
    } else {
      setLoading(false);
    }
  }, [user, fetchUploads]);

  const handleViewDetails = async (uploadId: string) => {
    try {
      setLoadingDetails(true);
      const token = await getIdToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/upload/${uploadId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const uploadDetails = await response.json();
        setSelectedUpload(uploadDetails as FileUpload);
        setDetailsDialogOpen(true);
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.detail || 'Failed to fetch upload details');
      }
    } catch (error) {
      console.error('Error fetching upload details:', error);
      toast.error('Failed to fetch upload details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleDownload = async (upload: FileUpload) => {
    try {
      const token = await getIdToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
      const downloadUrl = `${backendUrl}/api/download/${upload.id}`;
      
      // Use backend proxy endpoint to avoid CORS issues
      // Fetch the file as blob from our backend
      const response = await fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Download failed: ${response.status}`);
      }

      // Get the blob from response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = upload.filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      toast.success('Download started');
    } catch (error) {
      console.error('Error downloading file:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to download file: ${errorMessage}`);
    }
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(true);
      toast.success('Firebase URL copied to clipboard');
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
      toast.error('Failed to copy URL');
    }
  };

  const handleCopyResult = async (result: string) => {
    try {
      await navigator.clipboard.writeText(result);
      setCopiedResult(true);
      toast.success('Analysis result copied to clipboard');
      setTimeout(() => setCopiedResult(false), 2000);
    } catch (error) {
      console.error('Failed to copy result:', error);
      toast.error('Failed to copy analysis result');
    }
  };

  const handleDeleteClick = (uploadId: string) => {
    setUploadToDelete(uploadId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!uploadToDelete) return;
    
    try {
      const token = await getIdToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/upload-record/${uploadToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setUploads(uploads.filter(upload => upload.id !== uploadToDelete));
        toast.success('Upload deleted successfully');
        // Close details dialog if the deleted upload was being viewed
        if (selectedUpload?.id === uploadToDelete) {
          setDetailsDialogOpen(false);
          setSelectedUpload(null);
        }
        setDeleteDialogOpen(false);
        setUploadToDelete(null);
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.detail || 'Failed to delete upload');
      }
    } catch (error) {
      console.error('Error deleting upload:', error);
      toast.error('Failed to delete upload');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      processing: { color: 'bg-blue-100 text-blue-800', label: 'Processing' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Failed' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge variant="secondary" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const filteredUploads = uploads.filter(upload => {
    const matchesSearch = upload.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || upload.analysis_status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      <div className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">My Uploads</h1>
                <p className="text-muted-foreground">
                  View and manage your uploaded SAP documents
                </p>
              </div>
              <Button 
                onClick={() => navigate('/home')}
                className="gap-2 bg-gradient-primary hover:opacity-90"
              >
                <Upload className="w-4 h-4" />
                Upload New File
              </Button>
            </div>
          </div>

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex flex-1 gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search files..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Filter className="w-4 h-4" />
                        Status: {selectedStatus === 'all' ? 'All' : selectedStatus}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setSelectedStatus('all')}>
                        All Status
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setSelectedStatus('pending')}>
                        Pending
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelectedStatus('processing')}>
                        Processing
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelectedStatus('completed')}>
                        Completed
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelectedStatus('failed')}>
                        Failed
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {filteredUploads.length} of {uploads.length} files
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Uploads List */}
          {loading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              </CardContent>
            </Card>
          ) : filteredUploads.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {uploads.length === 0 ? 'No uploads yet' : 'No files match your search'}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {uploads.length === 0 
                      ? 'Upload your first SAP document to get started with AI-powered analysis.'
                      : 'Try adjusting your search or filter criteria.'
                    }
                  </p>
                  {uploads.length === 0 && (
                    <Button 
                      onClick={() => navigate('/home')}
                      className="gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Your First File
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUploads.map((upload) => (
                      <TableRow key={upload.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{upload.filename}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatFileSize(upload.file_size)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {formatDate(upload.upload_timestamp)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(upload.analysis_status)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="gap-2"
                                onClick={() => handleViewDetails(upload.id)}
                                disabled={loadingDetails}
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="gap-2"
                                onClick={() => handleDownload(upload)}
                                disabled={!upload.file_path}
                              >
                                <Download className="w-4 h-4" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="gap-2 text-red-600 focus:text-red-600"
                                onClick={() => handleDeleteClick(upload.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Upload Details Dialog */}
      <Dialog 
        open={detailsDialogOpen} 
        onOpenChange={(open) => {
          setDetailsDialogOpen(open);
          if (!open) {
            // Reset copy states when dialog closes
            setCopiedUrl(false);
            setCopiedResult(false);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Upload Details</DialogTitle>
            <DialogDescription>
              View detailed information about this upload
            </DialogDescription>
          </DialogHeader>
          {selectedUpload && (
            <div className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-2 -mr-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">File Name</label>
                  <p className="text-sm font-medium">{selectedUpload.filename}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">File Size</label>
                  <p className="text-sm font-medium">{formatFileSize(selectedUpload.file_size)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Upload Date</label>
                  <p className="text-sm font-medium">{formatDate(selectedUpload.upload_timestamp)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedUpload.analysis_status)}</div>
                </div>
                {selectedUpload.content_type && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Content Type</label>
                    <p className="text-sm font-medium">{selectedUpload.content_type}</p>
                  </div>
                )}
                {selectedUpload.file_path && (
                  <div className="col-span-2">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <label className="text-sm font-medium text-muted-foreground">File URL</label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyUrl(selectedUpload.file_path!)}
                        className="h-7 w-7 p-0"
                        title="Copy URL"
                      >
                        {copiedUrl ? (
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>
                    <p className="text-sm font-mono break-all text-muted-foreground truncate" title={selectedUpload.file_path}>
                      {selectedUpload.file_path}
                    </p>
                  </div>
                )}
              </div>
              
              {selectedUpload.analysis_result && (
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <label className="text-sm font-medium text-muted-foreground">AI Analysis Result</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyResult(selectedUpload.analysis_result!)}
                      className="h-7 px-2 gap-1.5"
                      title="Copy Analysis Result"
                    >
                      {copiedResult ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-500" />
                          <span className="text-xs text-green-500">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-xs">Copy</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="bg-card/50 p-4 rounded-lg border border-border/50 prose prose-sm dark:prose-invert max-w-none text-foreground">
                    <ReactMarkdown
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-4 mb-2 text-foreground" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-4 mb-2 text-foreground" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-lg font-semibold mt-3 mb-2 text-foreground" {...props} />,
                        h4: ({node, ...props}) => <h4 className="text-base font-semibold mt-3 mb-1 text-foreground" {...props} />,
                        h5: ({node, ...props}) => <h5 className="text-sm font-semibold mt-2 mb-1 text-foreground" {...props} />,
                        h6: ({node, ...props}) => <h6 className="text-sm font-semibold mt-2 mb-1 text-foreground" {...props} />,
                        p: ({node, ...props}) => <p className="mb-3 text-foreground leading-relaxed" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold text-foreground" {...props} />,
                        em: ({node, ...props}) => <em className="italic text-foreground" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc list-inside mb-3 space-y-1 text-foreground" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-3 space-y-1 text-foreground" {...props} />,
                        li: ({node, ...props}) => <li className="ml-4 text-foreground" {...props} />,
                        code: ({node, ...props}) => <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground" {...props} />,
                        pre: ({node, ...props}) => <pre className="bg-muted p-3 rounded-lg overflow-x-auto mb-3 text-sm font-mono text-foreground" {...props} />,
                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary pl-4 italic my-3 text-muted-foreground" {...props} />,
                        hr: ({node, ...props}) => <hr className="my-4 border-border" {...props} />,
                      }}
                    >
                      {selectedUpload.analysis_result}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
              
              {!selectedUpload.analysis_result && selectedUpload.analysis_status === 'completed' && (
                <div className="text-sm text-muted-foreground">
                  Analysis completed but no result available.
                </div>
              )}
              
              {selectedUpload.analysis_status === 'pending' && (
                <div className="text-sm text-muted-foreground">
                  Analysis is pending. Results will appear here once processing is complete.
                </div>
              )}
              
              {selectedUpload.analysis_status === 'processing' && (
                <div className="text-sm text-muted-foreground">
                  Analysis is currently being processed. Please check back shortly.
                </div>
              )}
              
              {selectedUpload.analysis_status === 'failed' && (
                <div className="text-sm text-red-600">
                  Analysis failed. Please try uploading the file again.
                </div>
              )}

            </div>
          )}
          {selectedUpload && (
            <div className="flex justify-end gap-2 pt-4 border-t border-border flex-shrink-0 mt-4">
              {selectedUpload.file_path && (
                <Button
                  onClick={() => {
                    handleDownload(selectedUpload);
                  }}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download File
                </Button>
              )}
              <Button
                variant="destructive"
                onClick={() => handleDeleteClick(selectedUpload.id)}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the upload and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteDialogOpen(false);
              setUploadToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const MyUploads = () => {
  return (
    <ProtectedRoute>
      <MyUploadsContent />
    </ProtectedRoute>
  );
};

export default MyUploads;