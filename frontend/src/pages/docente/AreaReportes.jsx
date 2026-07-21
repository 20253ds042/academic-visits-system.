import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SharedSidebar from '../../components/SharedSidebar';
import ProgressTracker from '../../components/ProgressTracker';
import { useDocenteWorkflow } from '../../context/DocenteWorkflowContext';
import { Upload, Camera, FileText, Check, X, Eye, Download } from 'lucide-react';

const AreaReportes = () => {
  const navigate = useNavigate();
  const { getRequestsByStep, setCurrentRequest, uploadDocument, uploadImages, updateRequestStatus, moveToNextStep } = useDocenteWorkflow();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showReporteForm, setShowReporteForm] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([undefined, undefined, undefined]);
  const [uploadedReporte, setUploadedReporte] = useState(null);
  const [reporteData, setReporteData] = useState({
    fechaSolicitud: '',
    areaSolicitante: '',
    docenteResponsable: '',
    telefonoContacto: '',
    docenteAcompanante: '',
    divisionParticipante: '',
    programaEducativo1: '',
    cuatrimestre1: '',
    grupo1: '',
    numEstudiantes1: '',
    programaEducativo2: '',
    cuatrimestre2: '',
    grupo2: '',
    numEstudiantes2: '',
    nombreEmpresa: '',
    lugarDireccion: '',
    telefonoEmpresa: '',
    correoEmpresa: '',
    objetivoVisita: '',
    fechaInicio: '',
    fechaTermino: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const reportes = getRequestsByStep('area_reportes');

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setCurrentRequest(request);
    setUploadedImages(request.images || []);
  };

  const handleImageUpload = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const newImages = [...uploadedImages];
      newImages[index] = file;
      setUploadedImages(newImages);
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = [...uploadedImages];
    newImages[index] = undefined;
    setUploadedImages(newImages);
  };

  const handleReporteUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedReporte(file);
    }
  };

  const handleSubmitReporte = (e) => {
    e.preventDefault();
    
    const validImages = uploadedImages.filter(img => img !== undefined);
    if (validImages.length !== 3) {
      alert('Debe subir exactamente 3 imágenes como evidencia');
      return;
    }

    if (!uploadedReporte) {
      alert('Debe subir el reporte de visita');
      return;
    }

    if (!selectedRequest) return;

    // Upload images
    uploadImages(selectedRequest.id, validImages.map(img => ({
      name: img.name,
      size: img.size,
      type: 'evidence',
      uploadedAt: new Date().toISOString()
    })));

    // Upload reporte document
    uploadDocument(selectedRequest.id, {
      name: uploadedReporte.name,
      size: uploadedReporte.size,
      type: 'reporte',
      uploadedAt: new Date().toISOString()
    });

    updateRequestStatus(selectedRequest.id, 'reporte_enviado', 'Reporte de visita enviado con evidencias');
    moveToNextStep(selectedRequest.id);

    setShowReporteForm(false);
    setShowSuccess(true);
    setUploadedImages([undefined, undefined, undefined]);
    setUploadedReporte(null);
    setReporteData({
      fechaSolicitud: '',
      areaSolicitante: '',
      docenteResponsable: '',
      telefonoContacto: '',
      docenteAcompanante: '',
      divisionParticipante: '',
      programaEducativo1: '',
      cuatrimestre1: '',
      grupo1: '',
      numEstudiantes1: '',
      programaEducativo2: '',
      cuatrimestre2: '',
      grupo2: '',
      numEstudiantes2: '',
      nombreEmpresa: '',
      lugarDireccion: '',
      telefonoEmpresa: '',
      correoEmpresa: '',
      objetivoVisita: '',
      fechaInicio: '',
      fechaTermino: ''
    });

    setTimeout(() => {
      setShowSuccess(false);
      navigate('/docente/historico');
    }, 2000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'solicitud_aprobada':
        return 'bg-green-100 text-green-800';
      case 'carta_responsiva_enviada':
        return 'bg-blue-100 text-blue-800';
      case 'visita_en_curso':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SharedSidebar role="DOCENTE" />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Área de Reportes</h1>

          {!selectedRequest ? (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Visitas en Curso</h2>
              {reportes.length === 0 ? (
                <div className="text-center py-12">
                  <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No hay visitas en curso</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reportes.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800">{request.titulo}</h3>
                          <p className="text-gray-600 mt-1">{request.institucion}</p>
                          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                            <span>{new Date(request.fechaInicio).toLocaleDateString()} - {new Date(request.fechaFin).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                            {request.status.replace(/_/g, ' ').toUpperCase()}
                          </span>
                          <button
                            onClick={() => handleViewDetails(request)}
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                            title="Ver detalles"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Back Button */}
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setShowReporteForm(false);
                }}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
              >
                <X className="w-5 h-5" />
                <span>Volver a reportes</span>
              </button>

              {/* Progress Steps */}
              <ProgressTracker 
                currentStep={2} 
                steps={['Solicitud', 'Carta Responsiva', 'Reporte', 'Histórico']} 
              />

              {/* Request Details */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Detalles de la Visita</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Título</p>
                    <p className="font-medium text-gray-800">{selectedRequest.titulo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Institución</p>
                    <p className="font-medium text-gray-800">{selectedRequest.institucion}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fechas</p>
                    <p className="font-medium text-gray-800">
                      {new Date(selectedRequest.fechaInicio).toLocaleDateString()} - {new Date(selectedRequest.fechaFin).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estado</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedRequest.status)}`}>
                      {selectedRequest.status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {!showReporteForm ? (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Acciones</h2>
                  <button
                    onClick={() => setShowReporteForm(true)}
                    className="w-full flex items-center justify-center space-x-2 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <FileText className="w-6 h-6" />
                    <span>Llenar Reporte de Visita</span>
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-md p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 uppercase">Reporte de Visita Académica</h2>
                  
                  <form onSubmit={handleSubmitReporte} className="space-y-6">
                    {/* Header Section */}
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="input-group mb-4" style={{ width: '200px' }}>
                          <label className="text-sm font-bold text-gray-700">Fecha de solicitud:</label>
                          <input
                            type="date"
                            value={reporteData.fechaSolicitud}
                            onChange={(e) => setReporteData({ ...reporteData, fechaSolicitud: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-100 border border-transparent rounded text-gray-600 text-sm"
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-5xl text-blue-900 mb-2">🏛️</div>
                        <div className="font-bold text-sm text-gray-700">
                          FO-UTEZ-EST-08<br />rev.08
                        </div>
                      </div>
                    </div>

                    {/* Section 1: Datos de los participantes */}
                    <h3 className="text-lg font-semibold text-gray-800 mt-8 mb-4">Datos de los participantes y Responsables</h3>
                    
                    <div className="grid grid-cols-12 gap-4 mb-4">
                      <div className="col-span-4">
                        <label className="text-sm font-bold text-gray-700 block mb-1">Área del solicitante:</label>
                        <input
                          type="text"
                          value={reporteData.areaSolicitante}
                          onChange={(e) => setReporteData({ ...reporteData, areaSolicitante: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-100 border border-transparent rounded text-gray-600"
                        />
                      </div>
                      <div className="col-span-5">
                        <label className="text-sm font-bold text-gray-700 block mb-1">Docente responsable:</label>
                        <input
                          type="text"
                          value={reporteData.docenteResponsable}
                          onChange={(e) => setReporteData({ ...reporteData, docenteResponsable: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-100 border border-transparent rounded text-gray-600"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="text-sm font-bold text-gray-700 block mb-1">Teléfono de contacto:</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={reporteData.telefonoContacto}
                            onChange={(e) => setReporteData({ ...reporteData, telefonoContacto: e.target.value })}
                            className="w-full px-3 py-2 pl-10 bg-gray-100 border border-transparent rounded text-gray-600"
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">📞</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4 mb-4">
                      <div className="col-span-6">
                        <label className="text-sm font-bold text-gray-700 block mb-1">Docente acompañante:</label>
                        <input
                          type="text"
                          value={reporteData.docenteAcompanante}
                          onChange={(e) => setReporteData({ ...reporteData, docenteAcompanante: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-100 border border-transparent rounded text-gray-600"
                        />
                      </div>
                      <div className="col-span-6">
                        <label className="text-sm font-bold text-gray-700 block mb-1">División o área del participante:</label>
                        <input
                          type="text"
                          value={reporteData.divisionParticipante}
                          onChange={(e) => setReporteData({ ...reporteData, divisionParticipante: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-100 border border-transparent rounded text-gray-600"
                        />
                      </div>
                    </div>

                    {/* Programa rows */}
                    <div className="grid grid-cols-12 gap-4 mb-4">
                      <div className="col-span-5">
                        <label className="text-sm font-bold text-gray-700 block mb-1">Programa educativo:</label>
                        <input
                          type="text"
                          value={reporteData.programaEducativo1}
                          onChange={(e) => setReporteData({ ...reporteData, programaEducativo1: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-100 border border-transparent rounded text-gray-600"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="text-sm font-bold text-gray-700 block mb-1">Cuatrimestre:</label>
                        <input
                          type="text"
                          value={reporteData.cuatrimestre1}
                          onChange={(e) => setReporteData({ ...reporteData, cuatrimestre1: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-100 border border-transparent rounded text-gray-600"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm font-bold text-gray-700 block mb-1">Grupo:</label>
                        <input
                          type="text"
                          value={reporteData.grupo1}
                          onChange={(e) => setReporteData({ ...reporteData, grupo1: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-100 border border-transparent rounded text-gray-600"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm font-bold text-gray-700 block mb-1">Nu. de Estudiantes:</label>
                        <input
                          type="text"
                          value={reporteData.numEstudiantes1}
                          onChange={(e) => setReporteData({ ...reporteData, numEstudiantes1: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-100 border border-transparent rounded text-gray-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4 mb-4">
                      <div className="col-span-5">
                        <label className="text-sm font-bold text-gray-700 block mb-1">Programa educativo:</label>
                        <input
                          type="text"
                          value={reporteData.programaEducativo2}
                          onChange={(e) => setReporteData({ ...reporteData, programaEducativo2: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-100 border border-transparent rounded text-gray-600"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="text-sm font-bold text-gray-700 block mb-1">Cuatrimestre:</label>
                        <input
                          type="text"
                          value={reporteData.cuatrimestre2}
                          onChange={(e) => setReporteData({ ...reporteData, cuatrimestre2: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-100 border border-transparent rounded text-gray-600"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm font-bold text-gray-700 block mb-1">Grupo:</label>
                        <input
                          type="text"
                          value={reporteData.grupo2}
                          onChange={(e) => setReporteData({ ...reporteData, grupo2: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-100 border border-transparent rounded text-gray-600"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm font-bold text-gray-700 block mb-1">Nu. de Estudiantes:</label>
                        <input
                          type="text"
                          value={reporteData.numEstudiantes2}
                          onChange={(e) => setReporteData({ ...reporteData, numEstudiantes2: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-100 border border-transparent rounded text-gray-600"
                        />
                      </div>
                    </div>

                    {/* Section 2: Datos del lugar a visitar */}
                    <h3 className="text-lg font-semibold text-gray-800 mt-8 mb-4">Datos del lugar a visitar</h3>
                    
                    <div className="grid grid-cols-12 gap-4 mb-4">
                      <div className="col-span-4">
                        <label className="text-sm font-bold text-gray-700 block mb-1">Nombre de la empresa o actividad:</label>
                        <input
                          type="text"
                          value={reporteData.nombreEmpresa}
                          onChange={(e) => setReporteData({ ...reporteData, nombreEmpresa: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-100 border border-transparent rounded text-gray-600"
                        />
                      </div>
                      <div className="col-span-5">
                        <label className="text-sm font-bold text-gray-700 block mb-1">Lugar o dirección:</label>
                        <input
                          type="text"
                          value={reporteData.lugarDireccion}
                          onChange={(e) => setReporteData({ ...reporteData, lugarDireccion: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-100 border border-transparent rounded text-gray-600"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="text-sm font-bold text-gray-700 block mb-1">Teléfono de contacto:</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={reporteData.telefonoEmpresa}
                            onChange={(e) => setReporteData({ ...reporteData, telefonoEmpresa: e.target.value })}
                            className="w-full px-3 py-2 pl-10 bg-gray-100 border border-transparent rounded text-gray-600"
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">📞</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4 mb-4">
                      <div className="col-span-4">
                        <label className="text-sm font-bold text-gray-700 block mb-1">Correo electrónico:</label>
                        <input
                          type="email"
                          value={reporteData.correoEmpresa}
                          onChange={(e) => setReporteData({ ...reporteData, correoEmpresa: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-100 border border-transparent rounded text-gray-600"
                        />
                      </div>
                      <div className="col-span-4">
                        <label className="text-sm font-bold text-gray-700 block mb-1">Objetivo de la visita:</label>
                        <input
                          type="text"
                          value={reporteData.objetivoVisita}
                          onChange={(e) => setReporteData({ ...reporteData, objetivoVisita: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-100 border border-transparent rounded text-gray-600"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm font-bold text-gray-700 block mb-1">Fecha de inicio:</label>
                        <div className="relative">
                          <input
                            type="date"
                            value={reporteData.fechaInicio}
                            onChange={(e) => setReporteData({ ...reporteData, fechaInicio: e.target.value })}
                            className="w-full px-3 py-2 pr-10 bg-gray-100 border border-transparent rounded text-gray-600"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">📅</span>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm font-bold text-gray-700 block mb-1">Fecha de término:</label>
                        <div className="relative">
                          <input
                            type="date"
                            value={reporteData.fechaTermino}
                            onChange={(e) => setReporteData({ ...reporteData, fechaTermino: e.target.value })}
                            className="w-full px-3 py-2 pr-10 bg-gray-100 border border-transparent rounded text-gray-600"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">📅</span>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Subida de Documentos */}
                    <div className="border border-gray-300 rounded-lg p-6 mt-8">
                      <div className="text-orange-500 text-lg font-bold mb-4">Subida de Documentos y Evidencias</div>
                      <div className="flex items-center font-bold text-sm mb-4">
                        <span className="text-orange-500 mr-2">📷</span>
                        Asignatura que se refuerza con la visita:
                      </div>
                      <div className="flex gap-4">
                        {[1, 2, 3].map((num) => (
                          <div key={num} className="bg-gray-100 w-32 h-28 rounded flex flex-col justify-center items-center cursor-pointer hover:bg-gray-200 transition relative">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, num - 1)}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              disabled={uploadedImages[num - 1] !== undefined}
                            />
                            {uploadedImages[num - 1] ? (
                              <>
                                <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden mb-2">
                                  <img
                                    src={URL.createObjectURL(uploadedImages[num - 1])}
                                    alt={`Foto ${num}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <span className="text-orange-500 font-bold text-sm">Cargada</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveImage(num - 1);
                                  }}
                                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </>
                            ) : (
                              <>
                                <span className="text-3xl text-gray-700 mb-1">+</span>
                                <span className="font-bold text-sm">Foto {num}</span>
                                <span className="text-orange-500 font-bold text-sm">Seleccionar</span>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 mt-3">
                        Imágenes cargadas: {uploadedImages.filter(img => img !== undefined).length}/3 (requerido: 3)
                      </p>
                    </div>

                    {/* Report Document Upload */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                      <div className="text-center">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">Arrastre el documento aquí o seleccione</p>
                        <p className="text-sm text-gray-500 mb-4">PDF, DOC, DOCX (Máx. 10MB)</p>
                        <input
                          type="file"
                          onChange={handleReporteUpload}
                          className="hidden"
                          id="reporte-doc"
                          accept=".pdf,.doc,.docx"
                        />
                        <label
                          htmlFor="reporte-doc"
                          className="inline-block bg-orange-500 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-orange-600 transition font-bold"
                        >
                          Explorar
                        </label>
                        {uploadedReporte && (
                          <p className="mt-4 text-sm text-green-600 font-medium">
                            ✓ {uploadedReporte.name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between mt-8">
                      <button
                        type="button"
                        onClick={() => setShowReporteForm(false)}
                        className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-bold"
                      >
                        Atrás
                      </button>
                      <button
                        type="submit"
                        disabled={uploadedImages.filter(img => img !== undefined).length !== 3 || !uploadedReporte}
                        className="px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-bold disabled:bg-orange-300 disabled:cursor-not-allowed"
                        style={{ width: '70%', maxWidth: '400px' }}
                      >
                        Enviar Reporte a Revisión
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md mx-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">REPORTE ENVIADO CORRECTAMENTE</h3>
            <p className="text-gray-600 mb-6">Tu reporte ha sido enviado y está siendo procesado.</p>
            <button
              onClick={() => setShowSuccess(false)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AreaReportes;
