const mssqlConfig = {
  user: 'techfab',
  password: 'rootroot',
  server: 'localhost',
  database: 'TECHFAB_ERP',
  options: {
    encrypt: true, // Encrypt the connection
    trustServerCertificate: true // Trust the self-signed certificate
  }
}

export default mssqlConfig
