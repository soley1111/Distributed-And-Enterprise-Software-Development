export const checkPasswordStrength = (password) => {
    let strength = 0;
    let messages = [];
  
    // Length check
    if (password.length >= 8) strength += 1;
    else messages.push('At least 8 characters');
  
    // Contains numbers
    if (/\d/.test(password)) strength += 1;
    else messages.push('At least one number');
  
    // Contains special characters
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
    else messages.push('At least one special character');
  
    // Contains uppercase letters
    if (/[A-Z]/.test(password)) strength += 1;
    else messages.push('At least one uppercase letter');
  
    // Contains lowercase letters
    if (/[a-z]/.test(password)) strength += 1;
    else messages.push('At least one lowercase letter');
  
    // Determine strength level
    let strengthLevel = '';
    if (strength <= 2) strengthLevel = 'Weak';
    else if (strength <= 4) strengthLevel = 'Medium';
    else strengthLevel = 'Strong';
  
    return {
      strength,
      strengthLevel,
      messages: messages.length > 0 ? messages : []
    };
  };