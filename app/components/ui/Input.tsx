"use client";

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: string;
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const errorStyle: React.CSSProperties = {
  marginTop: "4px",
  fontSize: "12px",
  color: "var(--c-danger)",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, style, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        {label && <label htmlFor={inputId} className="hub-label">{label}</label>}
        <div style={{ position: "relative" }}>
          {icon && (
            <i
              className={`ti ${icon}`}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-faint)",
                fontSize: "16px",
                pointerEvents: "none",
              }}
            />
          )}
          <input
            ref={ref}
            id={inputId}
            className="hub-input"
            style={{
              paddingLeft: icon ? "36px" : undefined,
              borderColor: error ? "var(--c-danger)" : undefined,
              ...style,
            }}
            {...props}
          />
        </div>
        {error && <span style={errorStyle}>{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, style, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        {label && <label htmlFor={inputId} className="hub-label">{label}</label>}
        <textarea
          ref={ref}
          id={inputId}
          className="hub-input"
          style={{
            resize: "vertical",
            minHeight: "100px",
            borderColor: error ? "var(--c-danger)" : undefined,
            ...style,
          }}
          {...props}
        />
        {error && <span style={errorStyle}>{error}</span>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
