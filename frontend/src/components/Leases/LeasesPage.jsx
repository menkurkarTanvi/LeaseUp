import React, { useState } from 'react';

const LeasesPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFilename, setUploadedFilename] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append('pdf', selectedFile);

    const res = await fetch('http://localhost:5000/upload_pdf', {
      method: 'POST',
      body: formData,
    });

    const result = await res.json();
    console.log("File uploaded:", result);
    setUploadedFilename(result.saved_filename); // Save the name for submit step
  };

  const handleSubmit = async () => {
    if (!uploadedFilename) return;

    const res = await fetch('http://localhost:5000/ingest_pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: uploadedFilename }),
    });

    const result = await res.json();
    console.log("Ingest result:", result);
    alert(`✅ Ingested ${result.chunks} chunks into Pinecone!`);
  };

  return (
    <div>
      <h1>Upload Lease PDF</h1>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <br /><br />
      <button onClick={handleUpload}>Upload</button>
      <button onClick={handleSubmit} disabled={!uploadedFilename}>Submit to Pinecone</button>
    </div>
  );
};

export default LeasesPage;
