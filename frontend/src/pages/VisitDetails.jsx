import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Upload, Download, FileText, Image as ImageIcon, Check, X, Calendar, MapPin, Clock } from 'lucide-react';
import axios from 'axios';

const VisitDetails = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [visit, setVisit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [documentFile, setDocumentFile] = useState(null);
  const [documentType, setDocumentType] = useState('');
  const [imageFiles, setImageFiles] = useState([]);

  useEffect(() => {
    fetchVisitDetails();
  }, [id]);

  const fetchVisitDetails = async () => {
    try {
      const response = await axios.get(`/api/visits/${id}`);
      setVisit(response.data);
    } catch (error) {
      console.error('Error fetching visit details:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData();
    formData.append('document', documentFile);
    formData.append('documentType', documentType);

    try {
      await axios.post(`/api/documents/${id}/document`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setDocumentFile(null);
      setDocumentType('');
      fetchVisitDetails();
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();
    if (imageFiles.length !== 3) {
      alert('Please select exactly 3 images');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    imageFiles.forEach(file => formData.append('images', file));

    try {
      await axios.post(`/api/documents/${id}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImageFiles([]);
      fetchVisitDetails();
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleStatusChange = async (newStatus, rejectionReason = '') => {
    try {
      await axios.patch(`/api/visits/${id}/status`, {
        status: newStatus,
        rejectionReason
      });
      fetchVisitDetails();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const downloadDocument = async (documentId) => {
    try {
      const response = await axios.get(`/api/documents/document/${documentId}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'document');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  if (!visit) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Visit not found</div>;

  const canUploadDocuments = user.role === 'Instructor' || user.role === 'Administrator';
  const canChangeStatus = user.role === 'StudyAbroad' || user.role === 'Administrator';

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-6">
                <h1 className="text-2xl font-bold text-gray-900">{visit.visit_title}</h1>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(visit.status)}`}>
                  {visit.status}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-start">
                  <FileText className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Purpose</p>
                    <p className="text-gray-900">{visit.visit_purpose}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Destination</p>
                    <p className="text-gray-900">{visit.destination_institution}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Visit Dates</p>
                    <p className="text-gray-900">
                      {new Date(visit.visit_date_start).toLocaleDateString()} - {new Date(visit.visit_date_end).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Requested On</p>
                    <p className="text-gray-900">{new Date(visit.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {visit.rejection_reason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-red-900 mb-1">Rejection Reason</p>
                    <p className="text-red-800">{visit.rejection_reason}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents</h2>
              {visit.documents && visit.documents.length > 0 ? (
                <div className="space-y-3">
                  {visit.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{doc.file_name}</p>
                          <p className="text-xs text-gray-500 capitalize">{doc.document_type.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => downloadDocument(doc.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No documents uploaded yet</p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Visit Images</h2>
              {visit.images && visit.images.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {visit.images.map((img) => (
                    <div key={img.id} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={`/api/documents/image/${img.id}`}
                        alt="Visit image"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No images uploaded yet</p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Status History</h2>
              {visit.history && visit.history.length > 0 ? (
                <div className="space-y-3">
                  {visit.history.map((entry, index) => (
                    <div key={entry.id} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(entry.status)}`}>
                            {entry.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(entry.changed_at).toLocaleString()}
                          </span>
                        </div>
                        {entry.notes && (
                          <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>
                        )}
                        {entry.first_name && (
                          <p className="text-xs text-gray-500 mt-1">
                            by {entry.first_name} {entry.last_name}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No history available</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {canUploadDocuments && visit.status !== 'Rejected' && (
              <>
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Document</h2>
                  <form onSubmit={handleDocumentUpload} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Document Type
                      </label>
                      <select
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        required
                      >
                        <option value="">Select type</option>
                        <option value="request_form">Request Form</option>
                        <option value="response_letter">Response Letter</option>
                        <option value="visit_report">Visit Report</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        File (PDF or Word)
                      </label>
                      <input
                        type="file"
                        onChange={(e) => setDocumentFile(e.target.files[0])}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        accept=".pdf,.doc,.docx"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={uploading}
                      className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{uploading ? 'Uploading...' : 'Upload Document'}</span>
                    </button>
                  </form>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Visit Images</h2>
                  <p className="text-sm text-gray-500 mb-4">Exactly 3 images required for visit report</p>
                  <form onSubmit={handleImageUpload} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select 3 Images
                      </label>
                      <input
                        type="file"
                        onChange={(e) => setImageFiles(Array.from(e.target.files))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        accept="image/*"
                        multiple
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={uploading}
                      className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>{uploading ? 'Uploading...' : 'Upload Images'}</span>
                    </button>
                  </form>
                </div>
              </>
            )}

            {canChangeStatus && visit.status === 'Pending' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Review Request</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => handleStatusChange('Approved')}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center space-x-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Enter rejection reason:');
                      if (reason) handleStatusChange('Rejected', reason);
                    }}
                    className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition flex items-center justify-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitDetails;
