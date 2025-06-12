// Add these two lines to fix the worker loading issue
import pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker.js?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;