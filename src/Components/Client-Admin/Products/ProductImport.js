import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, Button, IconButton } from '@mui/material';
import { CloudUpload, Download, Delete } from '@mui/icons-material';

export function ProductImport({ open, onClose }) {

  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.size <= 10 * 1024 * 1024) {
      setSelectedFile(file);
    } else {
      alert("File size exceeds 10MB limit.");
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedFile(null);
  };

  const handleFileDelete = () => {
    setSelectedFile(null);
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: '400px',  // Increase width slightly
          minHeight: '300px',  // Increase height slightly
          padding: '16px',
        }
      }}
    >
      <DialogTitle>Upload Files</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            border: "2px dashed #ccc",
            borderRadius: 2,
            textAlign: "center",
            p: 3,
            cursor: "pointer",
            position: "relative",
          }}
          onClick={() => document.getElementById("fileUpload").click()}
        >
          <CloudUpload fontSize="large" />
          <Typography variant="body2">Drag & drop or <span style={{ color: "blue", cursor: "pointer" }}>browse file</span></Typography>
          <Typography variant="caption" color="error">Max file size: 10MB</Typography>
          <input type="file" id="fileUpload" hidden onChange={handleFileChange} />
        </Box>

        {selectedFile && (
          <Box mt={2} p={2} sx={{ backgroundColor: "#f4f4f4", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="body2">{selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)}MB)</Typography>
            <Box>
              <IconButton color="primary"><Download /></IconButton>
              <IconButton color="error" onClick={handleFileDelete}><Delete /></IconButton>
            </Box>
          </Box>
        )}

        <Button variant="text" sx={{ mt: 2 , color:'#000080'}} startIcon={<Download />} href="/sample-data.xlsx" download>
          Download Sample Data
        </Button>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="secondary">Cancel</Button>
        <Button variant="contained" color="primary" disabled={!selectedFile}>Upload</Button>
      </DialogActions>
    </Dialog>
  );
}

export default ProductImport;
