import React, { useState, useEffect } from 'react';

interface CurrencyInputProps {
    value: string | number;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string; // Allow passing standard classes
    autoFocus?: boolean;
}

export const CurrencyInput = ({ value, onChange, placeholder = "0.00", className, autoFocus }: CurrencyInputProps) => {
    const [displayValue, setDisplayValue] = useState('');

    // Format the incoming value (from parent) into localized string with commas
    useEffect(() => {
        if (value === '' || value === undefined) {
            setDisplayValue('');
        } else {
            // Ensure it's treated as a number string for formatting
            // Standardize input to handle existing commas if any (though logic below strips them)
            const numVal = parseFloat(value.toString().replace(/,/g, ''));
            if (!isNaN(numVal)) {
                // Only format if the user isn't actively typing a partial number like "1." or "1.0" 
                // which might get weirdly auto-formatted. 
                // Actually, simple strategy: Formatted display on BLUR, raw-ish on change?
                // Or Controlled input that adds commas as you type? 

                // Simpler approach for reliability:
                // Use a formatted string. 
                // Keep it simple: standard inputs usually just need to VALIDATE on number.
                // But user ASKED for comma separates.

                // Let's just blindly format it initially if it's a Prop update
                // We will assume 'value' is the raw numeric string (e.g. "1000.50")
                setDisplayValue(numVal.toLocaleString('en-US', { maximumFractionDigits: 20 }));
            } else {
                setDisplayValue(value.toString());
            }
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value;

        // Allow digits, one decimal point, and commas
        // Strip commas for the raw valid number processing
        const rawVal = val.replace(/,/g, '');

        // Validation regex: numbers, optional single decimal
        if (rawVal === '' || /^\d*\.?\d*$/.test(rawVal)) {
            // It's a valid number format so far
            // Update the PARENT with the raw value (no commas)
            onChange(rawVal);

            // Update local display value immediately to what user typed (with commas?)
            // It's hard to keep cursor position if we add commas on the fly.
            // Better strategy typically: Format on Blur, or use a specific library.
            // Since no library:
            // Let user type whatever. formatting happens on blur?
            // Or just format on change if we simply append?

            // Let's rely on standard masking logic:
            // 1. User types "1000" -> see "1000"
            // 2. User types "." -> see "1000."

            // To really support "comma separates" AS YOU TYPE without cursor jumping, is complex.
            // BUT "decimal places" implies formatting.

            // Recommendation: Update display to match input, format on Blur.
            setDisplayValue(val);
        }
    };

    const handleBlur = () => {
        if (displayValue) {
            const rawVal = displayValue.replace(/,/g, '');
            const num = parseFloat(rawVal);
            if (!isNaN(num)) {
                // Format with commas and 2 decimals
                const formatted = num.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
                setDisplayValue(formatted);
                // Update parent to ensure uniformity if needed, though parent likely holds raw string
                onChange(rawVal);
            }
        }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        // When focusing, maybe remove formatting to make editing easier?
        // "1,234.56" -> "1234.56"
        const raw = e.target.value.replace(/,/g, '');
        setDisplayValue(raw);
    };

    return (
        <input
            type="text"
            inputMode="decimal"
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={placeholder}
            className={className}
            autoFocus={autoFocus}
        />
    );
};
