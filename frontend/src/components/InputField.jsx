// components/InputField.jsx
import React from 'react';
import { User, Mail, Lock, Phone, Building, Briefcase, Eye, EyeOff } from 'lucide-react';

const InputField = ({ 
  icon: Icon, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  onKeyPress, 
  placeholder, 
  error, 
  required = false,
  showPassword,
  togglePassword
}) => (
  <div className="input-group">
    <label className="label">
      {placeholder} {required && <span className="required">*</span>}
    </label>
    <div className="input-wrapper">
      <Icon size={20} className="input-icon" />
      <input
        type={type === 'password' && showPassword ? 'text' : type}
        name={name}
        value={value}
        onChange={onChange}
        onKeyPress={onKeyPress}
        className={`input ${error ? 'input-error' : ''}`}
        placeholder={placeholder}
      />
      {type === 'password' && (
        <button
          type="button"
          onClick={togglePassword}
          className="password-toggle"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      )}
    </div>
    {error && <span className="error-text">{error}</span>}
  </div>
);

export default InputField;