
export const coerceBooleanValue = (value, attributeName) => {
    return String(value) === 'true' || String(value) === '' || value === attributeName;
    };
    