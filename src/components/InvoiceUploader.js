import React, { useState } from 'react';
import axios from 'axios';

function InvoiceUploader() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setInvoiceData(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await axios.post('http://localhost:3000/invoice/upload', formData);
      const jobId = res.data.jobId;
        console.log('jobId', jobId)
      const eventSource = new EventSource(`http://localhost:3000/invoice/events/${jobId}`);

      eventSource.onmessage = (event) => {
        console.log("ON MESSAGE", event)
        const data = JSON.parse(event.data);
        setInvoiceData(data);
        setLoading(false);
        eventSource.close();
      };

      eventSource.onerror = () => {
        setLoading(false);
        eventSource.close();
      };
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Upload Invoice</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!selectedFile || loading}>
        {loading ? 'Processing...' : 'Upload & Extract'}
      </button>

      {invoiceData && (
        <div style={{ marginTop: '20px' }}>
          <h3>Extracted Invoice Data:</h3>
          <pre>{JSON.stringify(invoiceData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default InvoiceUploader;
