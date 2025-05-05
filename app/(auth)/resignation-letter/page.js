'use client'
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SiOllama } from "react-icons/si";
import { FaFilePdf, FaFileWord } from "react-icons/fa";
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';

export default function ResignationLetter() {
  const [fullName, setFullName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderAddress, setSenderAddress] = useState('');
  const [senderCity, setSenderCity] = useState('');
  const [senderProvince, setSenderProvince] = useState('');
  const [managerName, setManagerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [lastWorkingDay, setLastWorkingDay] = useState('');
  const [isPersonal, setIsPersonal] = useState(true);
  const [letter, setLetter] = useState('');
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleNext = async () => {
    if (isPersonal) {
      if (fullName && senderEmail && senderPhone && senderAddress && senderCity && senderProvince) {
        setIsPersonal(false);
        setError('');
      } else {
        setError('Please fill in all personal information fields.');
      }
    } else {
      if (managerName && companyName && jobTitle && lastWorkingDay) {
        setIsGenerating(true);
        try {
          const response = await fetch('/api/generate-resignation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              personal: {
                fullName,
                phone: senderPhone,
                email: senderEmail,
                address: senderAddress,
                city: senderCity,
                province: senderProvince,
              },
              employer: {
                managerName,
                companyName,
                companyAddress,
                jobTitle,
                lastWorkingDay,
              },
            }),
          });

          const data = await response.json();
          if (response.ok) {
            setLetter(data.letter);
            setError('');
          } else {
            setError(data.error || 'Failed to generate resignation letter');
          }
        } catch (err) {
          setError('Network error: Could not generate letter');
        } finally {
          setIsGenerating(false);
        }
      } else {
        setError('Please fill in all employer information fields.');
      }
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const margin = 10;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxWidth = pageWidth - 2 * margin;
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxHeight = pageHeight - 2 * margin;
    const lineHeight = 10;
    let cursorY = margin;

    doc.setFontSize(12);
    const lines = doc.splitTextToSize(letter, maxWidth);

    lines.forEach((line) => {
        if (cursorY + lineHeight > pageHeight - margin) {
            doc.addPage();
            cursorY = margin;
        }
        doc.text(line, margin, cursorY);
        cursorY += lineHeight; 
    });
    doc.save('resignation_letter.pdf');
  };

  const generateWordDocument = () => {
    const lines = letter.split('\n');
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
      saveAs(blob, 'resignation_letter.docx');
    });
  };

  // Animation variants for forms
  const formVariants = {
    hidden: { opacity: 0, x: '50%' },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeInOut' } },
    exit: { opacity: 0, x: '-50%', transition: { duration: 0.5, ease: 'easeInOut' } },
  };

  // Animation variants for preview panel
  const panelVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeInOut' } },
  };

  return (
    <div className="flex bg-white mx-10 my-6 h-[calc(100vh-3rem)] justify-between">
      {/* Form Section */}
      <div className="relative flex flex-col w-1/2 py-10 px-10 space-y-7">
        <div className="mb-10">
          <h1 className="text-2xl">{isPersonal ? 'Personal Information' : 'Employer Information'}</h1>
          <p className="text-gray-400 text-sm">
            {isPersonal ? 'Please enter your details' : 'Please enter your employer details'}
          </p>
        </div>

        {error && (
          <div className="text-red-500 text-sm px-2">{error}</div>
        )}

        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {isPersonal ? (
              <motion.div
                key="personal"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute w-full"
              >
                <div className="flex flex-col">
                  <label htmlFor="fullname" className="text-sm px-2">Full Name</label>
                  <input
                    type="text"
                    id="fullname"
                    placeholder="i.e John Doe"
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="flex flex-col mt-4">
                  <label htmlFor="email" className="text-sm px-2">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    placeholder="i.e john.doe@gmail.com"
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                  />
                </div>

                <div className="flex flex-col mt-4">
                  <label htmlFor="phone" className="text-sm px-2">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    placeholder="xxx-xxx-xxxx"
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 invalid:border-red-400"
                    value={senderPhone}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, '');
                      if (value.length > 10) value = value.slice(0, 10);
                      if (value.length > 6) {
                        value = `${value.slice(0, 3)}-${value.slice(3, 6)}-${value.slice(6)}`;
                      } else if (value.length > 3) {
                        value = `${value.slice(0, 3)}-${value.slice(3)}`;
                      }
                      setSenderPhone(value);
                    }}
                    maxLength={12}
                  />
                </div>

                <div className="flex flex-col mt-4">
                  <label htmlFor="senderAddress" className="text-sm px-2">Address</label>
                  <input
                    type="text"
                    id="senderAddress"
                    placeholder="Address Line 1"
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={senderAddress}
                    onChange={(e) => setSenderAddress(e.target.value)}
                  />
                </div>

                <div className="flex justify-between mt-4">
                  <div className="flex flex-col w-[48%]">
                    <label htmlFor="senderCity" className="text-sm px-2">City</label>
                    <input
                      type="text"
                      id="senderCity"
                      placeholder="i.e Calgary"
                      className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={senderCity}
                      onChange={(e) => setSenderCity(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col w-[48%]">
                    <label htmlFor="senderProvince" className="text-sm px-2">Province</label>
                    <select
                      id="senderProvince"
                      name="senderProvince"
                      className="px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={senderProvince}
                      onChange={(e) => setSenderProvince(e.target.value)}
                      required
                    >
                      <option value="" disabled>Select your Province</option>
                      <option value="AB">Alberta</option>
                      <option value="BC">British Columbia</option>
                      <option value="MB">Manitoba</option>
                      <option value="NB">New Brunswick</option>
                      <option value="NL">Newfoundland and Labrador</option>
                      <option value="NS">Nova Scotia</option>
                      <option value="ON">Ontario</option>
                      <option value="PE">Prince Edward Island</option>
                      <option value="QC">Quebec</option>
                      <option value="SK">Saskatchewan</option>
                      <option value="NT">Northwest Territories</option>
                      <option value="NU">Nunavut</option>
                      <option value="YT">Yukon</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="employer"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute w-full"
              >
                <div className="flex flex-col">
                  <label htmlFor="managerName" className="text-sm px-2">Manager’s Name</label>
                  <input
                    type="text"
                    id="managerName"
                    placeholder="i.e Jane Smith"
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                  />
                </div>

                <div className="flex flex-col mt-4">
                  <label htmlFor="companyName" className="text-sm px-2">Company Name</label>
                  <input
                    type="text"
                    id="companyName"
                    placeholder="i.e Acme Corp"
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>

                <div className="flex flex-col mt-4">
                  <label htmlFor="companyAddress" className="text-sm px-2">Company Address</label>
                  <input
                    type="text"
                    id="companyAddress"
                    placeholder="i.e 123 Business Rd"
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                  />
                </div>

                <div className="flex flex-col mt-4">
                  <label htmlFor="jobTitle" className="text-sm px-2">Your Job Title</label>
                  <input
                    type="text"
                    id="jobTitle"
                    placeholder="i.e Software Engineer"
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>

                <div className="flex flex-col mt-4">
                  <label htmlFor="lastWorkingDay" className="text-sm px-2">Last Working Day</label>
                  <input
                    type="date"
                    id="lastWorkingDay"
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={lastWorkingDay}
                    onChange={(e) => setLastWorkingDay(e.target.value)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-between mt-6">
          {!isPersonal && (
            <button
              className="bg-gray-400 px-6 py-3 rounded-xl text-white font-semibold hover:bg-gray-600"
              onClick={() => setIsPersonal(true)}
            >
              Back
            </button>
          )}
          <button
            className="bg-blue-400 border-2 border-blue-400 px-6 py-3 rounded-xl text-white font-semibold hover:bg-white hover:text-blue-400 ml-auto"
            onClick={handleNext}
            disabled={isGenerating}
          >
            {isPersonal ? 'Next' : (isGenerating ? 'Generating...' : 'Generate')}
          </button>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="bg-gray-100 m-4 rounded-xl w-1/2 p-6 overflow-auto">
        <AnimatePresence mode="wait">
          {!letter ? (
            <motion.div
              key="placeholder"
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="flex flex-col justify-center items-center h-full space-y-5"
            >
              <SiOllama size={150} />
              <p className="text-2xl font-semibold">Resignation Letter Preview</p>
              <p className="text-lg text-gray-500 text-center max-w-[350px]">
                Complete the form on the left to generate your resignation letter.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="letter"
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="flex flex-col space-y-4"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Your Resignation Letter</h2>
              </div>
              <textarea
                className="w-full h-[600px] p-4 border border-gray-300 rounded-lg text-gray-700 bg-white shadow-sm resize-none text-sm leading-relaxed"
                value={letter}
                onChange={(e) => setLetter(e.target.value)}
              />
                <div className="flex space-x-5 justify-end mx-5">
                  <button
                    className="flex items-center gap-2 bg-red-500 px-4 py-2 rounded-lg text-white font-semibold hover:bg-red-600"
                    onClick={generatePDF}
                  >
                    <FaFilePdf /> Download PDF
                  </button>
                  <button
                    className="flex items-center gap-2 bg-blue-500 px-4 py-2 rounded-lg text-white font-semibold hover:bg-blue-600"
                    onClick={generateWordDocument}
                  >
                    <FaFileWord /> Download Word
                  </button>
                </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}