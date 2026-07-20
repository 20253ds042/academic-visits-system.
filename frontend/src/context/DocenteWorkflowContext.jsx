import React, { createContext, useContext, useState, useEffect } from 'react';

const DocenteWorkflowContext = createContext(null);

export const DocenteWorkflowProvider = ({ children }) => {
  const [currentRequest, setCurrentRequest] = useState(null);
  const [requests, setRequests] = useState([]);
  const [workflowStep, setWorkflowStep] = useState('inicio');

  // Workflow steps: inicio -> solicitud -> area_solicitudes -> carta_responsiva -> area_reportes -> reporte -> historico

  useEffect(() => {
    // Load requests from localStorage on mount
    const savedRequests = localStorage.getItem('docenteRequests');
    if (savedRequests) {
      setRequests(JSON.parse(savedRequests));
    }
  }, []);

  useEffect(() => {
    // Save requests to localStorage whenever they change
    localStorage.setItem('docenteRequests', JSON.stringify(requests));
  }, [requests]);

  const createRequest = (requestData) => {
    const newRequest = {
      id: Date.now(),
      ...requestData,
      status: 'solicitud_creada',
      workflowStep: 'area_solicitudes',
      createdAt: new Date().toISOString(),
      documents: [],
      images: [],
      history: [
        {
          status: 'Solicitud creada',
          timestamp: new Date().toISOString(),
          notes: 'Solicitud inicial creada'
        }
      ]
    };
    setRequests([...requests, newRequest]);
    setCurrentRequest(newRequest);
    setWorkflowStep('area_solicitudes');
    return newRequest;
  };

  const updateRequestStatus = (requestId, newStatus, notes = '') => {
    const updatedRequests = requests.map(req => {
      if (req.id === requestId) {
        const updatedHistory = [
          ...req.history,
          {
            status: newStatus,
            timestamp: new Date().toISOString(),
            notes: notes || `Estado cambiado a ${newStatus}`
          }
        ];
        return { ...req, status: newStatus, history: updatedHistory };
      }
      return req;
    });
    setRequests(updatedRequests);
    
    if (currentRequest && currentRequest.id === requestId) {
      setCurrentRequest(updatedRequests.find(r => r.id === requestId));
    }
  };

  const uploadDocument = (requestId, documentData) => {
    const updatedRequests = requests.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          documents: [...req.documents, documentData]
        };
      }
      return req;
    });
    setRequests(updatedRequests);
    
    if (currentRequest && currentRequest.id === requestId) {
      setCurrentRequest(updatedRequests.find(r => r.id === requestId));
    }
  };

  const uploadImages = (requestId, imageData) => {
    const updatedRequests = requests.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          images: [...req.images, ...imageData]
        };
      }
      return req;
    });
    setRequests(updatedRequests);
    
    if (currentRequest && currentRequest.id === requestId) {
      setCurrentRequest(updatedRequests.find(r => r.id === requestId));
    }
  };

  const moveToNextStep = (requestId) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    let nextStep = request.workflowStep;
    let newStatus = request.status;

    switch (request.workflowStep) {
      case 'area_solicitudes':
        // Move to area_reportes if approved by Estadías or if carta_responsiva is uploaded
        if (request.status === 'solicitud_aprobada' || request.documents.some(doc => doc.type === 'carta_responsiva')) {
          nextStep = 'area_reportes';
          newStatus = request.status === 'solicitud_aprobada' ? 'solicitud_aprobada' : 'carta_responsiva_enviada';
        }
        break;
      case 'area_reportes':
        if (request.images.length === 3 && request.documents.some(doc => doc.type === 'reporte')) {
          nextStep = 'evaluacion_reporte';
          newStatus = 'reporte_enviado';
        }
        break;
      case 'evaluacion_reporte':
        if (request.status === 'reporte_aprobado') {
          nextStep = 'historico';
          newStatus = 'visita_concretada';
        }
        break;
      default:
        break;
    }

    if (nextStep !== request.workflowStep) {
      const updatedRequests = requests.map(req => {
        if (req.id === requestId) {
          return {
            ...req,
            workflowStep: nextStep,
            status: newStatus,
            history: [
              ...req.history,
              {
                status: newStatus,
                timestamp: new Date().toISOString(),
                notes: `Movido a ${nextStep}`
              }
            ]
          };
        }
        return req;
      });
      setRequests(updatedRequests);
      setWorkflowStep(nextStep);
      
      if (currentRequest && currentRequest.id === requestId) {
        setCurrentRequest(updatedRequests.find(r => r.id === requestId));
      }
    }
  };

  const getRequestById = (requestId) => {
    return requests.find(r => r.id === requestId);
  };

  const getRequestsByStep = (step) => {
    return requests.filter(r => r.workflowStep === step);
  };

  const value = {
    currentRequest,
    requests,
    workflowStep,
    setWorkflowStep,
    setCurrentRequest,
    createRequest,
    updateRequestStatus,
    uploadDocument,
    uploadImages,
    moveToNextStep,
    getRequestById,
    getRequestsByStep
  };

  return (
    <DocenteWorkflowContext.Provider value={value}>
      {children}
    </DocenteWorkflowContext.Provider>
  );
};

export const useDocenteWorkflow = () => {
  const context = useContext(DocenteWorkflowContext);
  if (!context) {
    throw new Error('useDocenteWorkflow must be used within a DocenteWorkflowProvider');
  }
  return context;
};
