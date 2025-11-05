import React from 'react';
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    maxLength?: number;
    showCharCount?: boolean;
    isPassword?: boolean;
}
declare const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;
export default Input;
//# sourceMappingURL=Input.d.ts.map