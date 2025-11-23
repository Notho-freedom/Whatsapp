"use client";

import React, { useState, useRef, useEffect } from 'react';
import { PenTool, X, RotateCcw, Download, Palette } from 'lucide-react';
import { useAttachments } from '@/hooks/useAttachments';

const DrawingBoard = ({ isOpen, onClose, conversationId, userId }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(2);
  const [tool, setTool] = useState('pen'); // 'pen', 'eraser'
  const [isSaving, setIsSaving] = useState(false);
  
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const { createDrawing } = useAttachments(conversationId, userId);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Définir la taille du canvas
      canvas.width = 600;
      canvas.height = 400;
      
      // Configuration du contexte
      context.lineCap = 'round';
      context.strokeStyle = color;
      context.lineWidth = brushSize;
      
      contextRef.current = context;
      
      // Effacer le canvas
      context.fillStyle = 'white';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [isOpen]);

  const startDrawing = (event) => {
    setIsDrawing(true);
    const { offsetX, offsetY } = event.nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
  };

  const draw = (event) => {
    if (!isDrawing) return;
    
    const { offsetX, offsetY } = event.nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
  };

  const changeColor = (newColor) => {
    setColor(newColor);
    if (contextRef.current) {
      contextRef.current.strokeStyle = newColor;
    }
  };

  const changeBrushSize = (size) => {
    setBrushSize(size);
    if (contextRef.current) {
      contextRef.current.lineWidth = size;
    }
  };

  const changeTool = (newTool) => {
    setTool(newTool);
    if (contextRef.current) {
      if (newTool === 'eraser') {
        contextRef.current.strokeStyle = 'white';
      } else {
        contextRef.current.strokeStyle = color;
      }
    }
  };

  const saveDrawing = async () => {
    if (!canvasRef.current) return;

    setIsSaving(true);
    try {
      const canvas = canvasRef.current;
      canvas.toBlob(async (blob) => {
        const drawingData = {
          title: 'Dessin partagé',
          description: 'Dessin créé dans le chat',
          tags: ['dessin', 'chat'],
          imageBlob: blob
        };

        const result = await createDrawing(drawingData);
        console.log('Dessin sauvegardé:', result);
        onClose();
      }, 'image/png');
    } catch (error) {
      console.error('Erreur sauvegarde dessin:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const downloadDrawing = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'dessin.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[700px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <PenTool size={20} className="mr-2 text-purple-500" />
            Tableau de dessin
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {/* Outils */}
        <div className="flex items-center space-x-4 mb-4 p-3 bg-gray-100 rounded-lg">
          {/* Sélecteur d'outil */}
          <div className="flex space-x-2">
            <button
              onClick={() => changeTool('pen')}
              className={`p-2 rounded ${
                tool === 'pen' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'
              }`}
            >
              <PenTool size={16} />
            </button>
            <button
              onClick={() => changeTool('eraser')}
              className={`p-2 rounded ${
                tool === 'eraser' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'
              }`}
            >
              🧽
            </button>
          </div>

          {/* Sélecteur de couleur */}
          <div className="flex items-center space-x-2">
            <Palette size={16} className="text-gray-600" />
            <input
              type="color"
              value={color}
              onChange={(e) => changeColor(e.target.value)}
              className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
            />
          </div>

          {/* Sélecteur de taille */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Taille:</span>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => changeBrushSize(parseInt(e.target.value))}
              className="w-20"
            />
            <span className="text-sm text-gray-600 w-8">{brushSize}</span>
          </div>

          {/* Bouton effacer */}
          <button
            onClick={clearCanvas}
            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
            title="Effacer le dessin"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        {/* Canvas */}
        <div className="border border-gray-300 rounded-lg overflow-hidden mb-4">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="cursor-crosshair block mx-auto"
            style={{ border: '1px solid #e5e7eb' }}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={downloadDrawing}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center"
          >
            <Download size={16} className="mr-2" />
            Télécharger
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Annuler
          </button>
          <button
            onClick={saveDrawing}
            disabled={isSaving}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50 flex items-center"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sauvegarde...
              </>
            ) : (
              <>
                <PenTool size={16} className="mr-2" />
                Sauvegarder
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DrawingBoard;
