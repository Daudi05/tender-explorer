import React, { useState } from 'react';
import { 
  Button, Badge, Input, Select, Textarea, Modal, Toast, Spinner, EmptyState, ConfirmDialog 
} from './index.js';

export default function SandboxTest() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [budgetValue, setBudgetValue] = useState('600000');
  const [budgetError, setBudgetError] = useState('Value cannot be zero or empty');

  const handleBudgetChange = (e) => {
    const val = e.target.value;
    setBudgetValue(val);
    if (val === '0' || val.trim() === '') {
      setBudgetError('🚨 CRITICAL ERROR: Value cannot be zero or empty!');
    } else {
      setBudgetError('');
    }
  };

  // ... (Paste all your inner HTML structure and styling variables here exactly as they were)
  return (
    <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
       {/* All your sandbox layout sections go here */}
    </div>
  );
}
