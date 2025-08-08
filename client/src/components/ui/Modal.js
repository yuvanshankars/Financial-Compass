import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Button from './Button';

/**
 * Modal component for displaying dialogs and popups
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to call when the modal is closed
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} [props.title] - Modal title
 * @param {boolean} [props.showCloseButton=true] - Whether to show the close button in the header
 * @param {React.ReactNode} [props.footer] - Modal footer content
 * @param {string} [props.size='md'] - Modal size (sm, md, lg, xl)
 * @param {boolean} [props.closeOnOverlayClick=true] - Whether to close the modal when clicking the overlay
 */
const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  showCloseButton = true,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
}) => {
  const modalRef = useRef(null);

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  // Determine modal width based on size
  const getModalWidth = () => {
    switch (size) {
      case 'sm': return 'max-w-sm';
      case 'md': return 'max-w-md';
      case 'lg': return 'max-w-lg';
      case 'xl': return 'max-w-xl';
      case '2xl': return 'max-w-2xl';
      case 'full': return 'max-w-full mx-4';
      default: return 'max-w-md';
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 transition-opacity"
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
    >
      <div 
        ref={modalRef}
        className={`${getModalWidth()} w-full bg-white rounded-lg shadow-xl overflow-hidden transition-all transform`}
      >
        {/* Modal header */}
        {(title || showCloseButton) && (
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
            {showCloseButton && (
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={onClose}
                aria-label="Close"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Modal body */}
        <div className="px-6 py-4">
          {children}
        </div>

        {/* Modal footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-2">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

/**
 * Modal.Footer - Predefined footer with Cancel and Confirm buttons
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onCancel - Function to call when Cancel is clicked
 * @param {Function} props.onConfirm - Function to call when Confirm is clicked
 * @param {string} [props.cancelText='Cancel'] - Text for the Cancel button
 * @param {string} [props.confirmText='Confirm'] - Text for the Confirm button
 * @param {boolean} [props.isLoading=false] - Whether the confirm button is in loading state
 * @param {string} [props.confirmVariant='primary'] - Variant for the confirm button
 */
Modal.Footer = ({
  onCancel,
  onConfirm,
  cancelText = 'Cancel',
  confirmText = 'Confirm',
  isLoading = false,
  confirmVariant = 'primary',
}) => {
  return (
    <>
      <Button variant="secondary" onClick={onCancel}>
        {cancelText}
      </Button>
      <Button 
        variant={confirmVariant} 
        onClick={onConfirm} 
        isLoading={isLoading}
      >
        {confirmText}
      </Button>
    </>
  );
};

export default Modal;