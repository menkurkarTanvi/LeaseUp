import React, { useState } from 'react';

const LeasesPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFilename, setUploadedFilename] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      console.error("No file selected");
      return;
    }
  
    const formData = new FormData();
    formData.append("file", selectedFile);
  
    try {
      const res = await fetch("/uploads", {
        method: "POST",
        body: formData,
      });      
  
      const result = await res.json();
      console.log("Upload result:", result);
      setUploadedFilename(result.filename);
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  const handleSubmit = async () => {
    if (!uploadedFilename) return;
  
    try {
      const res = await fetch("http://localhost:8000/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filename: uploadedFilename }),
      });
  
      const result = await res.json();
      console.log("[✅ Submit Result]", result);
      alert(`✅ Uploaded to Pinecone! Vector ID: ${result.vector_id}`);
    } catch (err) {
      console.error("❌ Submit failed", err);
    }
  }; // ← Make sure this closing brace exists
  

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
