export function securityCheck(): void {
  const required = ['API_ID', 'API_HASH', 'SESSION_STRING'];
  const missing = required.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing);
    console.error('💡 Set them in Render Environment Variables');
    process.exit(1);
  }

  // Check for placeholder values
  const placeholders = [
    'your_api_id_here',
    'your_api_hash_here',
    'your_session_string_here'
  ];

  for (const placeholder of placeholders) {
    if (Object.values(process.env).includes(placeholder)) {
      console.error('❌ SECURITY: Using placeholder credentials!');
      console.error('💡 Set real credentials in Render');
      process.exit(1);
    }
  }

  console.log('✅ Security validation passed');
}
