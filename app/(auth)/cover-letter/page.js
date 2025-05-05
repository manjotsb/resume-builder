'use client';
import { useState, useRef } from 'react';
import { FiUpload, FiDownload, FiChevronLeft, FiEye, FiX } from 'react-icons/fi';
import { FaCheckCircle, FaFilePdf, FaFileWord, FaRegFilePdf, FaRegFileWord } from 'react-icons/fa';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import { IoMdInformationCircle } from 'react-icons/io';
import { IoCloudUploadOutline } from 'react-icons/io5';
import { SiOllama } from "react-icons/si";

export default function CoverLetterGenerator() {
  const [step, setStep] = useState(1);
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [editedLetter, setEditedLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [roleTitle, setRoleTitle] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [currency, setCurrency] = useState('');
  const [contactName, setContactName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [creativityLevel, setCreativityLevel] = useState();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const fileInputRef = useRef();

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setError('');
    if (file) {
      if (file.type === 'application/pdf' || file.type.includes('word') || file.name.endsWith('.docx')) {
        setResumeFile(file);
      } else {
        setError('Please upload a PDF or Word document.');
      }
    }
  };

  const handleSkillSelect = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const generateCoverLetter = async () => {
    setIsGenerating(true);
    setError('');

    try {
      if (!resumeFile || !jobDescription) {
        throw new Error('Please provide both resume and job description');
      }

      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append(
        'jobDescription',
        JSON.stringify({
          roleTitle,
          currency,
          minSalary,
          maxSalary,
          contactName,
          companyName,
          city,
          province,
          description: jobDescription,
        })
      );

      const response = await fetch('/api/generate-letter', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate cover letter');
      }

      setGeneratedLetter(data.letter);
      setEditedLetter(data.letter);
    } catch (error) {
      console.error('Generation Error:', error);
      setError(error.message || 'Failed to generate cover letter. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateWordDocument = () => {
    const lines = editedLetter.split('\n');
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: lines.map(
            (line, index) =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: line,
                    size: 24,
                  }),
                ],
                spacing: { after: index < 5 ? 100 : 200 },
              })
          ),
        },
      ],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, `Cover_Letter_${roleTitle || 'Application'}.docx`);
    });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const margin = 10;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxWidth = pageWidth - 2 * margin;

    const lines = doc.splitTextToSize(editedLetter, maxWidth);
    doc.setFontSize(12);
    doc.text(lines, margin, margin);

    doc.save(`Cover_Letter_${roleTitle || 'Application'}.pdf`);
  };

  return (
    <div className="flex flex-col items-center min-h-screen overflow-hidden p-8">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
      )}
      <div className="flex w-full justify-between gap-2 h-[calc(100vh-4rem)]">
        {/* Left Column: Form Inputs */}
        <div className="w-1/2 overflow-y-auto pr-4">
          <div className="flex mb-4 items-center space-x-1 border border-b-blue-600 bg-blue-100 w-full px-4 py-2 rounded-lg">
            <IoMdInformationCircle className="text-blue-600" size={18} />
            <p className="text-sm">Click here to help and support</p>
          </div>
          <h1 className="text-2xl font-bold mb-5">Generate your cover letter</h1>
          <div className="space-y-6">
            {/* Upload Resume Section */}
            <div className="space-y-2">
              <p className="font-semibold text-xl">Upload Resume</p>
              <label
                htmlFor="resumeUpload"
                className="flex flex-col items-center gap-3 bg-white justify-center h-[145px] rounded-lg border border-gray-300 cursor-pointer w-full shadow-sm"
              >
                {resumeFile ? (
                      resumeFile.type === 'application/pdf' ? (
                        <FaFilePdf className="text-red-500" size={40} />
                      ) : (
                        <FaFileWord className="text-blue-500" size={40} />
                      )
                    ) : (
                      <IoCloudUploadOutline className="text-gray-500" size={40} />
                    )}
                
                {resumeFile ? (
                  <span className="text-sm text-gray-600">{resumeFile.name}</span>
                ) : (
                  <div className="text-center">
                    <p className="text-lg">Upload your resume</p>
                    <p>(.pdf, .doc, .docx)</p>
                  </div>
                )}
                <input
                  type="file"
                  id="resumeUpload"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
            {/* Content Section */}
            <div className="space-y-2">
              <p className="font-semibold text-lg">Content</p>
              <p className="flex text-sm text-gray-600">
                Paste the job description here{' '}
                <span className="text-red-500 px-1">*</span>
              </p>
              <textarea
                id="jobDescription"
                className="w-full h-48 p-4 rounded-lg border border-gray-300 text-gray-700 bg-white shadow-sm resize-none"
                name="jobDescription"
                placeholder="Job description"
                value={jobDescription}
                maxLength={10000}
                onChange={(e) => setJobDescription(e.target.value)}
              ></textarea>
              <p className={`text-xs text-end mx-4 ${(jobDescription.length>=10000) ? "text-red-500" : "text-gray-500"}`}>
                {jobDescription.length}/10000
              </p>
            </div>
            {/* Skills Section */}
            <div className="space-y-2">
              <p>
                What is the Role Title you are applying for?
              </p>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg appearance-none bg-white text-gray-700"
                placeholder="Junior Software Developer"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedSkills.map((skill) => (
                  <div
                    key={skill}
                    className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                    <button
                      onClick={() => handleSkillSelect(skill)}
                      className="ml-2 text-blue-700 hover:text-blue-900"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {/* Creativity Level Section */}
            <div className="space-y-2">
              <p>How creative should the output be?</p>
              <div className='flex space-x-3'>
                <input
                  type="range"
                  className="w-1/2 bg-white text-gray-700"
                  min={0.1}
                  max={1}
                  step={0.1}
                  value={creativityLevel}
                  onChange={(e) => setCreativityLevel(e.target.value)}
                />
                <p>{creativityLevel}</p>
              </div>
            </div>
  
            <button
              className="bg-blue-500 border font-semibold hover:border-blue-500 hover:text-blue-500 hover:bg-white text-white text-lg px-6 py-2 rounded-lg flex items-center gap-2"
              onClick={generateCoverLetter}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate Cover Letter'}
            </button>
          </div>
        </div>
  
        {/* Right Column: Generated Cover Letter */}
        <div className="w-1/2">
          <div className="bg-white rounded-xl shadow-lg p-6 overflow-y-auto h-full">
            {generatedLetter ? (
              <>
                <div className='flex mb-4 px-2 w-full items-start justify-between'>
                <h2 className="text-xl font-semibold">Your Cover Letter</h2>
                  <div className='flex items-center space-x-1.5 rounded-xl bg-violet-200 px-2 border border-violet-500 transform scale-90'>
                    <FaCheckCircle className='text-violet-500'/>
                    <p>Auto Save</p>
                  </div>
                </div>
                <textarea
                  className="w-full h-[calc(100%-8rem)] p-4 border border-gray-300 rounded-lg text-gray-700 bg-white shadow-sm resize-none"
                  value={editedLetter}
                  onChange={(e) => setEditedLetter(e.target.value)}
                ></textarea>
                <div className="flex justify-end gap-4 mt-4">
                  <button
                    className="flex items-center gap-2 border font-semibold text-blue-600 hover:bg-blue-100 px-6 py-2 rounded-lg"
                    onClick={() => setShowPreview(true)}
                  >
                    <FiEye /> Preview
                  </button>
                  <button
                    className="flex items-center gap-2 bg-red-500 border font-semibold hover:border-red-500 hover:text-red-500 hover:bg-white text-white px-4 rounded-lg text-nowrap"
                    onClick={generatePDF}
                  >
                    <FiDownload /> Download as PDF
                  </button>
                  <button
                    className="flex items-center gap-2 bg-blue-500 border font-semibold hover:border-blue-500 hover:text-blue-500 hover:bg-white text-white px-4 text-nowrap rounded-lg"
                    onClick={generateWordDocument}
                  >
                    <FiDownload /> Download as Word
                  </button>
                </div>
              </>
            ) : (
              <div className='flex flex-col justify-center items-center h-full space-y-5'>
                <SiOllama size={150}/>
                <p className="text-3xl font-semibold">Answer the prompts</p>
                <p className="text-lg w-[350px] text-gray-500 mb-6 text-center">
                  Get the best results by filling in several inputs on the left.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
  
      {showPreview && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-xl font-semibold">Cover Letter Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="p-6 overflow-auto">
              <div className="whitespace-pre-line font-serif text-lg">{editedLetter}</div>
            </div>
            <div className="border-t p-4 flex justify-end gap-4">
              <button
                onClick={() => {
                  generatePDF();
                  setShowPreview(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                <FiDownload className="mr-2 inline"/> Download as PDF
              </button>
              <button
                onClick={() => {
                  generateWordDocument();
                  setShowPreview(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <FiDownload className="mr-2 inline" /> Download as Word
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}