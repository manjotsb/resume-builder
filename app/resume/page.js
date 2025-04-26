'use client';
import { useState, useEffect } from 'react';
import { FiDownload, FiInfo, FiAlertCircle, FiEye, FiX } from 'react-icons/fi';

export default function ResumeOptimizer() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [parsedDetails, setParsedDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [optimizedPreviewUrl, setOptimizedPreviewUrl] = useState(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState(null);
  const [showPreview, setShowPreview] = useState({ type: null, visible: false });
  const [downloadInfo, setDownloadInfo] = useState(null);

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setResumeFile(file);
      // Create temporary URL for preview
      const url = URL.createObjectURL(file);
      setUploadPreviewUrl(url);
      setError('');
    } else {
      setResumeFile(null);
      setUploadPreviewUrl(null);
      setError('Please upload a valid PDF file');
    }
  };

  // Clean up preview URLs
  useEffect(() => {
    return () => {
      if (optimizedPreviewUrl) {
        URL.revokeObjectURL(optimizedPreviewUrl);
      }
      if (uploadPreviewUrl) {
        URL.revokeObjectURL(uploadPreviewUrl);
      }
    };
  }, [optimizedPreviewUrl, uploadPreviewUrl]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      setError('Please upload a resume PDF');
      return;
    }
    setIsLoading(true);
    setError('');
    setSuccess('');
    setDownloadInfo(null);
    setParsedDetails(null);

    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('jobDescription', jobDescription);

      const response = await fetch('/api/optimize-resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate resume');
      }

      const { pdfBytes, fileName, userDetails } = await response.json();
      setParsedDetails(userDetails);
      const pdfUrl = `data:application/pdf;base64,${pdfBytes}`;
      setOptimizedPreviewUrl(pdfUrl);
      setDownloadInfo({ pdfBytes, fileName });
      setSuccess('Resume generated successfully!');
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle PDF download
  const handleDownload = () => {
    if (!downloadInfo) return;

    const { pdfBytes, fileName } = downloadInfo;
    const byteCharacters = atob(pdfBytes);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  // Handle preview toggle
  const handlePreview = (type) => {
    setShowPreview({ type, visible: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 text-black">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume Builder</h1>
          <p className="text-gray-600">
            Upload your resume PDF and enter a job description to generate a tailored resume
          </p>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
              {/* Resume Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Resume (PDF) *</label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    required
                  />
                  {uploadPreviewUrl && (
                    <button
                      type="button"
                      onClick={() => handlePreview('upload')}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <FiEye className="mr-1" /> Preview
                    </button>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Upload your resume PDF to extract your details automatically.
                </p>
              </div>

              {/* Job Description */}
              <div>
                <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description *
                </label>
                <textarea
                  id="jobDescription"
                  rows={8}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Paste the job description you're applying for..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  required
                />
              </div>

              {/* Parsed Details (Read-Only Display) */}
              {parsedDetails && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Parsed Resume Details</h3>
                  {parsedDetails.name && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Name</p>
                      <p className="text-sm text-gray-600">{parsedDetails.name}</p>
                    </div>
                  )}
                  {parsedDetails.email && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Email</p>
                      <p className="text-sm text-gray-600">{parsedDetails.email}</p>
                    </div>
                  )}
                  {parsedDetails.phone && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Phone</p>
                      <p className="text-sm text-gray-600">{parsedDetails.phone}</p>
                    </div>
                  )}
                  {parsedDetails.linkedIn && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">LinkedIn</p>
                      <p className="text-sm text-gray-600">{parsedDetails.linkedIn}</p>
                    </div>
                  )}
                  {parsedDetails.summary && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Summary</p>
                      <p className="text-sm text-gray-600">{parsedDetails.summary}</p>
                    </div>
                  )}
                  {parsedDetails.education && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Education</p>
                      <p className="text-sm text-gray-600">{parsedDetails.education}</p>
                    </div>
                  )}
                  {parsedDetails.experience && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Projects</p>
                      <p className="text-sm text-gray-600">{parsedDetails.experience}</p>
                    </div>
                  )}
                  {parsedDetails.skills && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Skills</p>
                      <p className="text-sm text-gray-600">{parsedDetails.skills}</p>
                    </div>
                  )}
                  {parsedDetails.certifications && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Certifications</p>
                      <p className="text-sm text-gray-600">{parsedDetails.certifications}</p>
                    </div>
                  )}
                  {parsedDetails.achievements && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Achievements</p>
                      <p className="text-sm text-gray-600">{parsedDetails.achievements}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Status Messages */}
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <FiAlertCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">{error}</h3>
                    </div>
                  </div>
                </div>
              )}
              {success && (
                <div className="rounded-md bg-green-50 p-4">
                  <div className="flex">
                    <FiInfo className="h-5 w-5 text-green-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">{success}</h3>
                      {downloadInfo && (
                        <div className="mt-2 flex gap-3">
                          <button
                            onClick={() => handlePreview('optimized')}
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            <FiEye className="mr-1" /> Preview Optimized Resume
                          </button>
                          <button
                            onClick={handleDownload}
                            className="text-sm text-green-600 hover:text-green-800 flex items-center"
                          >
                            <FiDownload className="mr-1" /> Download
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <FiDownload className="-ml-1 mr-2 h-5 w-5" />
                      Generate Resume
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {showPreview.visible && (showPreview.type === 'upload' || showPreview.type === 'optimized') && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-lg font-medium">
                {showPreview.type === 'upload' ? 'Uploaded Resume Preview' : 'Generated Resume Preview'}
              </h2>
              <button onClick={() => setShowPreview({ type: null, visible: false })}>
                <FiX size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <iframe
                src={showPreview.type === 'upload' ? uploadPreviewUrl : optimizedPreviewUrl}
                className="w-full h-full min-h-[70vh]"
                title={showPreview.type === 'upload' ? 'Uploaded Resume Preview' : 'Generated Resume Preview'}
                type="application/pdf"
              />
            </div>
            <div className="border-t p-4 flex justify-end gap-4">
              {showPreview.type === 'optimized' && (
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  <FiDownload className="mr-2 inline" /> Download
                </button>
              )}
              <button
                onClick={() => setShowPreview({ type: null, visible: false })}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}